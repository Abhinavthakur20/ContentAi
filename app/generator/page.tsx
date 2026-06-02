import Footer from '@/components/Footer';
import GeneratorExperience from '@/components/GeneratorExperience';
import Navbar from '@/components/Navbar';
import Ticker from '@/components/Ticker';

export default function GeneratorPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-black">
      <Navbar />
      <Ticker />
      <section className="border-b border-black px-5 py-12 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">AI Content Workspace</div>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.8rem,7vw,7rem)] leading-[0.92] text-black">
            GENERATE YOUR CONTENT
          </h1>
          <p className="mt-5 max-w-2xl font-body text-[0.98rem] leading-[1.7] text-mid">
            Select a business niche, choose a tone, add an offer if needed, and generate three post-ready content routes.
          </p>
        </div>
      </section>
      <GeneratorExperience />
      <Footer />
    </main>
  );
}
