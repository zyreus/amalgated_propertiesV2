import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { clientTables } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

function formatStatus(status) {
  if (!status) return 'Open';
  return String(status)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDateTime(value) {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapMaintenanceRow(row) {
  return {
    id: row.id,
    ticket: `REQ-${String(row.id).padStart(3, '0')}`,
    property: row.property_name || `Property #${row.property_id}`,
    issue: row.title,
    schedule: formatDateTime(row.scheduled_at),
    status: formatStatus(row.status),
  };
}

export default function ClientMaintenance() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('client_token')));
  const api = useApi(token);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const rows = useMemo(() => requests.map(mapMaintenanceRow), [requests]);

  useEffect(() => {
    if (!token || token.startsWith('mock-')) {
      setRequests(clientTables.maintenance);
      setUsingSampleData(true);
      setLoading(false);
      return undefined;
    }

    let ignore = false;
    setLoading(true);

    api.get('/maintenance')
      .then((data) => {
        if (ignore) return;
        if (Array.isArray(data)) {
          setRequests(data);
          setUsingSampleData(false);
        }
      })
      .catch(() => {
        if (ignore) return;
        setRequests(clientTables.maintenance);
        setUsingSampleData(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [api, token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Service Requests</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Maintenance</h2>
        </div>
        <button className="btn-primary"><Plus className="h-4 w-4" /> New Request</button>
      </div>
      {usingSampleData && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Showing sample requests because live maintenance data is unavailable.
        </p>
      )}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Ticket', 'Property', 'Issue', 'Schedule', 'Status'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-brand-text-muted dark:text-slate-400" colSpan={5}>
                    Loading requests...
                  </td>
                </tr>
              )}
              {!loading && rows.map((row) => (
                <tr key={row.id || row.ticket} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-brand-text-muted">{row.ticket}</td>
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.property}</td>
                  <td className="px-5 py-4">{row.issue}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.schedule}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">{row.status}</span></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-brand-text-muted dark:text-slate-400" colSpan={5}>
                    No maintenance requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
