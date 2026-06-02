'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/generator';
  const error = searchParams.get('error');

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      window.location.href = redirect;
    }
  }, [user, loading, redirect]);

  const errorMessages: Record<string, string> = {
    oauth_denied: 'You cancelled the sign-in process.',
    no_code: 'No authorization code received from Google.',
    config: 'Google OAuth is not configured on this server.',
    token_exchange: 'Failed to verify your Google account.',
    user_info: 'Could not retrieve your profile from Google.',
    unknown: 'Something went wrong. Please try again.',
  };

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-black">
      {/* Navbar-height spacer */}
      <header className="flex h-[52px] items-center border-b border-black bg-off-white px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl leading-none tracking-normal text-black">
          <span className="h-2 w-2 rounded-full border border-black bg-acid" aria-hidden="true" />
          CONTENTAI
        </Link>
      </header>

      <div className="grid min-h-[calc(100vh-52px)] lg:grid-cols-2">
        {/* Left: Branding */}
        <div className="hidden border-r border-black bg-[#eef3dd] lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-16">
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">
              <span className="h-px w-6 bg-mid" aria-hidden="true" />
              AI Content Workspace
            </div>
            <h2 className="mt-7 font-display text-[clamp(3.5rem,5vw,5.5rem)] leading-[0.92] text-black">
              <span className="block">YOUR</span>
              <span className="block">CONTENT</span>
              <span className="block text-acid [-webkit-text-stroke:1px_var(--black)]">ENGINE</span>
            </h2>
            <p className="mt-6 max-w-[340px] font-body text-[0.9rem] leading-[1.6] text-mid">
              Sign in to access AI-generated Instagram captions, hashtags, and reel ideas — built specifically for Indian local businesses.
            </p>
          </div>

          <div className="grid grid-cols-3 border border-black bg-[#fff7d9]">
            {[
              { value: '500', symbol: '+', label: 'Businesses Served' },
              { value: '10', symbol: '×', label: 'Faster Than Manual' },
              { value: '', symbol: '₹0', label: 'To Get Started' },
            ].map((stat, i, arr) => (
              <div key={stat.label} className={`flex flex-col justify-center px-5 py-5 ${i < arr.length - 1 ? 'border-r border-black' : ''}`}>
                <div className="font-display text-[2.2rem] leading-none text-black">
                  {stat.value}
                  <span className="text-acid [-webkit-text-stroke:1px_var(--black)]">{stat.symbol}</span>
                </div>
                <div className="mt-1.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-mid">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sign-in form */}
        <div className="flex flex-col items-center justify-center px-5 py-16 md:px-12">
          <div className="w-full max-w-[380px]">
            <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">
              <span className="h-px w-6 bg-mid" aria-hidden="true" />
              Account Access
            </div>

            <h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,5.5rem)] leading-[0.92] text-black">
              SIGN IN
            </h1>

            <p className="mt-4 font-body text-[0.9rem] leading-[1.6] text-mid">
              Continue with your Google account to access the AI content generator.
            </p>

            {/* Error message */}
            {error && errorMessages[error] && (
              <div className="mt-5 border border-black border-l-[3px] border-l-red-600 px-4 py-3">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-red-700">
                  {errorMessages[error]}
                </p>
              </div>
            )}

            {/* Google Sign-in button */}
            <a
              href="/api/auth/google"
              className="mt-8 flex w-full items-center justify-center gap-3 border border-black bg-black px-6 py-4 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-off-white transition-colors duration-200 hover:bg-acid hover:text-black"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border-muted" />
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-mid">or</span>
              <span className="h-px flex-1 bg-border-muted" />
            </div>

            {/* Caption tool link */}
            <div className="mt-6 border border-border-muted border-l-[3px] border-l-acid p-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-mid">
                Just need auto captions? No account required.
              </p>
              <Link
                href="/captions"
                className="mt-1 inline-block border-0 bg-transparent p-0 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-black underline"
              >
                Use free caption tool →
              </Link>
            </div>

            {/* Terms */}
            <p className="mt-8 font-mono text-[0.5rem] uppercase leading-[1.8] tracking-[0.06em] text-mid">
              By signing in, you agree to our terms of service and privacy policy.
              Your data is only used to personalise your content.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f7f1e8] text-black flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-widest text-mid">Loading workspace...</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
