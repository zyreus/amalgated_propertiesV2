import React, { useEffect, useState } from 'react';
import { Bell, Building2, FileText, Wrench } from 'lucide-react';
import { clientKpis, clientTables } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

const icons = [Building2, Wrench, FileText, Bell];

function buildLiveKpis(stats) {
  return [
    { label: 'Active Leases', value: String(stats.leases?.length ?? 0), change: 'Live data' },
    { label: 'Open Requests', value: String(stats.openMaintenance ?? 0), change: 'Live data' },
    { label: 'Documents', value: String(stats.documents?.length ?? clientTables.documents.length), change: 'Available files' },
    { label: 'Announcements', value: String(stats.announcements?.length ?? 0), change: 'Published notices' },
  ];
}

export default function ClientDashboard() {
  const [token] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('client_token');
  });
  const api = useApi(token);
  const [kpis, setKpis] = useState(clientKpis);

  useEffect(() => {
    if (!token || token.startsWith('mock-')) {
      setKpis(clientKpis);
      return;
    }

    let ignore = false;

    api.get('/dashboard/client')
      .then((stats) => {
        if (ignore) return;
        setKpis(buildLiveKpis(stats));
      })
      .catch(() => {
        if (ignore) return;
        setKpis(clientKpis);
      });

    return () => {
      ignore = true;
    };
  }, [api, token]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Welcome Back</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Client Dashboard</h2>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, index) => {
          const Icon = icons[index];
          return (
            <div key={item.label} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-brand-text-muted dark:text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-brand-primary dark:text-white">{item.value}</p>
                  <p className="mt-2 text-xs font-semibold text-brand-accent">{item.change}</p>
                </div>
                <span className="rounded-2xl bg-brand-primary/10 p-3 text-brand-primary dark:bg-brand-600/30 dark:text-brand-accent">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          );
        })}
      </section>
      <section>
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-brand-primary dark:text-white">Open Requests</h3>
          <div className="mt-4 space-y-3">
            {clientTables.maintenance.map((request) => (
              <div key={request.ticket} className="rounded-2xl border border-brand-100 p-4 dark:border-brand-700/50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-brand-primary dark:text-white">{request.issue}</p>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">{request.status}</span>
                </div>
                <p className="mt-2 text-sm text-brand-text-muted dark:text-slate-400">{request.property} - {request.schedule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
