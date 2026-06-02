import type { Metadata } from 'next';
import ScriptsClient from './ScriptsClient';

export const metadata: Metadata = {
  title: 'Reel Script Generator — ContentAI',
  description: 'Generate short-form reel scripts for Indian local businesses.',
};

export default function ScriptsPage() {
  return <ScriptsClient />;
}
