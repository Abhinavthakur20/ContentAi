export interface GenerateRequest {
  businessType: string;
  tone: 'motivational' | 'fun' | 'professional' | 'trendy';
  offer: string;
  platform: 'instagram' | 'facebook' | 'whatsapp';
}

export interface ContentVariation {
  caption: string;
  cta: string;
  hashtags: string[];
  reelHook: string;
}

export interface GenerateResponse {
  variations: ContentVariation[];
  error?: string;
}

export interface ToastState {
  visible: boolean;
  message: string;
}
