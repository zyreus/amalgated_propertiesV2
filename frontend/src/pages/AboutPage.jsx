import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { stats } from '../data/siteContent.js';

const values = ['Compassion', 'Leadership', 'Integrity', 'Excellence', 'Nurtureship', 'Teamwork', 'Sense of Urgency'];

const AboutPage = () => (
  <div className="bg-brand-background-alt">
    <section className="bg-brand-primary py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Company</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          A property partner shaped by the Amalgated Way.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
          APMC is part of the Amalgated Group real estate arm, providing leasing, property management,
          development support, and strategic consultancy for businesses and institutions.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-brand-text">Who We Are</h2>
          <p className="mt-4 leading-8 text-brand-text/75">
            Amalgated Capital Inc., Amalgated Properties & Management Corporation, and Amalgated
            Land & Development Corporation work together to acquire, manage, lease, and develop
            real estate assets across the Philippines.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Property acquisition and leasing', 'Tenant and portfolio management', 'Property development and ventures', 'Business management consultancy'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-brand-text">
                <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-brand-text">Core Values</h2>
          <p className="mt-4 leading-8 text-brand-text/75">
            Our culture is anchored by CLIENTS and a service commitment to Partners, Employees,
            Tenants, and Suppliers.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {values.map((value) => (
              <span key={value} className="rounded-full bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary">
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-brand-secondary/20 p-6">
              <p className="text-4xl font-bold text-brand-primary">{stat.value}</p>
              <p className="mt-3 text-sm font-semibold text-brand-text">{stat.label}</p>
              <p className="mt-2 text-sm text-brand-text/65">{stat.detail}</p>
            </div>
          ))}
        </div>
        <Link to="/contact" className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
          Connect With Us
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </div>
);

export default AboutPage;
