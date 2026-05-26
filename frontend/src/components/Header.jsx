import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/apmc.png';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Leadership', to: '/leadership' },
  { label: 'Properties', to: '/properties' },
  { label: 'Investors', to: '/investors' },
  { label: 'Projects', to: '/projects' },
  { label: 'News', to: '/news' },
  { label: 'Careers', to: '/careers' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-primary/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex shrink-0 items-center gap-3 transition hover:opacity-90">
          <img
            src={logo}
            alt="Amalgated Properties &amp; Management Corporation"
            className="h-11 w-11 object-contain sm:h-12 sm:w-12"
          />
          <span className="hidden flex-col leading-tight sm:flex sm:flex-col">
            <span className="text-sm font-semibold tracking-wide text-brand-text">
              Amalgated Properties
            </span>
            <span className="text-xs text-brand-text/70">
              Management Corporation
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-text lg:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
          <Link to="/portal" className="nav-link">
            Client Portal
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-brand-primary transition hover:bg-brand-primary-hover"
          >
            Contact
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-11 min-w-[44px] items-center justify-center rounded-lg text-brand-text hover:bg-black/10 lg:hidden"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-brand-secondary/40 px-4 py-4 lg:hidden">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="block rounded-lg px-3 py-2.5 text-brand-text hover:bg-brand-primary/10 hover:text-brand-primary" onClick={closeMobileMenu}>
              {link.label}
            </Link>
          ))}
          <Link to="/portal" className="block rounded-lg px-3 py-2.5 text-brand-text hover:bg-brand-primary/10 hover:text-brand-primary" onClick={closeMobileMenu}>
            Client Portal
          </Link>
          <Link to="/contact" className="mt-3 block rounded-xl bg-brand-primary px-4 py-3 text-center text-sm font-semibold text-white" onClick={closeMobileMenu}>
            Contact
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
