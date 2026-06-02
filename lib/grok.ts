import OpenAI from 'openai';

if (!process.env.XAI_API_KEY) {
  throw new Error('XAI_API_KEY is not set in environment variables');
}

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export default grok;
