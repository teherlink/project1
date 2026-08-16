"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="TetherLink home">
        <Image src="/tehterlink-logo.png" alt="TetherLink logo" width={200} height={100} priority />
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/why-tether-link">Why Tether Link</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/transparency">Transparency</Link>
      </nav>

      <div className="header-actions">
        <Link href="/app/login" className="btn btn-ghost">
          Log In
        </Link>
        <Link href="/app" className="btn btn-primary">
          Sign Up
        </Link>
      </div>

      <button
        type="button"
        className={`mobile-menu-toggle${mobileOpen ? ' open' : ''}`}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`mobile-menu-panel${mobileOpen ? ' open' : ''}`}>
        <nav className="mobile-nav-links" aria-label="Mobile navigation">
          <Link href="/why-tether-link" onClick={() => setMobileOpen(false)}>Why Tether Link</Link>
          <Link href="/how-it-works" onClick={() => setMobileOpen(false)}>How it works</Link>
          <Link href="/transparency" onClick={() => setMobileOpen(false)}>Transparency</Link>
        </nav>

        <div className="mobile-menu-actions">
          <Link href="/app/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>
            Log In
          </Link>
          <Link href="/app" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
