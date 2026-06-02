'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import type { ContentIdea } from '@/types/database';

const businessOptions = [
  { value: '', label: 'Select business type' },
  { value: 'gym', label: 'Gym / Fitness Studio' },
  { value: 'salon', label: 'Salon & Beauty Parlour' },
  { value: 'cafe', label: 'Cafe & Coffee Shop' },
  { value: 'restaurant', label: 'Restaurant / Dhaba' },
  { value: 'dental', label: 'Dental Clinic' },
  { value: 'realestate', label: 'Real Estate Agent' },
  { value: 'coaching', label: 'Coaching Institute' },
  { value: 'clothing', label: 'Clothing Store' },
];

const counts = [15, 20, 30];

export default function IdeasClient() {
  const router = useRouter();
  const [businessType, setBusinessType] = useState('');
  const [count, setCount] = useState(15);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateIdeas = async () => {
    if (!businessType) {
      setError('Business type is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setIdeas([]);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, count }),
      });
      const data = (await response.json()) as { ideas?: ContentIdea[]; error?: string };

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate ideas');
      }

      setIdeas(data.ideas || []);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Failed to generate ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const copyIdea = async (idea: ContentIdea) => {
    await navigator.clipboard.writeText(
      `${idea.title}\n\n${idea.description}\n\nHook: ${idea.hook}\nFormat: ${idea.format}`,
    );
  };

  const goToCaptionGenerator = () => {
    sessionStorage.setItem('ideaBusinessType', businessType);
    router.push('/generator');
  };

  return (
    <main className="min-h-screen bg-off-white text-black">
      <Navbar />
      <section className="border-b border-black px-5 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">ContentAI Idea Desk</div>
          <h1 className="mt-4 font-display text-[clamp(3.8rem,7vw,6.5rem)] leading-[0.92] text-black">
            POST IDEA GENERATOR
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="grid gap-4 border border-black p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
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

          <div>
            <div className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Count</div>
            <div className="grid grid-cols-3 border border-black">
              {counts.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCount(option)}
                  className={`px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
                    count === option ? 'bg-acid text-black' : 'bg-transparent text-mid hover:bg-black hover:text-off-white'
                  } ${option !== counts[counts.length - 1] ? 'border-r border-black' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={generateIdeas}
            disabled={isLoading}
            className="border border-black bg-black px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black disabled:bg-mid disabled:text-off-white"
          >
            {isLoading ? 'Generating' : 'Generate'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 border border-black px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea, index) => (
            <article key={`${idea.title}-${index}`} className="flex min-h-[300px] flex-col border border-black bg-off-white">
              <div className="flex items-center justify-between border-b border-black bg-black px-4 py-3">
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-acid">{idea.format}</span>
                <span className="font-display text-3xl leading-none text-off-white">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-display text-4xl leading-none text-black">{idea.title}</h2>
                <p className="mt-4 font-body text-[0.9rem] leading-[1.6] text-mid">{idea.description}</p>
                <div className="mt-5 border border-black">
                  <div className="border-b border-black bg-black px-3 py-2 font-mono text-[0.54rem] uppercase tracking-[0.12em] text-acid">
                    Hook
                  </div>
                  <p className="p-3 font-body text-[0.88rem] leading-[1.55] text-black">{idea.hook}</p>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      void copyIdea(idea);
                    }}
                    className="border border-black bg-transparent px-3 py-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={goToCaptionGenerator}
                    className="border border-black bg-black px-3 py-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
                  >
                    Generate Caption
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
