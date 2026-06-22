import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Globe2 } from 'lucide-react';
import { stats } from '../data/siteContent.js';
import { companyMilestones, companyProfile, regionalReach } from '../data/enterpriseContent.js';

const values = ['Compassion', 'Leadership', 'Integrity', 'Excellence', 'Nurtureship', 'Teamwork', 'Sense of Urgency'];

const AboutPage = () => (
    <div className="bg-brand-background-alt">
    <section className="relative overflow-hidden bg-brand-primary py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(117,162,191,0.36),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Company</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            A property partner shaped by the Amalgated Way.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{companyProfile.positioning}</p>
        </div>
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Origin Story</p>
          <p className="mt-4 text-lg leading-8 text-white/82">{companyProfile.founding}</p>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-brand-text">Who We Are</h2>
          <p className="mt-4 leading-8 text-brand-text/75">{companyProfile.mission}</p>
          <p className="mt-4 leading-8 text-brand-text/75">{companyProfile.vision}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Property acquisition and leasing', 'Tenant and portfolio management', 'Property development and ventures', 'Business management consultancy', 'Project 101 nationwide expansion', 'Investor-ready reporting discipline'].map((item) => (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {companyMilestones.map((milestone) => (
            <div key={milestone.year} className="rounded-3xl border border-brand-secondary/20 bg-brand-background-alt p-5">
              <p className="text-2xl font-black text-brand-primary">{milestone.year}</p>
              <p className="mt-2 text-sm font-bold text-brand-text">{milestone.title}</p>
              <p className="mt-2 text-xs leading-5 text-brand-text/65">{milestone.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-brand-secondary/20 p-6">
              <p className="text-4xl font-bold text-brand-primary">{stat.prefix}{stat.value}{stat.suffix}</p>
              <p className="mt-3 text-sm font-semibold text-brand-text">{stat.label}</p>
              <p className="mt-2 text-sm text-brand-text/65">{stat.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-card">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
            <Globe2 className="h-4 w-4" />
            Nationwide Reach
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {regionalReach.map((region) => (
              <div key={region.region} className="rounded-3xl bg-brand-background-alt p-5">
                <p className="text-xl font-bold text-brand-text">{region.region}</p>
                <p className="mt-2 text-sm font-semibold text-brand-primary">{region.assets} active assets</p>
                <p className="mt-3 text-sm leading-6 text-brand-text/68">{region.focus}</p>
              </div>
            ))}
          </div>
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
