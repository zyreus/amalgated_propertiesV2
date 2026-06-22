import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminTables, propertyMix as fallbackPropertyMix } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

function formatPercentChange(current, previous) {
  if (previous === 0) {
    if (current === 0) return '0%';
    return '+100%';
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

function formatHours(value) {
  if (value === null || value === undefined) return '—';
  if (value < 1) return `${Math.round(value * 60)}m`;
  return `${Math.round(value)}h`;
}

function formatCollectionRate(value) {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
}

function buildMetrics(data) {
  return [
    {
      metric: 'Website Leads',
      value: String(data.websiteLeads.current),
      change: formatPercentChange(data.websiteLeads.current, data.websiteLeads.previous),
      owner: 'Marketing',
      positiveIsGood: true,
    },
    {
      metric: 'Tour Conversion',
      value: `${data.tourConversion.current.toFixed(1)}%`,
      change: formatPercentChange(data.tourConversion.current, data.tourConversion.previous),
      owner: 'Leasing',
      positiveIsGood: true,
    },
    {
      metric: 'Avg. Resolution Time',
      value: formatHours(data.avgResolutionHours.current),
      change: data.avgResolutionHours.current === null || data.avgResolutionHours.previous === null
        ? '—'
        : formatPercentChange(data.avgResolutionHours.current, data.avgResolutionHours.previous),
      owner: 'Operations',
      positiveIsGood: false,
    },
    {
      metric: 'Collection Rate',
      value: formatCollectionRate(data.collectionRate.current),
      change: data.collectionRate.current === null || data.collectionRate.previous === null
        ? '—'
        : formatPercentChange(data.collectionRate.current, data.collectionRate.previous),
      owner: 'Finance',
      positiveIsGood: true,
    },
  ];
}

function getChangeClass(change, positiveIsGood) {
  if (change === '—' || change === '0%') return 'text-brand-text-muted dark:text-slate-400';
  const isIncrease = change.startsWith('+');
  const isGood = positiveIsGood ? isIncrease : !isIncrease;
  return isGood ? 'text-emerald-600' : 'text-red-600';
}

export default function AdminAnalytics() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!token || token.startsWith('mock-')) {
      setAnalytics({
        propertyMix: fallbackPropertyMix,
        websiteLeads: { current: 148, previous: 125 },
        tourConversion: { current: 32, previous: 30.2 },
        avgResolutionHours: { current: 14, previous: 15.4 },
        collectionRate: { current: 97.6, previous: 96.3 },
      });
      setUsingFallback(true);
      setLoading(false);
      return undefined;
    }

    let ignore = false;
    setLoading(true);

    api.get('/dashboard/analytics')
      .then((data) => {
        if (ignore) return;
        setAnalytics(data);
        setUsingFallback(false);
      })
      .catch(() => {
        if (ignore) return;
        setAnalytics({
          propertyMix: fallbackPropertyMix,
          websiteLeads: { current: 0, previous: 0 },
          tourConversion: { current: 0, previous: 0 },
          avgResolutionHours: { current: null, previous: null },
          collectionRate: { current: null, previous: null },
        });
        setUsingFallback(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [api, token]);

  const chartData = analytics?.propertyMix?.length ? analytics.propertyMix : [];
  const metrics = useMemo(
    () => (analytics ? buildMetrics(analytics) : adminTables.analytics.map((row) => ({ ...row, positiveIsGood: true }))),
    [analytics],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Insights</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Analytics</h2>
      </div>

      {usingFallback && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {token && !token.startsWith('mock-')
            ? 'Live analytics are unavailable. Showing fallback values until the API responds.'
            : 'Preview analytics shown. Sign in with admin credentials to load live portfolio and lead data.'}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold text-brand-primary dark:text-white">Managed Units</h3>
          <p className="mt-1 text-sm text-brand-text-muted dark:text-slate-400">
            Properties under management by portfolio type.
          </p>
          <div className="mt-4 h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-brand-text-muted dark:text-slate-400">
                Loading chart...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dce9f2" />
                  <XAxis dataKey="type" stroke="#64748b" />
                  <YAxis allowDecimals={false} stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="units" fill="#003B65" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-brand-text-muted dark:text-slate-400">
                No property data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-brand-100 px-5 py-4 dark:border-brand-700/50">
            <h3 className="text-lg font-bold text-brand-primary dark:text-white">Performance Metrics</h3>
            <p className="mt-1 text-sm text-brand-text-muted dark:text-slate-400">
              Last 30 days compared with the previous period.
            </p>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Metric', 'Value', 'Change', 'Owner'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-brand-text-muted dark:text-slate-400" colSpan={4}>
                    Loading metrics...
                  </td>
                </tr>
              ) : metrics.map((row) => (
                <tr key={row.metric} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.metric}</td>
                  <td className="px-5 py-4">{row.value}</td>
                  <td className={`px-5 py-4 ${getChangeClass(row.change, row.positiveIsGood)}`}>{row.change}</td>
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
