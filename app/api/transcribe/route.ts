import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq';

export const maxDuration = 60;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function padMs(n: number): string {
  return n.toString().padStart(3, '0');
}

function secondsToSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${padMs(ms)}`;
}

interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

function buildSRT(segments: WhisperSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = secondsToSRTTime(seg.start);
      const end = secondsToSRTTime(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${seg.text.trim()}`;
    })
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const language = formData.get('language') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB on the free tier.' },
        { status: 400 },
      );
    }

    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/mp4',
      'audio/m4a',
      'audio/ogg',
      'audio/flac',
      'audio/webm',
      'video/mp4',
      'video/quicktime',
      'video/avi',
      'video/webm',
      'video/x-msvideo',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Use MP4, MOV, MP3, WAV, or M4A.` },
        { status: 400 },
      );
    }

    const transcriptionParams: {
      file: File;
      model: string;
      response_format: 'verbose_json';
      timestamp_granularities: ['segment'];
      language?: string;
    } = {
      file,
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    };

    if (language && language !== '') {
      transcriptionParams.language = language;
    }

    const transcription = await getGroqClient().audio.transcriptions.create(transcriptionParams);

    const verboseResult = transcription as unknown as {
      text: string;
      language: string;
      duration: number;
      segments: WhisperSegment[];
    };

    const rawTranscript = verboseResult.text || '';
    const segments = verboseResult.segments || [];
    const detectedLanguage = verboseResult.language || 'unknown';
    const duration = verboseResult.duration || 0;
    const wordCount = rawTranscript.split(/\s+/).filter((w: string) => w.length > 0).length;
    const srtContent = buildSRT(segments);

    return NextResponse.json({
      rawTranscript,
      srtContent,
      detectedLanguage,
      duration: Math.round(duration),
      wordCount,
    });
  } catch (error) {
    console.error('Transcription error:', error);

    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json({ error: 'Free tier limit reached. Try again in a minute.' }, { status: 429 });
      }

      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json({ error: 'Transcription service not configured.' }, { status: 500 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Transcription failed. Please try again.' }, { status: 500 });
  }
}
