# CONTENTAI

AI-powered Instagram content generator for Indian local businesses. Built with Next.js 14, TailwindCSS, TypeScript, and the xAI Grok API through the OpenAI SDK.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Add your xAI key:

```env
XAI_API_KEY=your_xai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Notes

- The app uses `grok-3-mini` and falls back to `grok-beta` if the model returns a 404.
- No database is required.
- The UI uses an editorial brutalist system: sharp borders, hard color swaps, and a single warm light theme.
