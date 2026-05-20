import React from 'react';
import { Save } from 'lucide-react';
import { clientTables } from '../../data/mockPortal.js';

export default function ClientProfile() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Account</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Profile</h2>
        </div>
        <button className="btn-primary"><Save className="h-4 w-4" /> Save Profile</button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Section', 'Field', 'Value'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {clientTables.profile.map((row) => (
                <tr key={row.field} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.section}</td>
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.field}</td>
                  <td className="px-5 py-4">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
