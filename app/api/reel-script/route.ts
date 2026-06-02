import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import grok from '@/lib/grok';
import { getGroqClient } from '@/lib/groq';
import { getUserFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import type { ReelScript } from '@/types/database';

const allowedDurations = ['15', '30', '60'] as const;
const GROQ_FALLBACK_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';

function cleanJsonText(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function isReelScript(value: unknown): value is ReelScript {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ReelScript>;
  return (
    typeof item.hook === 'string' &&
    typeof item.cta === 'string' &&
    typeof item.duration === 'string' &&
    Array.isArray(item.talkingPoints) &&
    item.talkingPoints.every((point) => typeof point === 'string') &&
    Array.isArray(item.visualSuggestions) &&
    item.visualSuggestions.every((point) => typeof point === 'string')
  );
}

function parseScript(text: string): ReelScript {
  const parsed = JSON.parse(cleanJsonText(text)) as unknown;
  if (!isReelScript(parsed)) {
    throw new Error('Invalid reel script response');
  }

  return parsed;
}

function saveScriptNonBlocking(businessType: string, topic: string, tone: string, script: ReelScript) {
  void (async () => {
    try {
      const { error } = await createServerSupabase().from('reel_scripts').insert({
        user_id: null,
        client_id: null,
        business_type: businessType,
        topic,
        tone,
        script,
      });

      if (error) {
        console.error('Reel script save failed', error);
      }
    } catch (error) {
      console.error('Reel script save failed', error);
    }
  })();
}

function buildPrompt(businessType: string, topic: string, tone: string, duration: string): string {
  return `Write a complete ${duration}-second Instagram reel script for an Indian ${businessType} business.

Topic: ${topic}
Tone: ${tone}
Audience: Indian local business customers

The script should feel authentic for a local Indian audience, with practical visual direction and a strong action at the end.

Return ONLY valid JSON, no markdown, no backticks:
{
  "hook": "...",
  "talkingPoints": ["...", "..."],
  "cta": "...",
  "duration": "${duration} seconds",
  "visualSuggestions": ["...", "..."]
}`;
}

async function createScriptCompletion(businessType: string, topic: string, tone: string, duration: string) {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an Indian short-form video scriptwriter for local businesses. Return strict JSON only.',
    },
    { role: 'user' as const, content: buildPrompt(businessType, topic, tone, duration) },
  ];

  try {
    return await grok.chat.completions.create({
      model: 'grok-3-mini',
      max_tokens: 1800,
      temperature: 0.8,
      response_format: { type: 'text' },
      messages,
    });
  } catch (error) {
    if (process.env.GROQ_API_KEY && shouldUseGroqFallback(error)) {
      console.warn('xAI reel script request failed, retrying with Groq fallback provider');
      return getGroqClient().chat.completions.create({
        model: GROQ_FALLBACK_MODEL,
        max_tokens: 1800,
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
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const tone = typeof body.tone === 'string' ? body.tone.trim() : 'motivational';
    const rawDuration = typeof body.duration === 'string' ? body.duration.replace(/\D/g, '') : '30';
    const duration = allowedDurations.includes(rawDuration as (typeof allowedDurations)[number])
      ? rawDuration
      : '30';

    if (!businessType || !topic) {
      return NextResponse.json({ error: 'Business type and topic are required' }, { status: 400 });
    }

    const completion = await createScriptCompletion(businessType, topic, tone, duration);

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    let script: ReelScript;
    try {
      script = parseScript(text);
    } catch (error) {
      console.error('Failed to parse reel script response', { error, text });
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    saveScriptNonBlocking(businessType, topic, tone, script);

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Reel script API failed', error);
    return NextResponse.json({ error: 'Failed to generate reel script' }, { status: 500 });
  }
}
