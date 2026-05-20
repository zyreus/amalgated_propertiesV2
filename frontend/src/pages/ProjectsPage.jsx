import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { projects } from '../data/siteContent.js';

const ProjectsPage = () => (
  <div className="bg-brand-background-alt">
    <section className="bg-brand-primary py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Projects</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Portfolio initiatives across strategic markets.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
          Explore selected property programs that reflect APMC's focus on access, tenant support,
          and long-term asset value.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project.title} className="overflow-hidden rounded-3xl bg-white shadow-card">
            <img src={project.image} alt={project.title} className="h-60 w-full object-cover" />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{project.category}</p>
              <h2 className="mt-3 text-xl font-bold text-brand-text">{project.title}</h2>
              <p className="mt-1 text-sm text-brand-text/60">{project.location}</p>
              <p className="mt-4 text-sm leading-6 text-brand-text/70">{project.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-2 max-w-7xl px-4 sm:px-6">
        <Link to="/properties" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
          View Property Listings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </div>
);

export default ProjectsPage;
