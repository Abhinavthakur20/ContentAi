'use client';

import { useEffect, useState } from 'react';

const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
    alt: 'Cafe counter prepared for local customers',
    label: 'Cafe Launch',
  },
  {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=700&q=80',
    alt: 'Fitness studio training session',
    label: 'Gym Reels',
  },
  {
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80',
    alt: 'Salon stylist working with a customer',
    label: 'Salon Offers',
  },
  {
    src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80',
    alt: 'Clothing retail store display',
    label: 'Boutique Drop',
  },
  {
    src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=700&q=80',
    alt: 'Modern house property showcase',
    label: 'Property Tours',
  },
];

const stats = [
  { value: '500', symbol: '+', label: 'Businesses Served' },
  { value: '10', symbol: '×', label: 'Faster Than Manual' },
  { value: '', symbol: '₹0', label: 'To Get Started' },
  { value: '', symbol: 'FREE', label: 'Auto Caption Tool' },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="grid min-h-[600px] border-b border-black bg-[#f7f1e8] lg:grid-cols-[1fr_1.1fr]">
      {/* ── Left: Copy ── */}
      <div className="flex flex-col justify-between border-black px-5 pb-10 pt-14 md:px-10 lg:border-r lg:px-12">
        <div>
          <div
            className={`flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid transition-all duration-500 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            <span className="h-px w-6 bg-mid" aria-hidden="true" />
            For Indian Local Businesses
          </div>

          <h1
            className={`mt-7 font-display text-[clamp(3.6rem,6vw,5.8rem)] leading-[0.92] tracking-normal text-black transition-all duration-700 delay-100 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
          >
            <span className="block">CONTENT</span>
            <span className="block">THAT</span>
            <span className="block text-acid [-webkit-text-stroke:1px_var(--black)]">CONVERTS</span>
          </h1>

          <p
            className={`mt-6 max-w-[480px] font-body text-[0.95rem] leading-[1.65] text-mid transition-all duration-700 delay-200 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            AI-generated Instagram captions, hashtags, and reel ideas — built for gyms, salons, cafes, and every
            business in between. Get localized copy that matches your business tone in seconds.
          </p>

          <div
            className={`mt-8 flex flex-wrap gap-3 transition-all duration-700 delay-300 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <a
              href="/generator"
              className="border border-black bg-black px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-off-white transition-colors duration-200 hover:bg-acid hover:text-black"
            >
              Try Generator ↓
            </a>
            <a
              href="#portfolio"
              className="border border-black bg-transparent px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-black transition-colors duration-200 hover:bg-black hover:text-off-white"
            >
              See Samples
            </a>
          </div>
        </div>

        {/* Bottom Platform/Niche badges to fill whitespace beautifully */}
        <div
          className={`mt-10 transition-all duration-700 delay-[400ms] ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="border-t border-dashed border-black/25 pt-5">
            <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-mid mb-2.5">
              Supported Platforms & Formats
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wider text-black">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E1306C]" /> INSTAGRAM
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wider text-black">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> WHATSAPP
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wider text-black">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1877F2]" /> FACEBOOK
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wider text-black">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF0000]" /> REELS & SHORTS
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-black bg-[#fff7d9] p-3 shadow-[3px_3px_0_var(--black)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--black)] transition-all duration-200">
              <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-black font-bold">
                ✦ 5 Tone Presets
              </div>
              <p className="mt-1 font-body text-[0.75rem] leading-normal text-mid">
                Friendly, Hype, Professional, Direct, or Creative copy tailored to your brand voice.
              </p>
            </div>
            <div className="border border-black bg-[#eef3dd] p-3 shadow-[3px_3px_0_var(--black)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--black)] transition-all duration-200">
              <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-black font-bold">
                ✦ Local Indian Niches
              </div>
              <p className="mt-1 font-body text-[0.75rem] leading-normal text-mid">
                Customized hooks for cafes, beauty salons, gyms, boutiques, & local services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Image grid + stats (mobile: horizontal strip) ── */}
      <div className="relative bg-[#eef3dd]">
        {/* ── Mobile image strip ── */}
        <div className="flex gap-3 overflow-x-auto px-5 py-6 md:hidden">
          {heroImages.map((image) => (
            <div key={image.label} className="relative w-[200px] flex-shrink-0 border border-black bg-off-white">
              <img src={image.src} alt={image.alt} className="h-[140px] w-full object-cover" />
              <div className="border-t border-black px-3 py-2 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-black">
                {image.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop image collage layout ── */}
        <div className="hidden h-full md:flex md:flex-col">
          <div
            className="relative flex-1 w-full overflow-hidden min-h-[480px]"
            style={{
              backgroundImage: 'radial-gradient(rgba(10, 10, 10, 0.12) 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Collage Card 1: Cafe Launch (Top-Left) */}
            <div
              className={`absolute left-6 top-6 w-[38%] h-[38%] border-2 border-black bg-off-white p-1.5 shadow-[5px_5px_0_var(--black)] transition-all duration-300 hover:rotate-0 hover:scale-[1.04] hover:z-50 ${
                visible ? 'translate-y-0 opacity-100 -rotate-[6deg]' : 'translate-y-6 opacity-0 rotate-0'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="relative w-full h-full overflow-hidden border border-black/10">
                <img
                  src={heroImages[0].src}
                  alt={heroImages[0].alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 left-2 border border-black bg-[#f7f1e8] px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-black shadow-[1.5px_1.5px_0_var(--black)]">
                {heroImages[0].label}
              </div>
            </div>

            {/* Collage Card 2: Gym Reels (Top-Right) */}
            <div
              className={`absolute right-6 top-6 w-[36%] h-[40%] border-2 border-black bg-off-white p-1.5 shadow-[5px_5px_0_var(--black)] transition-all duration-300 hover:rotate-0 hover:scale-[1.04] hover:z-50 ${
                visible ? 'translate-y-0 opacity-100 rotate-[6deg]' : 'translate-y-6 opacity-0 rotate-0'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="relative w-full h-full overflow-hidden border border-black/10">
                <img
                  src={heroImages[1].src}
                  alt={heroImages[1].alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute right-2 top-2 border border-black bg-[#fff7d9] px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-black shadow-[1.5px_1.5px_0_var(--black)]">
                {heroImages[1].label}
              </div>
            </div>

            {/* Collage Card 3: Salon Offers (Bottom-Left) */}
            <div
              className={`absolute left-6 bottom-6 w-[36%] h-[38%] border-2 border-black bg-off-white p-1.5 shadow-[5px_5px_0_var(--black)] transition-all duration-300 hover:rotate-0 hover:scale-[1.04] hover:z-50 ${
                visible ? 'translate-y-0 opacity-100 -rotate-[3deg]' : 'translate-y-6 opacity-0 rotate-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="relative w-full h-full overflow-hidden border border-black/10">
                <img
                  src={heroImages[2].src}
                  alt={heroImages[2].alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 border border-black bg-[#eef3dd] px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-black shadow-[1.5px_1.5px_0_var(--black)]">
                {heroImages[2].label}
              </div>
            </div>

            {/* Collage Card 4: Boutique Drop (Bottom-Right) */}
            <div
              className={`absolute right-6 bottom-6 w-[34%] h-[40%] border-2 border-black bg-off-white p-1.5 shadow-[5px_5px_0_var(--black)] transition-all duration-300 hover:rotate-0 hover:scale-[1.04] hover:z-50 ${
                visible ? 'translate-y-0 opacity-100 rotate-[4deg]' : 'translate-y-6 opacity-0 rotate-0'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="relative w-full h-full overflow-hidden border border-black/10">
                <img
                  src={heroImages[3].src}
                  alt={heroImages[3].alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 left-2 border border-black bg-[#f7f1e8] px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-black shadow-[1.5px_1.5px_0_var(--black)]">
                {heroImages[3].label}
              </div>
            </div>

            {/* Collage Card 5: Property Tours (Center Overlapping) */}
            <div
              className={`absolute left-[28%] top-[24%] w-[44%] h-[46%] border-2 border-black bg-off-white p-1.5 shadow-[6px_6px_0_var(--black)] z-20 transition-all duration-300 hover:rotate-0 hover:scale-[1.05] hover:z-50 ${
                visible ? 'translate-y-0 opacity-100 rotate-[1deg]' : 'translate-y-6 opacity-0 rotate-0'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="relative w-full h-full overflow-hidden border border-black/10">
                <img
                  src={heroImages[4].src}
                  alt={heroImages[4].alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 border border-black bg-acid px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-black shadow-[1.5px_1.5px_0_var(--black)] font-bold">
                {heroImages[4].label}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 border-t border-black bg-[#fff7d9] transition-all duration-700 delay-[400ms] ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col justify-center px-5 py-5 lg:px-6 lg:py-6 ${
                  index < stats.length - 1 ? 'border-r border-black' : ''
                }`}
              >
                <div className="font-display text-[2.4rem] leading-none text-black lg:text-[2.8rem]">
                  {stat.value}
                  <span className="text-acid [-webkit-text-stroke:1px_var(--black)]">{stat.symbol}</span>
                </div>
                <div className="mt-1.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-mid">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile stats row ── */}
        <div className="grid grid-cols-2 border-t border-black bg-[#fff7d9] md:hidden">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col justify-center px-4 py-4 ${
                index < stats.length - 1 ? 'border-r border-black' : ''
              }`}
            >
              <div className="font-display text-[1.8rem] leading-none text-black">
                {stat.value}
                <span className="text-acid [-webkit-text-stroke:1px_var(--black)]">{stat.symbol}</span>
              </div>
              <div className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-mid">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
