import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { properties } from '../../data/properties.js';

const regions = [...new Set(properties.map((property) => property.region))];
const categories = [...new Set(properties.map((property) => property.category))];

const PropertySearch = () => (
  <section className="relative z-10 -mt-12 px-4 sm:px-6">
    <div className="mx-auto max-w-6xl rounded-3xl border border-brand-secondary/20 bg-white p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[1fr_0.8fr_0.8fr_auto]">
        <label className="flex items-center gap-3 rounded-2xl bg-brand-background-alt px-4 py-3">
          <Search className="h-5 w-5 text-brand-primary" />
          <input
            type="text"
            placeholder="Search by property, city, or asset type"
            className="w-full bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-text/45"
          />
        </label>
        <select className="rounded-2xl border border-brand-secondary/20 bg-white px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary">
          <option>All regions</option>
          {regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </select>
        <select className="rounded-2xl border border-brand-secondary/20 bg-white px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary">
          <option>All property types</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <Link to="/properties" className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">
          Browse Listings
        </Link>
      </div>
    </div>
  </section>
);

export default PropertySearch;
