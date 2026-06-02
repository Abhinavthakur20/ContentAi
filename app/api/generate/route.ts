import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import OpenAI from 'openai';
import grok from '@/lib/grok';
import { getGroqClient } from '@/lib/groq';
import { getUserFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import type { ContentVariation, GenerateRequest, GenerateResponse } from '@/types';

const GROQ_FALLBACK_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';

const systemPrompt = `You are an expert Indian social media content creator specializing in
viral content for local businesses. You understand Indian culture, Hinglish
nuances, local festivals, and what resonates with Indian customers on Instagram.
Always generate authentic, relatable content that feels local — not generic.`;

function cleanJsonText(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function isContentVariation(value: unknown): value is ContentVariation {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ContentVariation>;
  return (
    typeof candidate.caption === 'string' &&
    typeof candidate.cta === 'string' &&
    typeof candidate.reelHook === 'string' &&
    Array.isArray(candidate.hashtags) &&
    candidate.hashtags.every((tag) => typeof tag === 'string')
  );
}

function validateResponse(value: unknown): GenerateResponse {
  if (!value || typeof value !== 'object') {
    throw new Error('Unexpected response format');
  }

  const candidate = value as Partial<GenerateResponse>;
  if (!Array.isArray(candidate.variations) || candidate.variations.length !== 3) {
    throw new Error('Unexpected response format');
  }

  if (!candidate.variations.every(isContentVariation)) {
    throw new Error('Unexpected response format');
  }

  return { variations: candidate.variations };
}

function buildUserPrompt({ businessType, tone, offer, platform }: GenerateRequest): string {
  return `Generate 3 distinct variations of ${platform} content for a ${businessType} business.

Tone: ${tone}
${offer ? `Special offer to highlight: ${offer}` : 'No special offer — focus on brand value'}
Target audience: Indian local customers

For EACH of the 3 variations provide:
1. Caption (2-4 lines, engaging, with relevant emojis, feels authentic)
2. Call to Action (1 punchy line — e.g. DM, call, visit, link in bio)
3. Reel Hook (1 opening line that stops the scroll — bold, curious, or surprising)
4. Hashtags (15 hashtags: mix of popular + niche + location-based Indian tags)

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation, no backticks.
Exact format:
{
  "variations": [
    {
      "caption": "...",
      "cta": "...",
      "reelHook": "...",
      "hashtags": ["#tag1", "#tag2", ...]
    },
    { ... },
    { ... }
  ]
}`;
}

async function createCompletion(model: string, request: GenerateRequest) {
  return grok.chat.completions.create({
    model,
    max_tokens: 2000,
    temperature: 0.8,
    response_format: { type: 'text' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(request) },
    ],
  });
}

async function createGroqFallbackCompletion(request: GenerateRequest) {
  return getGroqClient().chat.completions.create({
    model: GROQ_FALLBACK_MODEL,
    max_tokens: 2000,
    temperature: 0.8,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(request) },
    ],
  });
}

function shouldUseGroqFallback(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return [402, 403, 408, 429, 500, 502, 503, 504].includes(error.status || 0);
  }

  if (!error || typeof error !== 'object') return false;
  const status = Number((error as { status?: unknown }).status);
  return [402, 403, 408, 429, 500, 502, 503, 504].includes(status);
}

function saveGeneratedContentNonBlocking(request: NextRequest, body: GenerateRequest, variations: ContentVariation[]) {
  void (async () => {
    try {
      const user = await getUserFromRequest(request);
      const userId = user && 'id' in user ? String(user.id) : null;
      const { error } = await createServerSupabase().from('generated_content').insert({
        user_id: userId,
        client_id: null,
        business_type: body.businessType,
        tone: body.tone,
        platform: body.platform,
        offer: body.offer || null,
        variations,
        selected_variation: 0,
        status: 'draft',
      });

      if (error) {
        console.error('Generated content save failed', error);
      }
    } catch (error) {
      console.error('Generated content save failed', error);
    }
  })();
}

export async function POST(request: NextRequest) {
  if (!process.env.XAI_API_KEY && !process.env.GROQ_API_KEY) {
    console.error('No AI provider key is configured');
    return NextResponse.json({ variations: [], error: 'Service configuration error' }, { status: 500 });
  }

  let body: GenerateRequest;

  try {
    body = (await request.json()) as GenerateRequest;
  } catch (error) {
    console.error('Invalid request JSON', error);
    return NextResponse.json({ variations: [], error: 'Unexpected response format' }, { status: 400 });
  }

  try {
    let completion;

    try {
      if (!process.env.XAI_API_KEY) {
        completion = await createGroqFallbackCompletion(body);
      } else {
        try {
          completion = await createCompletion('grok-3-mini', body);
        } catch (error) {
          if (error instanceof OpenAI.APIError && error.status === 404) {
            completion = await createCompletion('grok-beta', body);
          } else if (process.env.GROQ_API_KEY && shouldUseGroqFallback(error)) {
            console.warn('xAI request failed, retrying with Groq fallback provider');
            completion = await createGroqFallbackCompletion(body);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      throw error;
    }

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      console.error('Empty AI response', completion);
      return NextResponse.json({ variations: [], error: 'Unexpected response format' }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJsonText(text));
    } catch (error) {
      console.error('Failed to parse AI response', { error, text });
      return NextResponse.json({ variations: [], error: 'Failed to parse AI response, try again' }, { status: 500 });
    }

    try {
      const response = validateResponse(parsed);
      saveGeneratedContentNonBlocking(request, body, response.variations);
      return NextResponse.json(response);
    } catch (error) {
      console.error('AI response validation failed', { error, parsed });
      return NextResponse.json({ variations: [], error: 'Unexpected response format' }, { status: 500 });
    }
  } catch (error) {
    console.error('AI service error', error);
    return NextResponse.json({ variations: [], error: 'AI service temporarily unavailable' }, { status: 503 });
  }
}
