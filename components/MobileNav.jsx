'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/featured', label: 'Featured' },
    { href: '/browse', label: 'Browse' },
    { href: '/albums', label: 'Albums' },
    { href: '/tags', label: 'Tags' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
        aria-label="Menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-[73px] right-0 left-0 glass-dark border-b border-white/10 z-50 animate-slide-down">
            <nav className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}