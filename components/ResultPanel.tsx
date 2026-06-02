'use client';

import { useEffect, useState } from 'react';
import type { ContentVariation, ToastState } from '@/types';
import VariationCard from './VariationCard';

interface ResultPanelProps {
  variations: ContentVariation[];
  isLoading: boolean;
  errorMessage: string;
  onRegenerate: () => void;
}

export default function ResultPanel({ variations, isLoading, errorMessage, onRegenerate }: ResultPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });

  useEffect(() => {
    setActiveIndex(0);
  }, [variations]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    window.setTimeout(() => setToast({ visible: false, message: '' }), 1800);
  };

  const copyText = async (text: string, message = 'Copied to clipboard') => {
    await navigator.clipboard.writeText(text);
    showToast(message);
  };

  const activeVariation = variations[activeIndex];

  return (
    <section className="relative min-h-[520px] border-t border-black bg-off-white px-4 py-10 md:px-8">
      {variations.length === 0 ? (
        <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
          <div className="font-display text-8xl leading-none text-black opacity-30">AI</div>
          <div className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-mid">
            {isLoading ? 'Generating content' : 'Fill the form → Hit generate'}
          </div>
          {errorMessage ? (
            <div className="mt-4 max-w-xs border border-black px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-black">
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center gap-2">
            <span className="font-display text-[1.1rem] leading-none text-acid">02</span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Your Content</span>
          </div>

          <div className="mb-5 flex border border-black">
            {variations.map((variation, index) => {
              const active = activeIndex === index;
              return (
                <button
                  key={`${variation.reelHook}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex-1 px-2 py-2 font-mono text-[0.6rem] uppercase tracking-[0.08em] ${
                    index < variations.length - 1 ? 'border-r border-black' : ''
                  } ${active ? 'bg-black text-acid' : 'bg-transparent text-mid hover:bg-border-muted'}`}
                >
                  Variation {index + 1}
                </button>
              );
            })}
          </div>

          {activeVariation ? (
            <VariationCard
              variation={activeVariation}
              onCopy={copyText}
              onRegenerate={onRegenerate}
              isLoading={isLoading}
            />
          ) : null}
        </div>
      )}

      {toast.visible ? (
        <div className="toast-slide fixed bottom-5 right-5 z-50 border border-acid bg-black px-[18px] py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-acid">
          {toast.message}
        </div>
      ) : null}
    </section>
  );
}
