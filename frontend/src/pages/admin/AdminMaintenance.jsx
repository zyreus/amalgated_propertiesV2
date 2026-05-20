import React from 'react';
import { Wrench } from 'lucide-react';
import { adminTables } from '../../data/mockPortal.js';

export default function AdminMaintenance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Operations</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Maintenance</h2>
        </div>
        <button className="btn-primary"><Wrench className="h-4 w-4" /> Create Work Order</button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Ticket', 'Property', 'Issue', 'Priority', 'Assignee', 'Status'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {adminTables.maintenance.map((row) => (
                <tr key={row.ticket} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-brand-text-muted">{row.ticket}</td>
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.property}</td>
                  <td className="px-5 py-4">{row.issue}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{row.priority}</span></td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.assignee}</td>
                  <td className="px-5 py-4">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
