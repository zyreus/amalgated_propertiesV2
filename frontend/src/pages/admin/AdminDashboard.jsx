import React, { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Building2, Wrench } from 'lucide-react';
import { activityFeed, adminKpis, propertyMix, revenueTrend } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

const icons = [Building2, Wrench];

function formatPeso(value) {
  return `PHP ${(value / 1000000).toFixed(1)}M`;
}

function buildLiveKpis(stats) {
  return [
    { label: 'Properties', value: String(stats.properties ?? 0), change: `${stats.availableProperties ?? 0} available`, trend: 'up' },
    { label: 'Open Requests', value: String(stats.openMaintenance ?? 0), change: 'Live data', trend: 'down' },
  ];
}

export default function AdminDashboard() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [kpis, setKpis] = useState(adminKpis);

  useEffect(() => {
    if (!token || token.startsWith('mock-')) {
      setKpis(adminKpis);
      return;
    }

    let ignore = false;

    api.get('/dashboard/admin')
      .then((stats) => {
        if (ignore) return;
        setKpis(buildLiveKpis(stats));
      })
      .catch(() => {
        if (ignore) return;
        setKpis(adminKpis);
      });

    return () => {
      ignore = true;
    };
  }, [api, token]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Executive Overview</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Admin Dashboard</h2>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {kpis.map((item, index) => {
          const Icon = icons[index];
          const TrendIcon = item.trend === 'down' ? ArrowDownRight : ArrowUpRight;
          return (
            <div key={item.label} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-brand-text-muted dark:text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-brand-primary dark:text-white">{item.value}</p>
                </div>
                <span className="rounded-2xl bg-brand-primary/10 p-3 text-brand-primary dark:bg-brand-600/30 dark:text-brand-accent">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${item.trend === 'down' ? 'text-emerald-600' : 'text-emerald-600'}`}>
                <TrendIcon className="h-4 w-4" />
                {item.change} vs last month
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-primary dark:text-white">Revenue Trend</h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-400">Monthly rent revenue and occupancy.</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce9f2" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis tickFormatter={formatPeso} stroke="#64748b" />
                <Tooltip formatter={(value, name) => (name === 'revenue' ? formatPeso(value) : `${value}%`)} />
                <Line type="monotone" dataKey="revenue" stroke="#003B65" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="occupancy" stroke="#75A2BF" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-brand-primary dark:text-white">Property Mix</h3>
          <p className="text-sm text-brand-text-muted dark:text-slate-400">Units under management by type.</p>
          <div className="mt-4 h-80">
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
      </section>

      <section>
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-brand-primary dark:text-white">Activity Feed</h3>
          <div className="mt-4 space-y-4">
            {activityFeed.map((item) => (
              <div key={item.title} className="border-l-2 border-brand-accent pl-4">
                <p className="font-semibold text-brand-primary dark:text-white">{item.title}</p>
                <p className="mt-1 text-sm text-brand-text-muted dark:text-slate-400">{item.detail}</p>
                <p className="mt-1 text-xs text-brand-accent">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
