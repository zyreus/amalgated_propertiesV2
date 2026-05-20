import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminTables, propertyMix } from '../../data/mockPortal.js';

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Insights</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Analytics</h2>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-brand-primary dark:text-white">Managed Units</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyMix}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce9f2" />
                <XAxis dataKey="type" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="units" fill="#003B65" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="border-b border-brand-100 px-5 py-4 dark:border-brand-700/50">
            <h3 className="text-lg font-bold text-brand-primary dark:text-white">Performance Metrics</h3>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Metric', 'Value', 'Change', 'Owner'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {adminTables.analytics.map((row) => (
                <tr key={row.metric} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.metric}</td>
                  <td className="px-5 py-4">{row.value}</td>
                  <td className="px-5 py-4 text-emerald-600">{row.change}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
