'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { label: 'Features', href: '/#features' },
  { label: 'Generator', href: '/generator' },
  { label: 'Caption Tool', href: '/captions', badge: 'FREE' },
  { label: 'Book a Call', href: '/book' },
];

const authedNavItems = [
  { label: 'Ideas', href: '/ideas' },
  { label: 'Scripts', href: '/scripts' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-black bg-off-white px-4 md:px-8">
      <Link href="/" className="flex items-center gap-2 font-display text-2xl leading-none tracking-normal text-black">
        <span className="h-2 w-2 rounded-full border border-black bg-acid" aria-hidden="true" />
        CONTENTAI
      </Link>

      <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-black hover:underline"
          >
            {item.label}
            {item.badge ? (
              <span className="ml-[5px] border border-black bg-acid px-[5px] py-px align-middle font-mono text-[0.5rem] uppercase tracking-[0.08em] text-black">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
        {user
          ? authedNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-black hover:underline"
              >
                {item.label}
              </Link>
            ))
          : null}
      </nav>

      {/* Auth area */}
      {loading ? (
        <div className="h-8 w-20 animate-pulse bg-border-muted" />
      ) : user ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 border border-black bg-transparent px-2 py-1.5 transition-colors hover:bg-[#eef3dd]"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                width={24}
                height={24}
                className="h-6 w-6 border border-black object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center border border-black bg-acid font-display text-[0.7rem] text-black">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.08em] text-black md:inline">
              {user.name.split(' ')[0]}
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[220px] border border-black bg-off-white shadow-[4px_4px_0_var(--black)]">
              <div className="border-b border-black px-4 py-3">
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-black">{user.name}</div>
                <div className="mt-0.5 font-mono text-[0.5rem] tracking-[0.04em] text-mid">{user.email}</div>
              </div>
              <Link
                href="/generator"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 border-b border-border-muted px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-black hover:bg-[#eef3dd]"
              >
                <span className="h-1 w-1 rounded-full bg-acid" />
                Generator
              </Link>
              {authedNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 border-b border-border-muted px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-black hover:bg-[#eef3dd]"
                >
                  <span className="h-1 w-1 rounded-full bg-acid" />
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => { setMenuOpen(false); logout(); }}
                className="flex w-full items-center gap-2 bg-transparent px-4 py-2.5 text-left font-mono text-[0.58rem] uppercase tracking-[0.08em] text-black hover:bg-[#fff0f0]"
              >
                <span className="h-1 w-1 rounded-full bg-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="border border-black bg-black px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
        >
          Sign In →
        </Link>
      )}
    </header>
  );
}
