'use client';

import type { ChangeEvent, DragEvent } from 'react';
import { useRef, useState, useEffect } from 'react';
import type { AudioLanguage, CaptionFormat, PolishResponse, TranscribeResponse } from '@/types/caption';

/* ── Helpers ── */

function AnimatedDots() {
  return (
    <span style={{ marginLeft: '4px' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="dot">.</span>
      ))}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ms = Math.floor((seconds % 1) * 100);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
}

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Data ── */

const languages: Array<{ value: AudioLanguage; label: string; short: string }> = [
  { value: '', label: 'Auto-Detect', short: 'AUTO' },
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'hi', label: 'Hindi / Hinglish', short: 'HI' },
];

const formats: Array<{ value: CaptionFormat; label: string; icon: string }> = [
  { value: 'srt', label: 'SRT SubRip', icon: 'CC' },
  { value: 'text', label: 'Plain Text', icon: 'TXT' },
  { value: 'instagram', label: 'Instagram', icon: 'IG' },
];

/* ── Waveform component ── */

function WaveformTimeline({ duration, isProcessing }: { duration: number; isProcessing: boolean }) {
  const bars = 80;
  return (
    <div className="nle-timeline">
      <div className="nle-timeline-ruler">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="nle-timeline-mark">
            {duration > 0 ? formatTimecode(Math.floor((duration / 5) * i)) : `${i * 10}s`}
          </span>
        ))}
      </div>
      <div className="nle-waveform">
        {Array.from({ length: bars }).map((_, i) => {
          const h = Math.sin(i * 0.3) * 30 + Math.cos(i * 0.7) * 20 + 40 + Math.sin(i * 1.2) * 10;
          return (
            <div
              key={i}
              className={`nle-waveform-bar ${isProcessing ? 'nle-waveform-bar--active' : ''}`}
              style={{
                height: `${Math.max(8, h)}%`,
                animationDelay: isProcessing ? `${i * 25}ms` : '0ms',
              }}
            />
          );
        })}
      </div>
      <div className="nle-timeline-track">
        <div className="nle-timeline-track-label">A1 — Audio</div>
        <div className="nle-timeline-track-bar" />
      </div>
      <div className="nle-timeline-track">
        <div className="nle-timeline-track-label">S1 — Subtitles</div>
        <div className="nle-timeline-track-bar nle-timeline-track-bar--subs" />
      </div>
    </div>
  );
}

interface ParsedSRT {
  start: number;
  end: number;
  text: string;
}

function parseSRT(srt: string): ParsedSRT[] {
  if (!srt) return [];
  const blocks = srt.split(/\n\s*\n/);
  const parsed: ParsedSRT[] = [];
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const textLines = lines.slice(2).join(' ');
      
      const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
      if (match) {
        const startSec = 
          parseInt(match[1]) * 3600 +
          parseInt(match[2]) * 60 +
          parseInt(match[3]) +
          parseInt(match[4]) / 1000;
          
        const endSec = 
          parseInt(match[5]) * 3600 +
          parseInt(match[6]) * 60 +
          parseInt(match[7]) +
          parseInt(match[8]) / 1000;
          
        parsed.push({
          start: startSec,
          end: endSec,
          text: textLines.trim()
        });
      }
    }
  }
  
  return parsed;
}

/* ── Main component ── */

