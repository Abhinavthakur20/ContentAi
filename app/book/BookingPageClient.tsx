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

const packages = [
  { name: 'Basic', price: '3000', copy: 'Weekly captions, hashtag routes, and content direction.' },
  { name: 'Standard', price: '7000', copy: 'Reels, posts, captions, and monthly campaign planning.' },
  { name: 'Premium', price: '10000', copy: 'Full content engine with lead capture and automation support.' },
];

const services = ['Free Consultation', 'Basic Package', 'Standard Package', 'Premium Package'];
const timeSlots = ['10 AM', '11 AM', '12 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  business_type: '',
  service: 'Free Consultation',
  preferred_date: '',
  preferred_time: '10 AM',
  message: '',
};

type BookingForm = typeof initialForm;

export default function BookingPageClient() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');

  const updateField = (field: keyof BookingForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setBookingId(data.id || 'submitted');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit booking');
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

      <section className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-black bg-[#fff7d9] px-5 py-10 md:px-10 lg:border-b-0 lg:border-r">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Free Strategy Call</div>
          <h1 className="mt-5 max-w-xl font-display text-[clamp(3.8rem,8vw,7rem)] leading-[0.9] text-black">
            BOOK YOUR CONTENT PLAN CALL
          </h1>
          <p className="mt-5 max-w-xl font-body text-[0.98rem] leading-[1.7] text-mid">
            Pick a time and we will map the right content package for your local business.
          </p>

          <div className="mt-10 grid gap-4">
            {packages.map((item, index) => (
              <article key={item.name} className="grid border border-black bg-off-white md:grid-cols-[160px_1fr]">
                <div className={`border-b border-black px-4 py-5 md:border-b-0 md:border-r ${index === 1 ? 'bg-black text-off-white' : ''}`}>
                  <h2 className="font-display text-4xl leading-none">{item.name}</h2>
                  <div className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.1em]">
                    Rs {item.price}/month
                  </div>
                </div>
                <p className="px-4 py-5 font-body text-[0.9rem] leading-[1.65] text-mid">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="px-5 py-10 md:px-10">
          {bookingId ? (
            <div className="flex min-h-[520px] flex-col justify-center border border-black bg-off-white p-6">
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">Call Booked</div>
              <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5rem)] leading-none text-black">
                CONFIRMED REQUEST
              </h2>
              <p className="mt-4 max-w-md font-body text-[0.95rem] leading-[1.7] text-mid">
                Your booking request is saved. We will confirm the slot and next steps.
              </p>
              <Link
                href="/captions"
                className="mt-8 w-fit border border-black bg-black px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
              >
                Try Free Caption Tool
              </Link>
            </div>
          ) : (
            <form onSubmit={submitBooking} className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Name" required>
                  <input
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    required
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    type="email"
                    required
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Phone" required>
                  <input
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    required
                    inputMode="tel"
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

              <Field label="Service" required>
                <select
                  value={form.service}
                  onChange={(event) => updateField('service', event.target.value)}
                  required
                  className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Preferred Date" required>
                  <input
                    value={form.preferred_date}
                    onChange={(event) => updateField('preferred_date', event.target.value)}
                    type="date"
                    required
                    className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
                  />
                </Field>
                <div>
                  <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-mid">
                    Preferred Time *
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const active = form.preferred_time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => updateField('preferred_time', slot)}
                          className={`border px-3 py-3 font-mono text-[0.6rem] uppercase tracking-[0.08em] ${
                            active
                              ? 'border-black bg-acid text-black'
                              : 'border-border-muted bg-transparent text-mid hover:border-black hover:text-black'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
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
                {isSubmitting ? 'Submitting' : 'Book Free Call'}
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
