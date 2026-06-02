const services = ['Instagram Content', 'WhatsApp Automation', 'Lead Collection', 'Custom Package'];

export default function Footer() {
  return (
    <footer className="grid border-t border-black md:grid-cols-3">
      <div className="border-b border-black px-4 py-6 md:border-b-0 md:border-r md:px-8">
        <div className="font-display text-[2rem] leading-none text-black">CONTENTAI</div>
        <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">AI Content for Bharat</div>
      </div>

      <div className="border-b border-black px-4 py-6 md:border-b-0 md:border-r md:px-8">
        <div className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">SERVICES</div>
        <div className="flex flex-col items-start gap-1">
          {services.map((service) => (
            <a key={service} href="#features" className="font-body text-[0.85rem] text-black hover:underline">
              {service}
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-end px-4 py-6 md:px-8">
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">Built for Indian Businesses</div>
      </div>
    </footer>
  );
}
