import React from 'react';
import { MapPinned } from 'lucide-react';
import { regionalReach } from '../../data/enterpriseContent.js';

const MapSection = () => (
  <section className="bg-brand-background-alt py-16 sm:py-24">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Portfolio Map</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          Built around regional access and tenant demand.
        </h2>
        <p className="mt-5 text-base leading-8 text-brand-text/72">
          APMC manages assets across major island groups, combining national portfolio visibility
          with on-the-ground coordination for each market.
        </p>
        <div className="mt-8 space-y-3">
          {regionalReach.map((region) => (
            <div key={region.region} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <p className="font-bold text-brand-text">{region.region}</p>
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
                  {region.assets} assets
                </span>
              </div>
              <p className="mt-1 text-sm text-brand-text/60">{region.zones}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[2rem] border border-brand-secondary/20 bg-white p-6 shadow-card">
        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-50 to-brand-200">
          <div className="absolute h-72 w-72 rounded-full border border-brand-primary/10" />
          <div className="absolute h-48 w-48 rounded-full border border-brand-primary/15" />
          <MapPinned className="h-24 w-24 text-brand-primary" />
          {regionalReach.map((market, index) => (
            <span
              key={market.region}
              className="absolute rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-primary shadow-card"
              style={{
                top: `${24 + index * 24}%`,
                left: `${18 + index * 18}%`,
              }}
            >
              {market.region}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default MapSection;
