import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CONTENTAI | Instagram Content Generator',
  description: 'AI-generated Instagram captions, hashtags, and reel ideas for Indian local businesses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
