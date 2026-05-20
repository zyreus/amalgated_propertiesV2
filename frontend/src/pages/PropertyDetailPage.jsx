import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, BedDouble, MapPin, Ruler } from 'lucide-react';
import { properties } from '../data/properties.js';
import { useProperty } from '../hooks/useProperties.js';

const PropertyDetailPage = () => {
  const { slug } = useParams();
  const { property, loading } = useProperty(slug);

  if (!loading && !property) {
    return <Navigate to="/properties" replace />;
  }

  if (loading || !property) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-brand-text-muted">Loading property…</p>
      </div>
    );
  }

  const related = properties
    .filter((item) => item.slug !== property.slug && item.region === property.region)
    .slice(0, 3);

  return (
    <div className="bg-brand-background-alt">
      <section className="bg-brand-primary py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link to="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to properties
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
            <img src={property.image} alt={property.name} className="h-[460px] w-full object-cover" />
          </div>
          <aside className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">{property.category}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-brand-text">{property.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-brand-text/68">
              <MapPin className="h-5 w-5 text-brand-primary" />
              {property.location}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="text-brand-text/55">Status</p>
                <p className="mt-1 font-semibold text-brand-text">{property.status}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="text-brand-text/55">Price</p>
                <p className="mt-1 font-semibold text-brand-text">{property.price}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="flex items-center gap-2 text-brand-text/55"><BedDouble className="h-4 w-4" /> Beds</p>
                <p className="mt-1 font-semibold text-brand-text">{property.beds}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="flex items-center gap-2 text-brand-text/55"><Ruler className="h-4 w-4" /> Area</p>
                <p className="mt-1 font-semibold text-brand-text">{property.sqft} sqft</p>
              </div>
            </div>
            <p className="mt-6 leading-8 text-brand-text/72">{property.description}</p>
            <Link to="/contact" className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">
              Request Leasing Details
            </Link>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-brand-text">More in {property.region}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} to={`/properties/${item.slug}`} className="rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                  <img src={item.image} alt={item.name} className="h-40 w-full rounded-2xl object-cover" />
                  <h3 className="mt-4 font-bold text-brand-text">{item.name}</h3>
                  <p className="mt-1 text-sm text-brand-text/60">{item.location}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PropertyDetailPage;
