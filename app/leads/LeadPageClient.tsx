'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const businessOptions = [
  'Gym / Fitness Studio',
  'Salon & Beauty Parlour',
  'Cafe / Restaurant',
  'Retail Store',
  'Real Estate',
  'Coaching Institute',
  'Clinic',
  'Other Local Business',
];

const serviceOptions = [
  'Instagram Content Package',
  'Auto Caption Tool',
  'WhatsApp Automation',
  'Full Agency Package',
  'Just Exploring',
];

const initialForm = {
  name: '',
  phone: '',
  email: '',
  business_type: '',
  business_name: '',
  city: '',
  service_interest: 'Instagram Content Package',
  message: '',
};

type LeadForm = typeof initialForm;

export default function LeadPageClient() {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState('');

  const updateField = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit lead');
      }

      setLeadId(data.id || 'submitted');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-off-white text-black">
      <header className="flex h-[56px] items-center justify-between border-b border-black bg-off-white px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl leading-none text-black">
          <span className="h-2 w-2 border border-black bg-acid" aria-hidden="true" />
          CONTENTAI
        </Link>
        <Link
          href="/"
          className="border border-black bg-transparent px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white"
        >
          Back To Site
        </Link>
      </header>

      <section className="grid min-h-[calc(100vh-56px)] border-b border-black lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between border-b border-black bg-[#eef3dd] px-5 py-10 md:px-10 lg:border-b-0 lg:border-r">
          <div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Free Content Audit</div>
            <h1 className="mt-5 max-w-2xl font-display text-[clamp(3.8rem,8vw,7rem)] leading-[0.9] text-black">
              FIND WHAT YOUR CONTENT IS MISSING
            </h1>
            <p className="mt-5 max-w-xl font-body text-[0.98rem] leading-[1.7] text-mid">
              Share your business details and get a practical audit direction for captions, reels, hooks, and lead flow.
            </p>
          </div>

          <div className="mt-10 grid border border-black bg-[#fff7d9] md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {['Caption gaps', 'Reel angles', 'Lead CTA fixes'].map((item, index) => (
              <div key={item} className={`px-4 py-5 ${index < 2 ? 'border-b border-black md:border-b-0 md:border-r lg:border-b lg:border-r-0 xl:border-b-0 xl:border-r' : ''}`}>
                <div className="font-display text-4xl leading-none text-acid [-webkit-text-stroke:1px_var(--black)]">
                  0{index + 1}
                </div>
                <div className="mt-3 font-mono text-[0.62rem] uppercase leading-[1.5] tracking-[0.1em] text-black">
                  {item}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border border-black bg-off-white p-5">
            <div className="font-display text-5xl leading-none text-black">500+</div>
            <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">
              Local business content systems reviewed
            </div>
          </div>
        </div>

        <div className="px-5 py-10 md:px-10">
          {leadId ? (
            <div className="flex min-h-[520px] flex-col justify-center border border-black bg-off-white p-6">
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Request Received</div>
              <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5rem)] leading-none text-black">
                THANK YOU
              </h2>
              <p className="mt-4 max-w-md font-body text-[0.95rem] leading-[1.7] text-mid">
                Your audit request is saved. Try the free caption tool while we review your details.
              </p>
              <Link
                href="/captions"
                className="mt-8 w-fit border border-black bg-black px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
              >
                Open Caption Tool
              </Link>
            </div>
          ) : (
            <form onSubmit={submitLead} className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Name" required>
                  <input
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    required
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
                <Field label="Phone / WhatsApp" required>
                  <input
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    required
                    inputMode="tel"
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Email">
                  <input
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    type="email"
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
                <Field label="Business Type" required>
                  <select
                    value={form.business_type}
                    onChange={(event) => updateField('business_type', event.target.value)}
                    required
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  >
                    <option value="">Select business type</option>
                    {businessOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Business Name">
                  <input
                    value={form.business_name}
                    onChange={(event) => updateField('business_name', event.target.value)}
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
                <Field label="City">
                  <input
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
              </div>

              <div>
                <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">Service Interest</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {serviceOptions.map((option) => {
                    const active = form.service_interest === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField('service_interest', option)}
                        className={`border px-3 py-3 text-left font-mono text-[0.58rem] uppercase tracking-[0.08em] ${
                          active
                            ? 'border-black bg-black text-acid'
                            : 'border-border-muted bg-transparent text-mid hover:border-black hover:text-black'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Message">
                <textarea
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  rows={5}
                  className="w-full resize-none border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                />
              </Field>

              {error ? (
                <div className="border border-black px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-black bg-black px-5 py-4 font-display text-[1.4rem] uppercase tracking-[0.06em] text-off-white hover:bg-acid hover:text-black disabled:bg-mid"
              >
                {isSubmitting ? 'Submitting' : 'Get Free Content Audit'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}
