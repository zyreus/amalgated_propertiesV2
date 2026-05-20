import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, Ruler } from 'lucide-react';
import { useProperties } from '../../hooks/useProperties.js';

const FeaturedProperties = () => {
  const { properties, loading } = useProperties({ featured: 1 });
  const featuredProperties = properties.filter((property) => property.featured).slice(0, 6);

  return (
  <section className="bg-white py-16 sm:py-24 dark:bg-brand-surface-dark">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Featured Portfolio</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            High-value spaces across the country.
          </h2>
        </div>
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
          View all properties
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading && (
          <p className="col-span-full text-center text-sm text-brand-text-muted">Loading featured properties…</p>
        )}
        {featuredProperties.map((property) => (
          <Link
            key={property.slug}
            to={`/properties/${property.slug}`}
            className="group overflow-hidden rounded-3xl border border-brand-secondary/20 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="relative h-56 overflow-hidden">
              <img src={property.image} alt={property.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-primary">
                {property.status}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{property.region}</p>
                <p className="text-sm font-semibold text-brand-text">{property.price}</p>
              </div>
              <h3 className="mt-3 text-lg font-bold text-brand-text">{property.name}</h3>
              <p className="mt-1 text-sm text-brand-text/65">{property.location}</p>
              <div className="mt-5 flex items-center gap-4 border-t border-brand-secondary/20 pt-4 text-sm text-brand-text/70">
                <span className="inline-flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4 text-brand-primary" />
                  {property.beds} beds
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="h-4 w-4 text-brand-primary" />
                  {property.sqft} sqft
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
  );
};

export default FeaturedProperties;
