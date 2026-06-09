import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, HeartHandshake, Users } from 'lucide-react';

const openings = [
  'Property Management Associate',
  'Leasing Officer',
  'Accounting and Admin Specialist',
];

const CareersPage = () => (
  <div className="bg-brand-background-alt">
    <section className="bg-brand-primary py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Careers</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Build value with a team focused on operational excellence.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
          Join a professional property organization shaped by operational discipline, client-focused
          values, and the practical details that keep commercial assets performing.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3">
        {[
          { title: 'Professional work culture', icon: Users },
          { title: 'Operational discipline', icon: BriefcaseBusiness },
          { title: 'Client-focused values', icon: HeartHandshake },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-3xl bg-white p-6 shadow-card">
              <Icon className="h-8 w-8 text-brand-primary" />
              <h2 className="mt-5 text-xl font-bold text-brand-text">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-brand-text/68">
                Join a group focused on reliable service, tenant relationships, and responsible portfolio growth.
              </p>
            </article>
          );
        })}
      </div>
      <div className="mx-auto mt-10 max-w-7xl rounded-3xl bg-white p-8 shadow-card sm:px-10">
        <h2 className="text-2xl font-bold text-brand-text">Current Opportunities</h2>
        <div className="mt-6 grid gap-3">
          {openings.map((opening) => (
            <div key={opening} className="flex flex-col gap-3 rounded-2xl border border-brand-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-brand-text">{opening}</span>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                Express Interest
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default CareersPage;
