'use client';

import { useState, useEffect } from 'react';
import { Inbox, Mail, Trash2, Search } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { ContactSubmission } from '@/types';

export default function AdminInquiriesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    try {
      const res = await fetch('/api/admin/inquiries');
      if (!res.ok) throw new Error('Could not load inquiries');
      const data = await res.json();
      setLoadError(false);
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: 'new' | 'read' | 'archived') {
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setToast({ message: `Marked as ${status}`, type: 'success' });
      await loadInquiries();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Something went wrong. Please try again.', type: 'error' });
    } finally { setBusyId(null); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setBusyId(deleteId);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      setToast({ message: 'Inquiry deleted', type: 'success' });
      setDeleteId(null);
      await loadInquiries();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Something went wrong. Please try again.', type: 'error' });
    } finally { setBusyId(null); }
  }

  const filtered = submissions.filter((s) => {
    const matchesStatus = filter === 'all' || s.status === filter;
    return matchesStatus && [s.name, s.email, s.service, s.message].some(value => value?.toLowerCase().includes(query.trim().toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mr-2" />
        Loading inquiries...
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Inquiry"
        description="Are you sure you want to permanently delete this client inquiry?"
        confirmText="Delete"
        isLoading={busyId === deleteId && deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Turn new conversations into your next creative project.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl">
          {(['all', 'new', 'read', 'archived'] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xl capitalize transition-all ${
                filter === f
                  ? 'bg-[#4F46E5] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f} <span className="ml-1 opacity-70">{f === 'all' ? submissions.length : submissions.filter(item => item.status === f).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 px-4 bg-white border border-slate-200 rounded-xl w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input aria-label="Search inquiries" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email, service or message…" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <p className="text-sm text-slate-500" role="status">{filtered.length} {filtered.length === 1 ? 'inquiry' : 'inquiries'}</p>
      </div>
      {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">Could not load inquiries. <button className="underline font-semibold" onClick={loadInquiries}>Try again</button></div>}
      {!loadError && filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-700 mb-2">{query ? 'No matching conversations' : 'Your inbox is clear'}</p>
          <p>{query ? 'Try another name, email or keyword.' : 'Inquiries from your website will appear here.'}</p>
          {(query || filter !== 'all') && <button className="mt-4 text-indigo-600 font-semibold" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</button>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.status === 'new'
                  ? 'bg-white border-[#4F46E5]/30 shadow-lg shadow-slate-200/50'
                  : 'bg-white border-slate-200 opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#818CF8] to-[#4F46E5] text-white font-bold flex items-center justify-center text-sm">
                    {item.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-sm text-[#4F46E5] hover:underline break-all"
                    >
                      {item.email}
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 capitalize">{item.status || 'new'}</span>
                  {item.service && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600">
                      {item.service}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>

              {/* Message body */}
              <div className="py-4 break-words text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.message}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 items-center justify-between pt-3 border-t border-slate-200 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${item.email}?subject=Regarding your inquiry with Genie Studio`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5]/10 text-[#4F46E5] hover:bg-[#4F46E5]/20 rounded-lg transition-colors font-semibold text-[11px]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply by Email</span>
                  </a>

                  {item.status !== 'read' && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => updateStatus(item.id!, 'read')}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-lg transition-colors text-[11px]"
                    >
                      Mark as Read
                    </button>
                  )}

                  {item.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => updateStatus(item.id!, 'archived')}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-lg transition-colors text-[11px]"
                    >
                      Archive
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Delete inquiry from ${item.name}`}
                  disabled={busyId === item.id}
                  onClick={() => setDeleteId(item.id!)}
                  className="p-1.5 text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
