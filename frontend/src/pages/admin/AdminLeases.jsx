import React from 'react';
import { FilePlus2 } from 'lucide-react';
import { adminTables } from '../../data/mockPortal.js';

export default function AdminLeases() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Lease Operations</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Leases</h2>
        </div>
        <button className="btn-primary"><FilePlus2 className="h-4 w-4" /> New Lease</button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Tenant', 'Property', 'Term', 'Renewal', 'Value', 'Status'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {adminTables.leases.map((row) => (
                <tr key={`${row.tenant}-${row.property}`} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.tenant}</td>
                  <td className="px-5 py-4">{row.property}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.term}</td>
                  <td className="px-5 py-4">{row.renewal}</td>
                  <td className="px-5 py-4 font-semibold">{row.value}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
