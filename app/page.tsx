import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Ticker from '@/components/Ticker';

const featureItems = [
  'Instagram Captions',
  'Reel Hooks',
  'Hashtag Packs',
  'WhatsApp Replies',
  'Lead Collection',
  'Auto Follow-up',
];

const useCases = [
  {
    number: '01',
    title: 'Gyms & Studios',
    copy: 'Daily motivation posts, challenge announcements, trainer-led reel hooks, and trial-class CTAs.',
  },
  {
    number: '02',
    title: 'Salons & Clinics',
    copy: 'Offer captions, transformation hooks, service explainers, and trust-building posts for local clients.',
  },
  {
    number: '03',
    title: 'Cafes & Restaurants',
    copy: 'Menu launches, weekend offers, reels for new dishes, and captions that push visits and DMs.',
  },
  {
    number: '04',
    title: 'Stores & Agents',
    copy: 'New arrivals, property highlights, coaching batches, lead follow-ups, and WhatsApp-ready copy.',
  },
];

const portfolioImages = [
  {
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    alt: 'Restaurant dining room ready for service',
    label: 'Restaurant Campaign',
    title: 'Weekend rush captions with offer-led CTAs.',
  },
  {
    src: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80',
    alt: 'Beauty salon styling station',
    label: 'Beauty Studio',
    title: 'Transformation hooks for reels and stories.',
  },
  {
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    alt: 'Gym training equipment and weights',
    label: 'Fitness Content',
    title: 'Motivational series for trials and memberships.',
  },
  {
    src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
    alt: 'Clothing store display with garments',
    label: 'Retail Drop',
    title: 'Launch captions for new arrivals and local sales.',
  },
];

const workflow = [
  'Choose business niche',
  'Pick tone and platform',
  'Add offer or campaign angle',
  'Generate three post-ready routes',
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹0',
    suffix: 'trial',
    description: 'For testing content ideas and seeing how the generator fits your posting flow.',
    features: ['3 content variations', 'Caption + CTA + reel hook', '15 hashtags per route', 'Instagram, Facebook, WhatsApp'],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Growth',
    price: '₹999',
    suffix: 'month',
    description: 'For local brands that need consistent weekly content across offers and campaigns.',
    features: ['Unlimited generations', 'Offer-focused campaigns', 'Tone presets for local niches', 'Copy-ready hashtag packs'],
    cta: 'Choose Growth',
    featured: true,
  },
  {
    name: 'Agency',
    price: '₹4,999',
    suffix: 'month',
    description: 'For freelancers and agencies managing multiple Indian local business accounts.',
    features: ['Multi-client content workflow', 'Campaign batch planning', 'Reusable content angles', 'Priority prompt tuning'],
    cta: 'Talk To Us',
    featured: false,
  },
];

