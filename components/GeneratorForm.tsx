'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { GenerateRequest } from '@/types';

type Tone = GenerateRequest['tone'];
type Platform = GenerateRequest['platform'];

interface GeneratorFormProps {
  formData: GenerateRequest;
  customBusiness: string;
  isLoading: boolean;
  error: string;
  onFormChange: (data: GenerateRequest) => void;
  onCustomBusinessChange: (value: string) => void;
  onSubmit: () => void;
}

const businessOptions = [
  { value: '', label: 'Select your niche' },
  { value: 'gym', label: 'Gym / Fitness Studio' },
  { value: 'salon', label: 'Salon & Beauty Parlour' },
  { value: 'cafe', label: 'Cafe & Coffee Shop' },
  { value: 'restaurant', label: 'Restaurant / Dhaba' },
  { value: 'dental', label: 'Dental Clinic' },
  { value: 'realestate', label: 'Real Estate Agent' },
  { value: 'coaching', label: 'Coaching Institute' },
  { value: 'clothing', label: 'Clothing Store' },
  { value: 'custom', label: 'Custom (type below)' },
];

const tones: Array<{ value: Tone; label: string }> = [
  { value: 'motivational', label: '🔥 Motivational' },
  { value: 'fun', label: '😄 Fun & Casual' },
  { value: 'professional', label: '💼 Professional' },
  { value: 'trendy', label: '✨ Trendy' },
];

const platforms: Platform[] = ['instagram', 'facebook', 'whatsapp'];

export default function GeneratorForm({
  formData,
  customBusiness,
  isLoading,
  error,
  onFormChange,
  onCustomBusinessChange,
  onSubmit,
}: GeneratorFormProps) {
  const [fromCaption, setFromCaption] = useState(false);

  useEffect(() => {
    const transcript = sessionStorage.getItem('captionTranscript');
    const ideaBusinessType = sessionStorage.getItem('ideaBusinessType');
    const nextFormData = {
      ...formData,
      offer: transcript ? transcript.slice(0, 120) : formData.offer,
      businessType: ideaBusinessType || formData.businessType,
    };

    if (transcript || ideaBusinessType) {
      onFormChange(nextFormData);
    }

    if (transcript) {
      setFromCaption(true);
      sessionStorage.removeItem('captionTranscript');
    }

    if (ideaBusinessType) {
      sessionStorage.removeItem('ideaBusinessType');
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section id="generator" className="border-t border-black px-4 py-10 md:border-r md:px-8">
      <div className="mb-8 flex items-center gap-2">
        <span className="font-display text-[1.1rem] leading-none text-acid">01</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Generate Your Content</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label htmlFor="businessType" className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">
            BUSINESS TYPE *
          </label>
          <div className="select-wrap relative">
            <select
              id="businessType"
              value={formData.businessType}
              onChange={(event) => onFormChange({ ...formData, businessType: event.target.value })}
              className="w-full appearance-none border border-black bg-transparent px-3 py-2.5 font-body text-[0.85rem] text-black outline-none focus:border-acid focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
              required
            >
              {businessOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.value === ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {formData.businessType === 'custom' ? (
            <input
              id="customBiz"
              type="text"
              value={customBusiness}
              onChange={(event) => onCustomBusinessChange(event.target.value)}
              placeholder="e.g. Pet grooming studio"
              className="mt-3 w-full border border-black bg-transparent px-3 py-2.5 font-body text-[0.85rem] text-black outline-none placeholder:text-mid focus:border-acid focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
            />
          ) : null}
          {error ? <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-red-700">{error}</p> : null}
        </div>

        <div>
          <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">CONTENT TONE *</div>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((tone) => {
              const active = formData.tone === tone.value;
              return (
                <button
                  key={tone.value}
                  type="button"
                  data-tone={tone.value}
                  onClick={() => onFormChange({ ...formData, tone: tone.value })}
                  className={`border px-3 py-3 font-mono text-[0.6rem] uppercase tracking-[0.08em] ${
                    active
                      ? 'border-black bg-black text-acid'
                      : 'border-border-muted bg-transparent text-mid hover:border-black hover:text-black'
                  }`}
                >
                  {tone.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="offer" className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">
            SPECIAL OFFER (optional)
          </label>
          {fromCaption ? (
            <div className="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-acid">
              ✦ Pre-filled from your video transcript
            </div>
          ) : null}
          <input
            id="offer"
            type="text"
            value={formData.offer}
            onChange={(event) => onFormChange({ ...formData, offer: event.target.value })}
            placeholder="e.g. 50% off this weekend, Free trial class..."
            className="w-full border border-black bg-transparent px-3 py-2.5 font-body text-[0.85rem] text-black outline-none placeholder:text-mid focus:border-acid focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
          />
        </div>

        <div>
          <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">PLATFORM</div>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((platform) => {
              const active = formData.platform === platform;
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => onFormChange({ ...formData, platform })}
                  className={`border px-2 py-3 font-mono text-[0.6rem] uppercase tracking-[0.08em] ${
                    active
                      ? 'border-black bg-acid text-black'
                      : 'border-border-muted bg-transparent text-mid hover:border-black hover:text-black'
                  }`}
                >
                  {platform}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border border-black bg-black p-3.5 font-display text-[1.4rem] uppercase tracking-[0.08em] text-off-white hover:bg-acid hover:text-black disabled:bg-mid disabled:text-off-white"
        >
          {isLoading ? (
            <span className="inline-flex h-[1.75rem] items-center gap-1">
              <span className="dot">•</span>
              <span className="dot">•</span>
              <span className="dot">•</span>
            </span>
          ) : (
            'GENERATE CONTENT'
          )}
        </button>
      </form>
    </section>
  );
}
