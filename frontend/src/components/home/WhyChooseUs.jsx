import React from 'react';
import { reasons } from '../../data/siteContent.js';

const WhyChooseUs = () => (
  <section className="bg-brand-primary py-16 text-white sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Why Choose Us</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Corporate standards with grounded local execution.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <article key={reason.title} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <Icon className="h-8 w-8 text-brand-accent" />
                <h3 className="mt-5 text-lg font-bold text-white">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/72">{reason.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
