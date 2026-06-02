import Groq from 'groq-sdk';

let _client: Groq | undefined;

/** Lazy singleton — only instantiated when first called at runtime. */
export function getGroqClient(): Groq {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}
