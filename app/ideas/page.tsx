import type { Metadata } from 'next';
import IdeasClient from './IdeasClient';

export const metadata: Metadata = {
  title: 'Post Idea Generator — ContentAI',
  description: 'Generate Indian market content ideas for local businesses.',
};

export default function IdeasPage() {
  return <IdeasClient />;
}
