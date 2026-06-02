import type { Metadata } from 'next';
import LeadPageClient from './LeadPageClient';

export const metadata: Metadata = {
  title: 'Get Free Content Audit — ContentAI',
  description: 'Get a free AI content audit for your business',
};

export default function LeadsPage() {
  return <LeadPageClient />;
}
