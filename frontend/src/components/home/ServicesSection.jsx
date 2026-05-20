import React from 'react';
import { services } from '../../data/siteContent.js';

const ServicesSection = () => (
  <section className="bg-white py-16 sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Services</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          Property services built for operational confidence.
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <article key={service.title} className="rounded-3xl border border-brand-secondary/20 bg-brand-background-alt p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-lg font-bold text-brand-text">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-brand-text/68">{service.description}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default ServicesSection;
