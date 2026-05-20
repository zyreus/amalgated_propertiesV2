import React, { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Building2, CreditCard, Users, Wrench } from 'lucide-react';
import { activityFeed, adminKpis, propertyMix, recentTransactions, revenueTrend } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

const icons = [Building2, Users, CreditCard, Wrench];

function formatPeso(value) {
  return `PHP ${(value / 1000000).toFixed(1)}M`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function buildLiveKpis(stats) {
  const occupancy = stats.units ? `${((stats.occupiedUnits / stats.units) * 100).toFixed(1)}%` : '0%';

  return [
    { label: 'Properties', value: String(stats.properties ?? 0), change: `${stats.availableProperties ?? 0} available`, trend: 'up' },
    { label: 'Occupancy Rate', value: occupancy, change: `${stats.occupiedUnits ?? 0}/${stats.units ?? 0} units`, trend: 'up' },
    { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), change: 'Live data', trend: 'up' },
    { label: 'Open Requests', value: String(stats.openMaintenance ?? 0), change: 'Live data', trend: 'down' },
  ];
}

function buildLiveTransactions(payments = []) {
  return payments.map((payment) => ({
    id: payment.invoice_number || `PAY-${payment.id}`,
    tenant: payment.tenant_name || payment.payer_name || (payment.lease_id ? `Lease #${payment.lease_id}` : 'Tenant'),
    property: payment.property_name || payment.property || 'Property',
    amount: formatCurrency(payment.amount),
    status: payment.status || 'Pending',
  }));
}

export default function AdminDashboard() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [kpis, setKpis] = useState(adminKpis);
  const [transactions, setTransactions] = useState(recentTransactions);

  useEffect(() => {
    if (!token || token.startsWith('mock-')) {
      setKpis(adminKpis);
      setTransactions(recentTransactions);
      return;
    }

    let ignore = false;

    api.get('/dashboard/admin')
      .then((stats) => {
        if (ignore) return;
        setKpis(buildLiveKpis(stats));
        setTransactions(buildLiveTransactions(stats.recentPayments));
      })
      .catch(() => {
        if (ignore) return;
        setKpis(adminKpis);
        setTransactions(recentTransactions);
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-brand-100 px-5 py-4 dark:border-brand-700/50">
            <h3 className="text-lg font-bold text-brand-primary dark:text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Tenant</th>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
                {transactions.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                    <td className="px-5 py-4 font-mono text-xs text-brand-text-muted">{row.id}</td>
                    <td className="px-5 py-4 font-semibold">{row.tenant}</td>
                    <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.property}</td>
                    <td className="px-5 py-4 font-semibold">{row.amount}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
