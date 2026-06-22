import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Wrench, X } from 'lucide-react';
import useApi from '../../hooks/useApi.js';

const initialForm = {
  property_id: '',
  title: '',
  description: '',
  priority: 'medium',
  status: 'open',
  assigned_to: '',
  scheduled_at: '',
  completed_at: '',
  cost: '',
};

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

function formatDateTimeInput(value) {
  if (!value) return '';
  const normalized = String(value).includes('T') ? String(value) : String(value).replace(' ', 'T');
  return normalized.slice(0, 16);
}

function resolvePropertyName(row, propertyNames) {
  if (row.property_name) return row.property_name;
  const propertyId = Number(row.property_id);
  return propertyNames.get(propertyId) || propertyNames.get(row.property_id) || `Property #${row.property_id}`;
}

function mapMaintenanceRequest(row, propertyNames) {
  return {
    id: row.id,
    ticket: `MNT-${String(row.id).padStart(4, '0')}`,
    property: resolvePropertyName(row, propertyNames),
    issue: row.title,
    priority: formatStatus(row.priority),
    priorityValue: row.priority,
    assignee: row.assigned_to || 'Unassigned',
    schedule: formatDateTime(row.scheduled_at),
    status: formatStatus(row.status),
    source: row,
  };
}

function getPriorityClass(priority) {
  const value = String(priority || 'medium').toLowerCase();
  if (value === 'urgent') return 'bg-red-100 text-red-700';
  if (value === 'high') return 'bg-amber-100 text-amber-700';
  if (value === 'low') return 'bg-slate-100 text-slate-700';
  return 'bg-brand-100 text-brand-primary dark:bg-brand-800 dark:text-brand-accent';
}

function requestToForm(request) {
  return {
    property_id: request.property_id ? String(request.property_id) : '',
    title: request.title || '',
    description: request.description || '',
    priority: request.priority || 'medium',
    status: request.status || 'open',
    assigned_to: request.assigned_to || '',
    scheduled_at: formatDateTimeInput(request.scheduled_at),
    completed_at: formatDateTimeInput(request.completed_at),
    cost: request.cost ? String(request.cost) : '',
  };
}

export default function AdminMaintenance() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const propertyNames = useMemo(
    () => new Map(properties.map((property) => [Number(property.id), property.name])),
    [properties],
  );
  const rows = useMemo(() => requests.map((request) => mapMaintenanceRequest(request, propertyNames)), [propertyNames, requests]);

  const loadRequests = () => {
    setLoading(true);
    api.get('/maintenance')
      .then((data) => {
        if (Array.isArray(data)) setRequests(data);
      })
      .catch(() => {
        setRequests([]);
      })
      .finally(() => setLoading(false));
  };

  const loadProperties = () => {
    api.get('/properties')
      .then((data) => {
        if (Array.isArray(data)) setProperties(data);
      })
      .catch(() => setProperties([]));
  };

  useEffect(() => {
    loadRequests();
    loadProperties();
  }, [api]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openAddForm = () => {
    setEditingRequest(null);
    setForm(initialForm);
    setMessage('');
    setShowForm(true);
  };

  const openEditForm = (request) => {
    if (!request?.id) {
      setMessage('This work order cannot be edited until API data is available.');
      return;
    }

    setEditingRequest(request);
    setForm(requestToForm(request));
    setMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRequest(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      property_id: Number(form.property_id),
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      assigned_to: form.assigned_to.trim() || undefined,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined,
      completed_at: form.completed_at ? new Date(form.completed_at).toISOString() : undefined,
      cost: Number(form.cost) || 0,
    };

    try {
      if (editingRequest?.id) {
        await api.patch(`/maintenance/${editingRequest.id}`, payload);
      } else {
        await api.post('/maintenance', payload);
      }

      closeForm();
      setMessage(editingRequest?.id ? 'Work order updated successfully.' : 'Work order created successfully.');
      loadRequests();
    } catch (error) {
      setMessage(error.message || 'Unable to save work order.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (request) => {
    if (!request?.id) {
      setMessage('This work order cannot be deleted until API data is available.');
      return;
    }

    if (!window.confirm(`Delete work order MNT-${String(request.id).padStart(4, '0')}?`)) return;

    setDeletingId(request.id);
    setMessage('');

    try {
      await api.delete(`/maintenance/${request.id}`);
      setMessage('Work order deleted successfully.');
      loadRequests();
    } catch (error) {
      setMessage(error.message || 'Unable to delete work order.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Operations</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Maintenance</h2>
        </div>
        <button className="btn-primary" onClick={openAddForm}><Wrench className="h-4 w-4" /> Create Work Order</button>
      </div>
      {message && (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent">
          {message}
        </p>
      )}
      {showForm && (
        <div className="glass-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-primary dark:text-white">
                {editingRequest ? 'Edit Work Order' : 'Create Work Order'}
              </h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-400">
                Work orders are saved to the maintenance API.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
              aria-label="Close maintenance form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Property</span>
              <select
                required
                value={form.property_id}
                onChange={(event) => updateField('property_id', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Priority</span>
              <select
                value={form.priority}
                onChange={(event) => updateField('priority', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Assignee</span>
              <input
                value={form.assigned_to}
                onChange={(event) => updateField('assigned_to', event.target.value)}
                placeholder="Facilities Team"
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Scheduled At</span>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(event) => updateField('scheduled_at', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Completed At</span>
              <input
                type="datetime-local"
                value={form.completed_at}
                onChange={(event) => updateField('completed_at', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Cost</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(event) => updateField('cost', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Description</span>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <div className="flex justify-end gap-3 md:col-span-2">
              <button type="button" onClick={closeForm} className="btn-outline">
                Cancel
              </button>
              <button disabled={saving} className="btn-primary disabled:opacity-60" type="submit">
                {saving ? 'Saving...' : editingRequest ? 'Update Work Order' : 'Save Work Order'}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Ticket', 'Property', 'Issue', 'Priority', 'Assignee', 'Schedule', 'Status', 'Actions'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-brand-text-muted dark:text-slate-400" colSpan={8}>
                    Loading work orders...
                  </td>
                </tr>
              )}
              {!loading && rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-brand-text-muted">{row.ticket}</td>
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.property}</td>
                  <td className="px-5 py-4">{row.issue}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClass(row.priorityValue || row.priority?.toLowerCase())}`}>{row.priority}</span></td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.assignee}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.schedule || 'Pending'}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">{row.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(row.source)}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-700 dark:text-brand-accent dark:hover:bg-brand-800/50"
                        disabled={!row.source?.id}
                        title={!row.source?.id ? 'Sample rows cannot be edited because they do not have database IDs.' : 'Edit work order'}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.source)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                        disabled={!row.source?.id || deletingId === row.source.id}
                        title={!row.source?.id ? 'Sample rows cannot be deleted because they do not have database IDs.' : 'Delete work order'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === row.source?.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-brand-text-muted dark:text-slate-400" colSpan={8}>
                    No work orders found.
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
