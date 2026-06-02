export type CaptionFormat = 'srt' | 'text' | 'instagram';
export type AudioLanguage = 'en' | 'hi' | '';

export interface TranscribeResponse {
  rawTranscript: string;
  srtContent: string;
  detectedLanguage: string;
  duration: number;
  wordCount: number;
  error?: string;
}

export interface PolishResponse {
  caption: string;
  cta: string;
  hashtags: string[];
  error?: string;
}

export interface SRTSegment {
  index: number;
  start: number;
  end: number;
  text: string;
}