export default function CaptionStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegment, setActiveSegment] = useState<string>('');
  
  // Customization settings
  const [captionColor, setCaptionColor] = useState<'acid' | 'black-box' | 'white-outline' | 'pink-outline'>('acid');
  const [captionFont, setCaptionFont] = useState<'display' | 'mono' | 'body'>('mono');
  const [captionSize, setCaptionSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [captionPosition, setCaptionPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');

  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState<AudioLanguage>('');
  const [format, setFormat] = useState<CaptionFormat>('srt');
  const [polish, setPolish] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [result, setResult] = useState<TranscribeResponse | null>(null);
  const [polishedResult, setPolishedResult] = useState<PolishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activePanel, setActivePanel] = useState<'source' | 'output'>('source');

  useEffect(() => {
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (result?.srtContent) {
      const parsed = parseSRT(result.srtContent);
      const active = parsed.find(seg => currentTime >= seg.start && currentTime <= seg.end);
      setActiveSegment(active ? active.text : '');
    } else {
      setActiveSegment('');
    }
  }, [currentTime, result]);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadSRT = () => {
    if (!result?.srtContent) return;
    const blob = new Blob([result.srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions-${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setPolishedResult(null);
    setError(null);
    setCurrentTime(0);
    setActiveSegment('');
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer?.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleTimeUpdate = (event: ChangeEvent<HTMLVideoElement>) => {
    setCurrentTime(event.target.currentTime);
  };

  const getCaptionStyleClass = () => {
    let classes = 'absolute left-1/2 -translate-x-1/2 w-[90%] text-center font-bold px-4 py-2 pointer-events-none transition-all duration-150 ';
    
    // Position
    if (captionPosition === 'top') classes += 'top-6 ';
    else if (captionPosition === 'middle') classes += 'top-1/2 -translate-y-1/2 ';
    else classes += 'bottom-8 ';
    
    // Font family
    if (captionFont === 'display') classes += 'font-display ';
    else if (captionFont === 'mono') classes += 'font-mono ';
    else classes += 'font-body ';
    
    // Font size
    if (captionSize === 'sm') classes += 'text-lg ';
    else if (captionSize === 'md') classes += 'text-xl md:text-2xl ';
    else classes += 'text-2xl md:text-3xl ';
    
    // Colors & borders
    if (captionColor === 'acid') {
      classes += 'text-acid bg-black border border-black shadow-[3px_3px_0_rgba(0,0,0,1)] uppercase ';
    } else if (captionColor === 'black-box') {
      classes += 'text-white bg-black border border-white ';
    } else if (captionColor === 'white-outline') {
      classes += 'text-white ';
    } else if (captionColor === 'pink-outline') {
      classes += 'text-[#ff007f] bg-black border border-black shadow-[3px_3px_0_rgba(0,0,0,1)] uppercase ';
    }
    
    return classes;
  };

  const getCaptionInlineStyles = () => {
    if (captionColor === 'white-outline') {
      return {
        textShadow: `
          -2px -2px 0 #000,  
           2px -2px 0 #000,
          -2px  2px 0 #000,
           2px  2px 0 #000,
          -2px  0px 0 #000,
           2px  0px 0 #000,
           0px -2px 0 #000,
           0px  2px 0 #000
        `,
      };
    }
    return {};
  };

  const handleExportVideo = async () => {
    if (!file || !result?.srtContent) return;
    const video = videoRef.current;
    if (!video) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      video.pause();
      
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      // Set up Audio capturing
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createMediaElementSource(video);
      source.connect(dest);
      source.connect(audioCtx.destination);

      // Capture canvas stream
      const stream = canvas.captureStream(30); // 30 FPS
      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }

      // Determine mime type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const parsedSegments = parseSRT(result.srtContent);

      let animId: number;
      const drawFrame = () => {
        if (video.paused || video.ended) return;

        // Draw video
        ctx.drawImage(video, 0, 0, width, height);

        const time = video.currentTime;
        const active = parsedSegments.find(seg => time >= seg.start && time <= seg.end);
        const text = active ? active.text : '';

        if (text) {
          ctx.save();
          
          let fontName = 'sans-serif';
          if (captionFont === 'display') fontName = 'Bebas Neue';
          else if (captionFont === 'mono') fontName = 'Space Mono';
          else if (captionFont === 'body') fontName = 'DM Sans';

          let scaleSize = 0.04;
          if (captionSize === 'sm') scaleSize = 0.03;
          else if (captionSize === 'lg') scaleSize = 0.055;
          const fontSize = Math.max(16, Math.round(height * scaleSize));
          
          ctx.font = `bold ${fontSize}px ${fontName}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const words = text.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          const maxWidth = width * 0.85;

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }

          let y = height * 0.82;
          if (captionPosition === 'top') {
            y = height * 0.18;
          } else if (captionPosition === 'middle') {
            y = height * 0.5;
          }

          const lineHeight = fontSize * 1.2;
          y = y - ((lines.length - 1) * lineHeight) / 2;

          if (captionColor === 'black-box') {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
            const paddingX = 14;
            const paddingY = 8;
            lines.forEach((line, index) => {
              const metrics = ctx.measureText(line);
              const bgW = metrics.width + paddingX * 2;
              const bgH = fontSize + paddingY;
              const lineY = y + index * lineHeight;
              ctx.fillRect(width / 2 - bgW / 2, lineY - bgH / 2, bgW, bgH);
            });
          }

          lines.forEach((line, index) => {
            const lineY = y + index * lineHeight;

            if (captionColor === 'acid') {
              ctx.strokeStyle = '#0a0a0a';
              ctx.lineWidth = Math.max(4, fontSize * 0.15);
              ctx.lineJoin = 'round';
              ctx.strokeText(line, width / 2, lineY);
              ctx.fillStyle = '#c8f23c';
              ctx.fillText(line, width / 2, lineY);
            } else if (captionColor === 'pink-outline') {
              ctx.strokeStyle = '#0a0a0a';
              ctx.lineWidth = Math.max(4, fontSize * 0.15);
              ctx.lineJoin = 'round';
              ctx.strokeText(line, width / 2, lineY);
              ctx.fillStyle = '#ff007f';
              ctx.fillText(line, width / 2, lineY);
            } else if (captionColor === 'white-outline') {
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = Math.max(4, fontSize * 0.15);
              ctx.lineJoin = 'round';
              ctx.strokeText(line, width / 2, lineY);
              ctx.fillStyle = '#ffffff';
              ctx.fillText(line, width / 2, lineY);
            } else {
              ctx.fillStyle = '#ffffff';
              ctx.fillText(line, width / 2, lineY);
            }
          });

          ctx.restore();
        }

        const prog = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
        setExportProgress(prog);

        animId = requestAnimationFrame(drawFrame);
      };

      recorder.onstart = () => {
        video.currentTime = 0;
        video.play().then(() => {
          animId = requestAnimationFrame(drawFrame);
        });
      };

      recorder.onstop = () => {
        cancelAnimationFrame(animId);
        setExportProgress(100);

        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `captioned-reel-${Date.now()}.webm`;
        a.click();

        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
          setIsExporting(false);
          setExportProgress(null);
          
          source.disconnect();
          source.connect(audioCtx.destination);
          audioCtx.close();
        }, 1000);
      };

      video.onended = () => {
        recorder.stop();
        video.onended = null;
      };

      recorder.start();
    } catch (err) {
      console.error('Export failed', err);
      setIsExporting(false);
      setExportProgress(null);
      alert('Export failed. Please check console logs or try again.');
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setIsTranscribing(true);
    setError(null);
    setResult(null);
    setPolishedResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('format', format);

    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || 'Transcription failed');
      }
      const data = (await res.json()) as TranscribeResponse;
      setResult(data);
      setIsTranscribing(false);
      setActivePanel('output');

      if (format === 'instagram' && polish) {
        setIsPolishing(true);
        const polishRes = await fetch('/api/polish-captions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: data.rawTranscript }),
        });
        if (polishRes.ok) {
          const polished = (await polishRes.json()) as PolishResponse;
          setPolishedResult(polished);
        } else {
          const err = (await polishRes.json()) as { error?: string };
          setError(err.error || 'Caption polish failed');
        }
        setIsPolishing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsTranscribing(false);
      setIsPolishing(false);
    }
  };

  const handleUpsellClick = () => {
    if (result?.rawTranscript) {
      sessionStorage.setItem('captionTranscript', result.rawTranscript.slice(0, 120));
    }
    window.location.href = '/generator';
  };

  const exportText =
    format === 'srt'
      ? result?.srtContent || ''
      : format === 'instagram' && polishedResult
        ? `${polishedResult.caption}\n\n${polishedResult.cta}\n\n${polishedResult.hashtags.join(' ')}`
        : result?.rawTranscript || '';

  const isProcessing = isTranscribing || isPolishing;
  const statusLabel = isTranscribing ? 'TRANSCRIBING' : isPolishing ? 'POLISHING' : result ? 'COMPLETE' : file ? 'READY' : 'IDLE';
  const statusColor = isProcessing ? '#f5a623' : result ? '#4cdf6b' : file ? '#c8f23c' : '#6b6b6b';

  return (
    <section id="captions" className="nle-root">
      {/* ── Title bar ── */}
      <div className="nle-titlebar">
        <div className="nle-titlebar-left">
          <div className="nle-window-dots">
            <span className="nle-dot nle-dot--red" />
            <span className="nle-dot nle-dot--yellow" />
            <span className="nle-dot nle-dot--green" />
          </div>
          <span className="nle-titlebar-brand">ContentAI Caption Studio</span>
          <span className="nle-titlebar-badge">FREE</span>
        </div>
        <div className="nle-titlebar-center">
          <button
            type="button"
            className={`nle-titlebar-tab ${activePanel === 'source' ? 'nle-titlebar-tab--active' : ''}`}
            onClick={() => setActivePanel('source')}
          >
            Source
          </button>
          <button
            type="button"
            className={`nle-titlebar-tab ${activePanel === 'output' ? 'nle-titlebar-tab--active' : ''}`}
            onClick={() => setActivePanel('output')}
          >
            Output
          </button>
        </div>
        <div className="nle-titlebar-right">
          <span className="nle-status-dot" style={{ background: statusColor }} />
          <span className="nle-status-label">{statusLabel}{isProcessing && <AnimatedDots />}</span>
        </div>
      </div>

      {/* ── Menu bar ── */}
      <div className="nle-menubar">
        {['File', 'Edit', 'Sequence', 'Export', 'Help'].map((m) => (
          <span key={m} className="nle-menubar-item">{m}</span>
        ))}
        <div className="nle-menubar-right">
          <span className="nle-menubar-info">Max 25MB</span>
          <span className="nle-menubar-divider" />
          <span className="nle-menubar-info">MP4 · MOV · MP3 · WAV · M4A</span>
        </div>
      </div>

      {/* ── Main panels ── */}
      <div className="nle-body">
        {/* Left: Source monitor / Upload */}
        <div className="nle-panel nle-panel--source">
          <div className="nle-panel-header">
            <span className="nle-panel-title">
              <span className="nle-panel-icon">▶</span>
              Source Monitor
            </span>
            <span className="nle-panel-meta">
              {file ? formatFileSize(file.size) : 'No media'}
            </span>
          </div>

          <div className="nle-panel-body">
            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                className={`nle-dropzone ${isDragging ? 'nle-dropzone--active' : ''}`}
              >
                <div className="nle-dropzone-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="6" width="32" height="36" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M18 24l6-6 6 6M24 18v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="nle-dropzone-label">Import Media</div>
                <div className="nle-dropzone-hint">Drop file or click to browse</div>
                <input ref={fileInputRef} type="file" hidden accept="video/*,audio/*" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="nle-source-preview">
                <div className="nle-source-file">
                  <div className="nle-source-icon">
                    {file.type.startsWith('video/') ? (
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect x="3" y="6" width="26" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <polygon points="13,11 22,16 13,21" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M11 16c1.5-3 3.5-3 5 0s3.5 3 5 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    )}
                  </div>
                  <div className="nle-source-info">
                    <div className="nle-source-name">{file.name}</div>
                    <div className="nle-source-detail">
                      {file.type.startsWith('video/') ? 'Video' : 'Audio'} · {formatFileSize(file.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="nle-source-remove"
                    onClick={() => { setFile(null); setResult(null); setPolishedResult(null); setError(null); }}
                  >
                    ×
                  </button>
                </div>

                {file.type.startsWith('video/') && (
                  <div className="nle-source-note">
                    <span className="nle-source-note-dot" />
                    Audio will be extracted automatically
                  </div>
                )}

                <button
                  type="button"
                  className="nle-source-change"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace Media
                </button>
              </div>
            )}

            {error && (
              <div className="nle-error">
                <span className="nle-error-icon">!</span>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Center: Properties / Settings */}
        <div className="nle-panel nle-panel--props">
          <div className="nle-panel-header">
            <span className="nle-panel-title">
              <span className="nle-panel-icon">⚙</span>
              Properties
            </span>
          </div>

          <div className="nle-panel-body nle-props-body">
            {/* Language */}
            <div className="nle-prop-group">
              <label className="nle-prop-label">Audio Language</label>
              <div className="nle-prop-options">
                {languages.map((item) => (
                  <button
                    key={item.short}
                    type="button"
                    onClick={() => setLanguage(item.value)}
                    className={`nle-prop-btn ${language === item.value ? 'nle-prop-btn--active' : ''}`}
                    title={item.label}
                  >
                    {item.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="nle-prop-divider" />

            {/* Format */}
            <div className="nle-prop-group">
              <label className="nle-prop-label">Output Format</label>
              <div className="nle-format-list">
                {formats.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormat(item.value)}
                    className={`nle-format-btn ${format === item.value ? 'nle-format-btn--active' : ''}`}
                  >
                    <span className="nle-format-icon">{item.icon}</span>
                    <span className="nle-format-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {format === 'instagram' && (
              <>
                <div className="nle-prop-divider" />
                <div className="nle-prop-group">
                  <div className="nle-prop-toggle-row">
                    <div>
                      <label className="nle-prop-label">AI Polish</label>
                      <p className="nle-prop-hint">Grok refines transcript into post-ready caption</p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={polish}
                      onClick={() => setPolish(!polish)}
                      className={`nle-toggle ${polish ? 'nle-toggle--on' : ''}`}
                    >
                      <span className="nle-toggle-thumb" />
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="nle-prop-divider" />

            {/* Render button */}
            <button
              type="button"
              onClick={handleTranscribe}
              disabled={!file || isProcessing}
              className="nle-render-btn"
            >
              <span className="nle-render-icon">
                {isProcessing ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="nle-spin">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="8" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <polygon points="4,2 14,8 4,14" fill="currentColor" />
                  </svg>
                )}
              </span>
              {isTranscribing ? (
                <>RENDERING<AnimatedDots /></>
              ) : isPolishing ? (
                <>AI POLISH<AnimatedDots /></>
              ) : (
                'RENDER CAPTIONS'
              )}
            </button>

            {/* Quick info */}
            {result && (
              <div className="nle-metadata">
                <div className="nle-metadata-row">
                  <span className="nle-metadata-key">Duration</span>
                  <span className="nle-metadata-val">{formatDuration(result.duration)}</span>
                </div>
                <div className="nle-metadata-row">
                  <span className="nle-metadata-key">Words</span>
                  <span className="nle-metadata-val">{result.wordCount}</span>
                </div>
                <div className="nle-metadata-row">
                  <span className="nle-metadata-key">Language</span>
                  <span className="nle-metadata-val">{result.detectedLanguage}</span>
                </div>
              </div>
            )}

            {file?.type.startsWith('video/') && (
              <>
                <div className="nle-prop-divider" />
                <div className="nle-prop-group">
                  <label className="nle-prop-label">Caption Design</label>
                  
                  {/* Style */}
                  <div className="mt-2.5">
                    <span className="text-[0.52rem] uppercase tracking-wider text-mid block mb-1">Style</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { value: 'acid', label: 'Acid Yellow' },
                        { value: 'white-outline', label: 'Outline White' },
                        { value: 'black-box', label: 'Black Box' },
                        { value: 'pink-outline', label: 'Neon Pink' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCaptionColor(item.value as any)}
                          className={`nle-prop-btn py-1 text-[0.5rem] ${captionColor === item.value ? 'nle-prop-btn--active' : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font */}
                  <div className="mt-2.5">
                    <span className="text-[0.52rem] uppercase tracking-wider text-mid block mb-1">Font</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'display', label: 'Display' },
                        { value: 'mono', label: 'Mono' },
                        { value: 'body', label: 'Body' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCaptionFont(item.value as any)}
                          className={`nle-prop-btn py-1 text-[0.5rem] ${captionFont === item.value ? 'nle-prop-btn--active' : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div className="mt-2.5">
                    <span className="text-[0.52rem] uppercase tracking-wider text-mid block mb-1">Size</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'sm', label: 'Small' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Large' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCaptionSize(item.value as any)}
                          className={`nle-prop-btn py-1 text-[0.5rem] ${captionSize === item.value ? 'nle-prop-btn--active' : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
                  <div className="mt-2.5">
                    <span className="text-[0.52rem] uppercase tracking-wider text-mid block mb-1">Position</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'top', label: 'Top' },
                        { value: 'middle', label: 'Middle' },
                        { value: 'bottom', label: 'Bottom' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCaptionPosition(item.value as any)}
                          className={`nle-prop-btn py-1 text-[0.5rem] ${captionPosition === item.value ? 'nle-prop-btn--active' : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Output / Export */}
        <div className="nle-panel nle-panel--output">
          <div className="nle-panel-header">
            <span className="nle-panel-title">
              <span className="nle-panel-icon">◉</span>
              Program Monitor
            </span>
            {result && (
              <button
                type="button"
                onClick={() => copyText(exportText)}
                className="nle-copy-btn"
              >
                {copied ? '✓ COPIED' : 'COPY ALL'}
              </button>
            )}
          </div>

          <div className="nle-panel-body nle-output-body">
            {!result ? (
              <div className="nle-output-empty">
                <div className="nle-output-empty-icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="4" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="1" />
                    <circle cx="8" cy="11" r="1" fill="currentColor" />
                    <circle cx="12" cy="11" r="1" fill="currentColor" />
                    <circle cx="16" cy="11" r="1" fill="currentColor" />
                  </svg>
                </div>
                <p className="nle-output-empty-text">Output will appear here after rendering</p>
                <p className="nle-output-empty-hint">Import media → Set properties → Render</p>
              </div>
            ) : (
              <div className="nle-output-content space-y-6">
                {/* ── Live Video Preview Player ── */}
                {file?.type.startsWith('video/') && videoUrl && (
                  <div className="relative border-2 border-black bg-black overflow-hidden aspect-[9/16] w-full max-w-[240px] mx-auto shadow-[4px_4px_0_var(--black)]">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      onTimeUpdate={handleTimeUpdate}
                    />
                    {/* Caption Overlay */}
                    {activeSegment && (
                      <div
                        className={getCaptionStyleClass()}
                        style={getCaptionInlineStyles()}
                      >
                        {activeSegment}
                      </div>
                    )}
                  </div>
                )}

                {/* SRT */}
                {format === 'srt' && (
                  <div className="nle-code-block">
                    <div className="nle-code-header">
                      <span>SRT OUTPUT</span>
                      <button type="button" onClick={() => copyText(result.srtContent)} className="nle-code-copy">
                        {copied ? '✓' : 'Copy'}
                      </button>
                    </div>
                    <pre className="nle-code-body">{result.srtContent}</pre>
                  </div>
                )}

                {/* Text */}
                {format === 'text' && (
                  <div className="nle-code-block">
                    <div className="nle-code-header">
                      <span>TRANSCRIPT</span>
                      <button type="button" onClick={() => copyText(result.rawTranscript)} className="nle-code-copy">
                        {copied ? '✓' : 'Copy'}
                      </button>
                    </div>
                    <div className="nle-code-body nle-code-body--text">{result.rawTranscript}</div>
                  </div>
                )}

                {/* Instagram */}
                {format === 'instagram' && (
                  <div className="nle-ig-output">
                    {isPolishing ? (
                      <div className="nle-ig-loading">
                        <span>Polishing with AI</span>
                        <AnimatedDots />
                      </div>
                    ) : polishedResult ? (
                      <>
                        <div className="nle-code-block">
                          <div className="nle-code-header">
                            <span>CAPTION</span>
                            <button type="button" onClick={() => copyText(polishedResult.caption)} className="nle-code-copy">
                              Copy
                            </button>
                          </div>
                          <div className="nle-code-body nle-code-body--text">{polishedResult.caption}</div>
                        </div>

                        <div className="nle-code-block">
                          <div className="nle-code-header">
                            <span>CALL TO ACTION</span>
                            <button type="button" onClick={() => copyText(polishedResult.cta)} className="nle-code-copy">
                              Copy
                            </button>
                          </div>
                          <div className="nle-code-body nle-code-body--text">{polishedResult.cta}</div>
                        </div>

                        <div className="nle-code-block">
                          <div className="nle-code-header">
                            <span>HASHTAGS</span>
                            <button type="button" onClick={() => copyText(polishedResult.hashtags.join(' '))} className="nle-code-copy">
                              Copy All
                            </button>
                          </div>
                          <div className="nle-hashtag-grid">
                            {polishedResult.hashtags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => copyText(tag)}
                                className="nle-hashtag"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="nle-code-block">
                        <div className="nle-code-header"><span>RAW TRANSCRIPT</span></div>
                        <div className="nle-code-body nle-code-body--text">{result.rawTranscript}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Export actions */}
                <div className="nle-export-actions flex flex-col gap-3">
                  {file?.type.startsWith('video/') && (
                    <button
                      type="button"
                      onClick={handleExportVideo}
                      disabled={isExporting}
                      className="nle-export-btn border-2 border-black bg-acid text-black flex items-center justify-center gap-2 hover:bg-black hover:text-acid disabled:bg-mid disabled:text-off-white font-mono text-[0.65rem] uppercase tracking-[0.1em] py-3 w-full"
                    >
                      {isExporting ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="nle-spin animate-spin">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="8" />
                          </svg>
                          BURNING CAPTIONS ({exportProgress}%)
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v9M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="2" y1="12.5" x2="12" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          EXPORT VIDEO WITH CAPTIONS
                        </>
                      )}
                    </button>
                  )}

                  {format === 'srt' && (
                    <button type="button" onClick={downloadSRT} className="nle-export-btn py-3 w-full">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v9M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="2" y1="12.5" x2="12" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Download .SRT Subtitles
                    </button>
                  )}
                  <button type="button" onClick={handleUpsellClick} className="nle-export-btn nle-export-btn--upsell py-3 w-full">
                    Full Content Package →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <WaveformTimeline duration={result?.duration || 0} isProcessing={isProcessing} />

      {/* ── Status bar ── */}
      <div className="nle-statusbar">
        <div className="nle-statusbar-left">
          <span className="nle-statusbar-dot" style={{ background: statusColor }} />
          <span>{statusLabel}</span>
          {file && <span className="nle-statusbar-divider" />}
          {file && <span>{file.name}</span>}
        </div>
        <div className="nle-statusbar-right">
          <span>ContentAI v2.0</span>
          <span className="nle-statusbar-divider" />
          <span>100% Free · No Account Required</span>
        </div>
      </div>
    </section>
  );
}
