import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import grok from '@/lib/grok';
import { getGroqClient } from '@/lib/groq';
import { getUserFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import type { ContentIdea } from '@/types/database';

const allowedCounts = [15, 20, 30] as const;
const GROQ_FALLBACK_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';

function cleanJsonText(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function isContentIdea(value: unknown): value is ContentIdea {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ContentIdea>;
  return (
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.hook === 'string' &&
    (item.format === 'post' || item.format === 'reel' || item.format === 'story')
  );
}

function parseIdeas(text: string): ContentIdea[] {
  const parsed = JSON.parse(cleanJsonText(text)) as { ideas?: unknown };

  if (!parsed || !Array.isArray(parsed.ideas) || !parsed.ideas.every(isContentIdea)) {
    throw new Error('Invalid ideas response');
  }

  return parsed.ideas;
}

function saveIdeasNonBlocking(businessType: string, ideas: ContentIdea[]) {
  void (async () => {
    try {
      const { error } = await createServerSupabase().from('content_ideas').insert({
        user_id: null,
        client_id: null,
        business_type: businessType,
        ideas,
      });

      if (error) {
        console.error('Content ideas save failed', error);
      }
    } catch (error) {
      console.error('Content ideas save failed', error);
    }
  })();
}

function buildPrompt(businessType: string, count: number): string {
  return `Generate ${count} content ideas for an Indian ${businessType} business.

Make the ideas specific to Indian market behavior, local culture, common festivals, seasonal moments, and neighborhood buying patterns.
Mix formats roughly as 40% reels, 40% posts, and 20% stories.

Each idea must include:
- title
- description
- format: post, reel, or story
- hook

Return ONLY valid JSON, no markdown, no backticks:
{
  "ideas": [
    {
      "title": "...",
      "description": "...",
      "format": "reel",
      "hook": "..."
    }
  ]
}`;
}

async function createIdeasCompletion(businessType: string, count: number) {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an Indian social media strategist for local businesses. Return strict JSON only.',
    },
    { role: 'user' as const, content: buildPrompt(businessType, count) },
  ];

  try {
    return await grok.chat.completions.create({
      model: 'grok-3-mini',
      max_tokens: 3500,
      temperature: 0.8,
      response_format: { type: 'text' },
      messages,
    });
  } catch (error) {
    if (process.env.GROQ_API_KEY && shouldUseGroqFallback(error)) {
      console.warn('xAI ideas request failed, retrying with Groq fallback provider');
      return getGroqClient().chat.completions.create({
        model: GROQ_FALLBACK_MODEL,
        max_tokens: 3500,
        temperature: 0.8,
        messages,
      });
    }

    throw error;
  }
}

function shouldUseGroqFallback(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return [402, 403, 408, 429, 500, 502, 503, 504].includes(error.status || 0);
  }

  if (!error || typeof error !== 'object') return false;
  const status = Number((error as { status?: unknown }).status);
  return [402, 403, 408, 429, 500, 502, 503, 504].includes(status);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const businessType = typeof body.businessType === 'string' ? body.businessType.trim() : '';
    const requestedCount = Number(body.count || 15);
    const count = allowedCounts.includes(requestedCount as (typeof allowedCounts)[number]) ? requestedCount : 15;

    if (!businessType) {
      return NextResponse.json({ error: 'Business type is required' }, { status: 400 });
    }

    const completion = await createIdeasCompletion(businessType, count);

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    let ideas: ContentIdea[];
    try {
      ideas = parseIdeas(text);
    } catch (error) {
      console.error('Failed to parse ideas response', { error, text });
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    saveIdeasNonBlocking(businessType, ideas);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Ideas API failed', error);
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 });
  }
}
