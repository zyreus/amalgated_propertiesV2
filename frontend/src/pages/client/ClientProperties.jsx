import React from 'react';
import { clientTables } from '../../data/mockPortal.js';

export default function ClientProperties() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Portfolio</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">My Properties</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {clientTables.properties.map((row) => (
          <div key={`${row.property}-${row.unit}`} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-brand-primary dark:text-white">{row.property}</h3>
                <p className="mt-1 text-sm text-brand-text-muted dark:text-slate-400">Unit {row.unit} - {row.lease}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{row.status}</span>
            </div>
            <p className="mt-4 text-sm text-brand-text-muted dark:text-slate-400">Property Manager</p>
            <p className="font-semibold">{row.manager}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
