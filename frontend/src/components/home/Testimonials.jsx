import React from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '../../data/siteContent.js';

const Testimonials = () => (
  <section className="bg-white py-16 sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Testimonials</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          Trusted by business tenants and partners.
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name} className="rounded-3xl border border-brand-secondary/20 bg-brand-background-alt p-6">
            <Quote className="h-8 w-8 text-brand-primary" />
            <p className="mt-5 text-base leading-7 text-brand-text/78">"{testimonial.quote}"</p>
            <div className="mt-6 border-t border-brand-secondary/20 pt-5">
              <p className="font-semibold text-brand-text">{testimonial.name}</p>
              <p className="text-sm text-brand-text/60">{testimonial.role}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