function FeatureStrip() {
  const repeatedItems = [...featureItems, ...featureItems];

  return (
    <section className="overflow-hidden whitespace-nowrap border-b border-t border-black bg-off-white py-3">
      <div className="feature-track inline-flex w-max gap-8">
        {repeatedItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2.5 font-display text-[1.1rem] uppercase tracking-[0.06em] text-black"
          >
            <span className="h-1.5 w-1.5 rounded-full border border-black bg-acid" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-[1.1rem] leading-none text-acid">{number}</span>
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">{label}</span>
    </div>
  );
}

function UseCaseGrid() {
  return (
    <section id="features" className="border-t border-black bg-[#fff7d9] px-5 py-14 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <SectionLabel number="02" label="Content Systems" />
          <h2 className="mt-5 font-display text-[clamp(3.2rem,6vw,5.5rem)] leading-[0.95] text-black">
            MADE FOR EVERYDAY POSTING
          </h2>
          <p className="mt-4 max-w-2xl font-body text-[0.98rem] leading-[1.7] text-mid">
            Pick a niche, add an offer, and generate content that sounds useful for real local customers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((item, index) => (
            <article
              key={item.title}
              className={`min-h-[260px] border border-black px-5 py-6 ${
                index % 2 === 0 ? 'bg-[#f7f1e8]' : 'bg-[#eef3dd]'
              }`}
            >
              <div className="font-display text-5xl leading-none text-acid [-webkit-text-stroke:1px_var(--black)]">
                {item.number}
              </div>
              <h3 className="mt-5 font-display text-4xl leading-none text-black">{item.title}</h3>
              <p className="mt-4 max-w-sm font-body text-[0.92rem] leading-[1.65] text-mid">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioWall() {
  return (
    <section id="portfolio" className="border-t border-black bg-[#f7f1e8] px-5 py-14 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
          <SectionLabel number="03" label="Portfolio Feel" />
            <h2 className="mt-5 font-display text-[clamp(3.2rem,6vw,5.4rem)] leading-[0.95] text-black">
              REAL BUSINESS VISUAL ENERGY
          </h2>
          </div>
          <p className="max-w-2xl font-body text-[0.98rem] leading-[1.7] text-mid lg:justify-self-end">
            The homepage should feel stylish but not overloaded. These image cards keep the product connected to cafes,
            salons, gyms, and retail without turning the page into a heavy collage.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {portfolioImages.map((image) => (
            <article
              key={image.label}
              className="border border-black bg-off-white"
            >
              <img src={image.src} alt={image.alt} className="h-56 w-full object-cover md:h-64" />
              <div className="border-t border-black px-4 py-4">
                <div className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-mid">{image.label}</div>
                <p className="mt-2 font-body text-[0.85rem] leading-[1.45] text-black">{image.title}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="border-t border-black bg-[#eef3dd] px-5 py-14 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Workflow</div>
          <h2 className="mt-5 font-display text-[clamp(3.2rem,6vw,5.4rem)] leading-[0.95] text-black">
            FROM BRIEF TO POST IN MINUTES
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
        {workflow.map((step, index) => (
          <div key={step} className="min-h-[190px] border border-black bg-[#f7f1e8] px-5 py-6">
            <div className="font-display text-5xl leading-none text-acid [-webkit-text-stroke:1px_var(--black)]">
              0{index + 1}
            </div>
            <div className="mt-8 font-mono text-[0.68rem] uppercase leading-[1.6] tracking-[0.12em] text-black">{step}</div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="border-t border-black bg-[#fff7d9] px-5 py-14 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
        <SectionLabel number="04" label="Pricing" />
            <h2 className="mt-5 font-display text-[clamp(3.2rem,6vw,5.4rem)] leading-[0.95] text-black">
              SIMPLE CONTENT PLANS
          </h2>
          </div>
          <p className="max-w-2xl font-body text-[0.98rem] leading-[1.7] text-mid lg:justify-self-end">
            Clean SaaS-style cards with enough detail to compare plans quickly, without making the pricing area feel heavy.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <article
              key={plan.name}
              className={`flex min-h-[500px] flex-col border border-black ${
                plan.featured ? 'bg-[#f7f1e8]' : index === 0 ? 'bg-off-white' : 'bg-[#eef3dd]'
              }`}
            >
              <div className={`${plan.featured ? 'bg-black text-off-white' : 'bg-off-white text-black'} border-b border-black px-5 py-5`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-4xl leading-none">{plan.name}</h3>
                  {plan.featured ? (
                    <span className="border border-off-white px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-off-white">
                      Most Chosen
                    </span>
                  ) : null}
                </div>
                <p className={`mt-4 font-body text-[0.85rem] leading-[1.55] ${plan.featured ? 'text-off-white' : 'text-mid'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="border-b border-black px-5 py-6">
                <div className="flex items-end gap-2">
                  <span className="font-display text-7xl leading-none text-black">{plan.price}</span>
                  <span className="pb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">/{plan.suffix}</span>
                </div>
              </div>

              <ul className="flex-1 divide-y divide-border-muted px-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 py-4 font-body text-[0.88rem] leading-[1.45] text-black">
                    <span className="font-mono text-[0.7rem] text-black">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-black p-5">
                <a
                  href="/book"
                  className={`block w-full border border-black px-4 py-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.1em] ${
                    plan.featured
                      ? 'bg-black text-off-white hover:bg-acid hover:text-black'
                      : 'bg-transparent text-black hover:bg-black hover:text-off-white'
                  }`}
                >
                  {plan.cta} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-off-white text-black">
      <Navbar />
      <Ticker />
      <Hero />
      <FeatureStrip />
      <UseCaseGrid />
      <PortfolioWall />
      <WorkflowSection />
      <PricingSection />
      <section id="contact" className="border-t border-black px-4 py-8 md:px-8">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Contact</div>
        <a href="mailto:hello@contentai.local" className="mt-3 inline-block font-display text-5xl leading-none text-black hover:underline">
          HELLO@CONTENTAI.LOCAL
        </a>
        <div className="mt-6">
          <a
            href="/leads"
            className="inline-block border border-black bg-black px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
          >
            Get Free Content Audit
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
