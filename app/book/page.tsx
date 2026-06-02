import type { Metadata } from 'next';
import BookingPageClient from './BookingPageClient';

export const metadata: Metadata = {
  title: 'Book a Free Call — ContentAI',
  description: 'Book a free strategy call for your AI content workflow.',
};

export default function BookPage() {
  return <BookingPageClient />;
}
