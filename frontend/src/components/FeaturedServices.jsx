import React from 'react';
import { Link } from 'react-router-dom';


const FeaturedServices = () => {
  return (
    <section className="border-t border-brand-secondary/30 bg-brand-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex w-full max-w-md items-center gap-4">
            <span className="h-px flex-1 border-t border-dashed border-brand-secondary/60" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-text/60">
              Featured Services
            </p>
            <span className="h-px flex-1 border-t border-dashed border-brand-secondary/60" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Full-cycle solutions from leasing to management
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-brand-text/80">
            We operate through a disciplined, client-focused approach—combining strategic leasing,
            professional property management, and risk-managed operations to deliver stable,
            long-term value for our tenants and partners.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-brand-primary transition hover:bg-brand-primary-hover"
          >
            Get in touch
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
