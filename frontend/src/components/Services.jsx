import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: 'Property Acquisition & Development',
    body: 'Acquisition and development of properties; joint ventures via ALDC.'
  },
  {
    title: 'Leasing Services',
    body: 'Residential, commercial, and office space leasing with flexible terms.'
  },
  {
    title: 'Property & Asset Management',
    body: 'End-to-end leasing, property, and tenant management for consistent service quality and asset performance.'
  },
  {
    title: 'Project Management',
    body: 'Structured delivery to align budgets, timelines, and stakeholder requirements.'
  },
  {
    title: 'Risk & Credit Management',
    body: 'Risk-managed operations supporting stable leasing performance and scalable growth.'
  }
];

const salesChannels = [
  'Direct Leasing',
  'Broker & Agent Network (via APMC)',
  'Digital Listings & Marketplaces'
];

const leasingOptions = ['Residential', 'Commercial', 'Office Spaces'];

const paymentTerms = ['Monthly Rental Fees', 'Rent-to-Own Program (up to 8 years)'];

const valueAdds = [
  'Short-, Mid-, and Long-Term Lease Options',
  'Affordable & Flexible Payment Structures',
  'Fast Processing & Approvals',
  'Dedicated After-Sales & Tenant Support'
];

const Services = () => {
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        force3D: true,
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    }, cardsRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      className="border-t border-brand-secondary/30 bg-brand-background-alt py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-l-4 border-brand-green pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
            Services
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            What do we offer?
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-text/90">
            We operate through a disciplined, client-focused approach—combining strategic leasing,
            professional property management, and risk-managed operations to deliver stable,
            long-term value for our tenants and partners.
          </p>
        </div>

        {/* What we offer - 5 services */}
        <div ref={cardsRef} className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              data-reveal
              className="flex flex-col rounded-2xl border border-brand-secondary/40 bg-brand-background p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark">
                {service.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
                {service.body}
              </p>
            </article>
          ))}
        </div>

        {/* How we do business */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold tracking-tight text-brand-text">
            How we do business
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-brand-secondary/40 bg-brand-background p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                Sales Channels
              </h4>
              <ul className="mt-3 space-y-1.5 text-sm text-brand-text/90">
                {salesChannels.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-secondary/40 bg-brand-background p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                Leasing Options
              </h4>
              <ul className="mt-3 space-y-1.5 text-sm text-brand-text/90">
                {leasingOptions.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-secondary/40 bg-brand-background p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                Payment Terms
              </h4>
              <ul className="mt-3 space-y-1.5 text-sm text-brand-text/90">
                {paymentTerms.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-secondary/40 bg-brand-background p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                Other Value Adds
              </h4>
              <ul className="mt-3 space-y-1.5 text-sm text-brand-text/90">
                {valueAdds.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
