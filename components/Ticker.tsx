const tickerText =
  'AI-POWERED CONTENT · INSTAGRAM CAPTIONS · REEL HOOKS · HASHTAG PACKS · WHATSAPP AUTOMATION · LOCAL BUSINESS GROWTH · GYMS · SALONS · CAFES · RESTAURANTS · AUTO CAPTIONS · HINGLISH SUPPORT · SRT DOWNLOAD · FREE FOREVER ·';

export default function Ticker() {
  return (
    <div className="h-8 w-full overflow-hidden bg-black text-acid">
      <div className="ticker-track flex w-max whitespace-nowrap font-mono text-[0.65rem] uppercase leading-8 tracking-[0.12em]">
        <span className="pr-8">{tickerText}</span>
        <span className="pr-8" aria-hidden="true">
          {tickerText}
        </span>
      </div>
    </div>
  );
}
