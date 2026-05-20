import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ContactCTA = () => (
  <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
    <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-primary p-8 text-white shadow-soft sm:p-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Start a Conversation</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Looking for a property partner who can support your next move?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
            Speak with the Amalgated team about leasing availability, property management, or partnership opportunities.
          </p>
        </div>
        <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-background-alt">
          Contact APMC
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default ContactCTA;
