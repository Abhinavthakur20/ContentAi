import CaptionStudio from '@/components/CaptionStudio';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Free Auto Captions — ContentAI',
  description:
    'Free AI captions for your reels and videos. English, Hindi, Hinglish supported. Download SRT or copy text. No account needed.',
};

export default function CaptionsPage() {
  return (
    <>
      <Navbar />
      <main>
        <CaptionStudio />
      </main>
      <Footer />
    </>
  );
}
