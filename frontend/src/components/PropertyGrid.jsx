import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Ruler, Search, SlidersHorizontal } from 'lucide-react';
import { useProperties } from '../hooks/useProperties.js';

const PropertyGrid = () => {
  const { properties, loading } = useProperties();
  const [filters, setFilters] = useState({
    search: '',
    region: 'All',
    category: 'All',
    status: 'All',
    sort: 'featured',
  });

  const regions = useMemo(() => ['All', ...new Set(properties.map((item) => item.region).filter(Boolean))], [properties]);
  const categories = useMemo(() => ['All', ...new Set(properties.map((item) => item.category).filter(Boolean))], [properties]);
  const statuses = useMemo(() => ['All', ...new Set(properties.map((item) => item.status).filter(Boolean))], [properties]);

  const filteredProperties = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const result = properties.filter((property) => {
      const matchesSearch = !search || [property.name, property.location, property.description, property.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
      const matchesRegion = filters.region === 'All' || property.region === filters.region;
      const matchesCategory = filters.category === 'All' || property.category === filters.category;
      const matchesStatus = filters.status === 'All' || property.status === filters.status;
      return matchesSearch && matchesRegion && matchesCategory && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (filters.sort === 'area') return Number(String(b.sqft).replace(/,/g, '')) - Number(String(a.sqft).replace(/,/g, ''));
      if (filters.sort === 'name') return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [filters, properties]);

  const regionStats = useMemo(() => regions.filter((region) => region !== 'All').map((region) => ({
    region,
    count: properties.filter((property) => property.region === region).length,
  })), [properties, regions]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section
      id="properties"
      className="border-t border-brand-secondary/30 bg-brand-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="border-l-4 border-brand-primary pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              Enterprise Property Search
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-text sm:text-5xl">
              Find leasable, sale-ready, and managed assets by market.
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-brand-text/78">
              Live filters, regional intelligence, availability badges, and premium property cards help tenants and investors move from discovery to inquiry faster.
            </p>
          </div>

          <div className="rounded-[2rem] border border-brand-secondary/20 bg-brand-background-alt p-5 shadow-card">
            <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-50 via-white to-brand-200">
              <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(0,59,101,0.16)_1px,transparent_0)] [background-size:24px_24px]" />
              {regionStats.map((item, index) => (
                <button
                  key={item.region}
                  type="button"
                  onClick={() => updateFilter('region', item.region)}
                  className={`absolute rounded-2xl border bg-white/90 px-4 py-3 text-left shadow-card backdrop-blur transition hover:-translate-y-1 hover:shadow-soft ${filters.region === item.region ? 'border-brand-primary text-brand-primary' : 'border-white/70 text-brand-text'}`}
                  style={{ top: `${18 + index * 24}%`, left: `${16 + index * 22}%` }}
                >
                  <span className="block text-xs font-bold uppercase tracking-[0.18em]">{item.region}</span>
                  <span className="mt-1 block text-sm">{item.count} properties</span>
                </button>
              ))}
              <div className="absolute bottom-5 right-5 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-brand-primary">
                Map Search Preview
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-20 z-30 mt-10 rounded-[2rem] border border-brand-secondary/20 bg-white/95 p-4 shadow-soft backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text/45" />
              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Search by city, property, use, or keyword"
                className="h-12 w-full rounded-2xl border border-brand-secondary/25 bg-brand-background-alt pl-11 pr-4 text-sm outline-none transition focus:border-brand-primary focus:bg-white"
              />
            </label>
            {[
              ['region', regions],
              ['category', categories],
              ['status', statuses],
              ['sort', ['featured', 'area', 'name']],
            ].map(([key, options]) => (
              <label key={key} className="relative">
                <span className="sr-only">{key}</span>
                <select
                  value={filters[key]}
                  onChange={(event) => updateFilter(key, event.target.value)}
                  className="h-12 w-full rounded-2xl border border-brand-secondary/25 bg-brand-background-alt px-4 text-sm capitalize outline-none transition focus:border-brand-primary focus:bg-white"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>{key === 'sort' ? `Sort: ${option}` : option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-brand-text/64">
            <p className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
            <button
              type="button"
              onClick={() => setFilters({ search: '', region: 'All', category: 'All', status: 'All', sort: 'featured' })}
              className="font-semibold text-brand-primary hover:text-brand-primary-hover"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[390px] animate-pulse rounded-[2rem] bg-brand-background-alt shadow-card" />
          ))}
          {!loading && filteredProperties.length === 0 && (
            <div className="col-span-full rounded-[2rem] bg-brand-background-alt p-10 text-center">
              <p className="font-semibold text-brand-text">No properties match the selected filters.</p>
              <p className="mt-2 text-sm text-brand-text/64">Try a broader region, category, or availability status.</p>
            </div>
          )}
          {!loading && filteredProperties.map((property) => (
            <article
              key={property.slug}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-brand-secondary/20 bg-brand-background shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative h-56 overflow-hidden">
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
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-brand-dark/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.region}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 pt-3">
                <span className="rounded-full border border-brand-secondary/60 bg-brand-background-alt px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-text">
                  {property.category}
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
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-text/68">{property.description}</p>
                <div className="mt-4 grid gap-2 text-xs font-medium text-brand-text/65 sm:grid-cols-2">
                  <span>{property.price}</span>
                  <span className="inline-flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-brand-primary" />
                    {property.sqft} sqm
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[property.category, property.tag, property.status].filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto flex flex-col gap-3 border-t border-brand-secondary/30 px-4 pb-4 pt-3 text-sm text-brand-text/70 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={`/properties/${property.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-secondary/60 px-4 py-2 font-semibold text-brand-text transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 font-semibold text-white shadow-brand-primary transition hover:bg-brand-primary-hover"
                >
                  Inquire
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
