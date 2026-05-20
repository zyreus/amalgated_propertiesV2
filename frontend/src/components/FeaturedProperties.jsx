import React from 'react';
import { Link } from 'react-router-dom';

const featured = [
  {
    name: 'One Meridian Tower',
    location: 'Bonifacio Global City, Taguig',
    label: 'CBD OFFICE',
    description:
      'Grade A office tower with flexible floor plates, ideal for regional headquarters and corporate offices.',
    image:
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    name: 'Harborpoint Corporate Center',
    location: 'Bay Area, Pasay City',
    label: 'BAY AREA',
    description:
      'Waterfront commercial complex offering office and retail spaces with direct access to major transport links.',
    image:
      'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    name: 'Northgate Business Plaza',
    location: 'Quezon City',
    label: 'BUSINESS PARK',
    description:
      'Business park-style development with low to mid-rise office buildings and ground floor retail opportunities.',
    image:
      'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1200'
  }
];

const FeaturedProperties = () => {
  return (
    <section className="border-t border-brand-secondary/30 bg-brand-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex w-full max-w-md items-center gap-4">
            <span className="h-px flex-1 border-t border-dashed border-brand-secondary/60" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-text/60">
              Featured Properties
            </p>
            <span className="h-px flex-1 border-t border-dashed border-brand-secondary/60" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Commercial assets in prime business districts
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-brand-text/80">
            A preview of select developments within our managed and leased portfolio.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {featured.map((property) => (
            <article
              key={property.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-secondary/40 bg-brand-background shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden bg-brand-dark">
                <img
                  src={property.image}
                  alt={property.name}
                  className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className="rounded-lg bg-brand-dark/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {property.label}
                  </span>
                </div>
                <div className="absolute right-4 top-4 text-[10px] text-white/80">
                  Managed Portfolio
                </div>
                <div className="absolute bottom-4 left-4 text-[10px] text-white/60">
                  Representative imagery for property type
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold tracking-tight text-brand-text">
                  {property.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand-text/70">
                  {property.location}
                </p>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-brand-text/80">
                  {property.description}
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-brand-primary transition hover:text-brand-primary-hover"
                >
                  View details
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
