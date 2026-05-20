import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';


const HERO_TITLE = 'Amalgated Properties & Management Corporation (APMC)';

const Hero = () => {
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!titleRef.current || !contentRef.current) return;
    const ctx = gsap.context(() => {
      const words = titleRef.current.querySelectorAll('.hero-word');
      gsap.set(words, { yPercent: 110, opacity: 0 });
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power4.out',
        stagger: 0.06,
        force3D: true,
        delay: 0.2,
      });

      gsap.from(contentRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        force3D: true,
        delay: 0.6,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-brand-dark py-20 text-white sm:py-28 lg:py-36"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,197,94,0.25)_0%,transparent_50%)]" aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-brand-green/40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bbf7d0]">
          Real Estate &amp; Property Management
        </p>
        <h1
          ref={titleRef}
          className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          style={{ clipPath: 'inset(0 0 0 0)' }}
        >
          {HERO_TITLE.split(' ').map((word, i) => (
            <span key={i} className="hero-word inline-block will-change-transform" style={{ marginRight: '0.3em' }}>
              {word}
            </span>
          ))}
        </h1>
        <div ref={contentRef}>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
          Your trusted partner in creating meaningful spaces for work, life, and growth. APMC delivers
          leasing, property &amp; asset management, and strategic consultancy for banks, BPOs,
          corporate offices, commercial tenants, and institutions nationwide.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-brand-green transition hover:bg-brand-green-hover"
          >
            Inquire about leasing
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <Link
            to="/properties"
            className="inline-flex items-center text-sm font-semibold text-white/90 transition hover:text-white"
          >
            View properties
            <span className="ml-2 h-px w-6 bg-white/50" />
          </Link>
        </div>
        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8 text-sm text-white/80">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-white/60">
              Commercial real estate
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-white">92</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-white/60">
              Residential estate
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-white">10</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-white/60">
              Total lease receivables
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-white">
              4.4B <span className="text-sm font-normal text-white/60">(with contract)</span>
            </dd>
          </div>
        </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
