import React from 'react';
import { Download } from 'lucide-react';
import { adminTables } from '../../data/mockPortal.js';

const statusClass = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Overdue: 'bg-rose-100 text-rose-700',
};

export default function AdminPayments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Finance</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Payments</h2>
        </div>
        <button className="btn-outline"><Download className="h-4 w-4" /> Export</button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Transaction', 'Tenant', 'Property', 'Amount', 'Date', 'Status'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {adminTables.payments.map((row) => (
                <tr key={row.id} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-brand-text-muted">{row.id}</td>
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.tenant}</td>
                  <td className="px-5 py-4">{row.property}</td>
                  <td className="px-5 py-4 font-semibold">{row.amount}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.date}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[row.status] || 'bg-brand-100 text-brand-primary'}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
