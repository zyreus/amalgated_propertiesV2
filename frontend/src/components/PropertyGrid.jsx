import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Ruler } from 'lucide-react';
import { useProperties } from '../hooks/useProperties.js';

const PropertyGrid = () => {
  const { properties, loading } = useProperties();
  return (
    <section
      id="properties"
      className="border-t border-brand-secondary/30 bg-brand-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-l-4 border-brand-primary pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Real Estate
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Our Core Business
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-brand-text/90">
            We provide property solutions for banks, BPOs, corporate offices, commercial tenants,
            retail operators, individual professionals, landowners, sales agents, cooperatives, and
            government institutions.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-text/90">
            <strong className="text-brand-text">APMC</strong> provides property management and
            consultancy, while <strong className="text-brand-text">Amalgated Land</strong> supports
            property development.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {loading && (
            <p className="col-span-full text-center text-sm text-brand-text-muted">Loading properties…</p>
          )}
          {properties.map((property) => (
            <article
              key={property.slug}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-secondary/40 bg-brand-background shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-primary">
                  {property.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 pt-3">
                <span className="rounded-full border border-brand-secondary/60 bg-brand-background-alt px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-text">
                  {property.region}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-brand-primary">
                  {property.tag}
                </span>
              </div>
              <div className="px-4 pb-4 pt-2">
                <h3 className="text-base font-semibold tracking-tight text-brand-text">
                  {property.name}
                </h3>
                <p className="mt-1 text-sm text-brand-text/70">{property.location}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-brand-text/65">
                  <span>{property.price}</span>
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5 text-brand-primary" />
                    {property.beds} beds
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-brand-primary" />
                    {property.sqft} sqft
                  </span>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-brand-secondary/30 px-4 pb-4 pt-3 text-sm text-brand-text/70">
                <p>{property.category}</p>
                <Link
                  to={`/properties/${property.slug}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-secondary/60 text-brand-text transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                  aria-label={`View ${property.name}`}
                >
                  →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;
