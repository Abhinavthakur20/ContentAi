'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import type { ReelScript } from '@/types/database';
import type { GenerateRequest } from '@/types';

type Tone = GenerateRequest['tone'];

const businessOptions = [
  { value: '', label: 'Select business type' },
  { value: 'gym', label: 'Gym / Fitness Studio' },
  { value: 'salon', label: 'Salon & Beauty Parlour' },
  { value: 'cafe', label: 'Cafe & Coffee Shop' },
  { value: 'restaurant', label: 'Restaurant / Dhaba' },
  { value: 'dental clinic', label: 'Dental Clinic' },
  { value: 'real estate agent', label: 'Real Estate Agent' },
  { value: 'coaching institute', label: 'Coaching Institute' },
  { value: 'clothing store', label: 'Clothing Store' },
];

const tones: Array<{ value: Tone; label: string }> = [
  { value: 'motivational', label: 'Motivational' },
  { value: 'fun', label: 'Fun' },
  { value: 'professional', label: 'Professional' },
  { value: 'trendy', label: 'Trendy' },
];

const durations = ['15', '30', '60'];

export default function ScriptsClient() {
  const [businessType, setBusinessType] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>('motivational');
  const [duration, setDuration] = useState('30');
  const [script, setScript] = useState<ReelScript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateScript = async () => {
    if (!businessType || !topic.trim()) {
      setError('Business type and topic are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setScript(null);

    try {
      const response = await fetch('/api/reel-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, topic: topic.trim(), tone, duration }),
      });
      const data = (await response.json()) as { script?: ReelScript; error?: string };

      if (!response.ok || data.error || !data.script) {
        throw new Error(data.error || 'Failed to generate reel script');
      }

      setScript(data.script);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Failed to generate reel script');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const fullScript = script
    ? `Hook:\n${script.hook}\n\nTalking Points:\n${script.talkingPoints.join('\n')}\n\nCTA:\n${script.cta}\n\nVisual Suggestions:\n${script.visualSuggestions.join('\n')}\n\nDuration: ${script.duration}`
    : '';

  return (
    <main className="min-h-screen bg-off-white text-black">
      <Navbar />
      <section className="border-b border-black px-5 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">ContentAI Script Room</div>
          <h1 className="mt-4 font-display text-[clamp(3.8rem,7vw,6.5rem)] leading-[0.92] text-black">
            REEL SCRIPT GENERATOR
          </h1>
        </div>
      </section>

      <section className="grid border-b border-black md:grid-cols-[0.85fr_1.15fr]">
        <div className="border-b border-black px-5 py-8 md:border-b-0 md:border-r md:px-10">
          <div className="grid gap-6">
            <label>
              <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">
                Business Type
              </span>
              <select
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
              >
                {businessOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.value === ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Topic</span>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. monsoon offer, client transformation, new batch launch"
                className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none placeholder:text-mid focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
              />
            </label>

            <div>
              <div className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Tone</div>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTone(option.value)}
                    className={`border px-3 py-3 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
                      tone === option.value
                        ? 'border-black bg-black text-acid'
                        : 'border-border-muted bg-transparent text-mid hover:border-black hover:text-black'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Duration</div>
              <div className="grid grid-cols-3 border border-black">
                {durations.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDuration(option)}
                    className={`px-3 py-3 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
                      duration === option
                        ? 'bg-acid text-black'
                        : 'bg-transparent text-mid hover:bg-black hover:text-off-white'
                    } ${option !== durations[durations.length - 1] ? 'border-r border-black' : ''}`}
                  >
                    {option}s
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="border border-black px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={generateScript}
              disabled={isLoading}
              className="border border-black bg-black px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black disabled:bg-mid disabled:text-off-white"
            >
              {isLoading ? 'Generating' : 'Generate Script'}
            </button>
          </div>
        </div>

        <div className="px-5 py-8 md:px-10">
          {script ? (
            <div className="grid gap-5">
              <div className="w-fit border border-black bg-acid px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-black">
                {script.duration}
              </div>
              <ScriptBlock label="Hook" text={script.hook} onCopy={() => copyText(script.hook)} />
              <ScriptBlock
                label="Talking Points"
                text={script.talkingPoints.join('\n')}
                onCopy={() => copyText(script.talkingPoints.join('\n'))}
              />
              <ScriptBlock label="CTA" text={script.cta} onCopy={() => copyText(script.cta)} />
              <ScriptBlock
                label="Visual Suggestions"
                text={script.visualSuggestions.join('\n')}
                onCopy={() => copyText(script.visualSuggestions.join('\n'))}
              />
              <button
                type="button"
                onClick={() => {
                  void copyText(fullScript);
                }}
                className="border border-black bg-black px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
              >
                Copy Full Script
              </button>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center border border-black px-6 text-center">
              <div>
                <div className="font-display text-5xl leading-none text-black">SCRIPT OUTPUT</div>
                <p className="mt-3 max-w-md font-body text-[0.92rem] leading-[1.65] text-mid">
                  Generate a topic-led reel script with hook, talking points, CTA, and shot direction.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ScriptBlock({ label, text, onCopy }: { label: string; text: string; onCopy: () => Promise<void> }) {
  return (
    <div className="border border-black">
      <div className="flex items-center justify-between gap-3 bg-black px-3 py-2">
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-acid">{label}</span>
        <button
          type="button"
          onClick={() => {
            void onCopy();
          }}
          className="border border-acid bg-transparent px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-acid hover:bg-acid hover:text-black"
        >
          Copy
        </button>
      </div>
      <p className="whitespace-pre-line p-4 font-body text-[0.92rem] leading-[1.65] text-black">{text}</p>
    </div>
  );
}
