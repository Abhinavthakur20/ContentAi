'use client';

import type { ContentVariation } from '@/types';

interface VariationCardProps {
  variation: ContentVariation;
  isLoading: boolean;
  onCopy: (text: string, message?: string) => Promise<void>;
  onRegenerate: () => void;
}

interface ContentBlockProps {
  label: string;
  children: React.ReactNode;
  copyText: string;
  onCopy: (text: string, message?: string) => Promise<void>;
}

function ContentBlock({ label, children, copyText, onCopy }: ContentBlockProps) {
  return (
    <div className="border border-black">
      <div className="flex items-center justify-between bg-black px-3 py-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-acid">{label}</span>
        <button
          type="button"
          onClick={() => onCopy(copyText)}
          className="border-0 bg-transparent font-mono text-[0.58rem] uppercase tracking-[0.12em] text-acid"
        >
          Copy
        </button>
      </div>
      <div className="p-3 font-body text-[0.85rem] leading-[1.6] text-black">{children}</div>
    </div>
  );
}

export default function VariationCard({ variation, isLoading, onCopy, onRegenerate }: VariationCardProps) {
  const allText = `CAPTION:
${variation.caption}

CTA:
${variation.cta}

REEL HOOK:
${variation.reelHook}

HASHTAGS:
${variation.hashtags.join(' ')}`;

  return (
    <div className="space-y-4">
      <ContentBlock label="CAPTION" copyText={variation.caption} onCopy={onCopy}>
        {variation.caption.split('\n').map((line, index) => (
          <span key={`${line}-${index}`}>
            {line}
            {index < variation.caption.split('\n').length - 1 ? <br /> : null}
          </span>
        ))}
      </ContentBlock>

      <ContentBlock label="CALL TO ACTION" copyText={variation.cta} onCopy={onCopy}>
        {variation.cta}
      </ContentBlock>

      <ContentBlock label="REEL HOOK" copyText={variation.reelHook} onCopy={onCopy}>
        <em>{variation.reelHook}</em>
      </ContentBlock>

      <div className="border border-black">
        <div className="flex items-center justify-between bg-black px-3 py-2">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-acid">HASHTAGS</span>
          <button
            type="button"
            onClick={() => onCopy(variation.hashtags.join(' '))}
            className="border-0 bg-transparent font-mono text-[0.58rem] uppercase tracking-[0.12em] text-acid"
          >
            Copy
          </button>
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          {variation.hashtags.map((hashtag) => (
            <button
              key={hashtag}
              type="button"
              onClick={() => onCopy(hashtag)}
              className="border border-border-muted bg-transparent px-2 py-[3px] font-mono text-[0.6rem] text-mid hover:border-black hover:bg-acid hover:text-black"
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          className="border border-black bg-transparent px-3 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white disabled:text-mid"
        >
          ↺ Regen
        </button>
        <button
          type="button"
          onClick={() => onCopy(allText)}
          className="col-span-2 border border-black bg-acid px-3 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-acid"
        >
          Copy All →
        </button>
      </div>
    </div>
  );
}
