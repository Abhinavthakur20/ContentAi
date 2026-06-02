import { NextRequest, NextResponse } from 'next/server';
import grok from '@/lib/grok';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = (await req.json()) as { transcript: string };

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const completion = await grok.chat.completions.create({
      model: 'grok-3-mini',
      max_tokens: 1000,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `You are an expert Indian social media content creator.
You receive raw audio transcripts — often Hinglish (mix of Hindi and English) —
and turn them into polished, engaging Instagram captions.
Fix grammar naturally, add emojis where they feel right, make it punchy.
Keep the original language mix intact — do not force pure English.
Sound authentic, not corporate.`,
        },
        {
          role: 'user',
          content: `Here is a raw transcript from a reel or video:

---
${transcript.slice(0, 2000)}
---

Turn this into a polished Instagram caption. Keep it authentic and engaging.
Add 1 strong CTA at the end. Add 12 relevant hashtags (mix popular + niche).

Return ONLY valid JSON, no markdown, no backticks:
{
  "caption": "the polished caption with emojis",
  "cta": "one punchy call to action line",
  "hashtags": ["#tag1", "#tag2", ...]
}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned) as {
        caption: string;
        cta: string;
        hashtags: string[];
      };

      if (!parsed.caption || !parsed.cta || !Array.isArray(parsed.hashtags)) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response. Try again.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Polish captions error:', error);
    return NextResponse.json({ error: 'Failed to polish captions. Try again.' }, { status: 500 });
  }
}
