'use client';

import { useState, useEffect } from 'react';
import { Inbox, Mail, CheckCircle2, Archive, Trash2, Calendar, User, MessageSquare } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { ContactSubmission } from '@/types';

export default function AdminInquiriesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
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
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: 'new' | 'read' | 'archived') {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setToast({ message: `Marked as ${status}`, type: 'success' });
      loadInquiries();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      setToast({ message: 'Inquiry deleted', type: 'success' });
      setDeleteId(null);
      loadInquiries();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  const filtered = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
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
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Client Inquiries &amp; Messages</h1>
          <p className="text-xs text-white/50 mt-1">
            Review incoming project inquiries submitted through the contact form on your website.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121824] border border-white/5 rounded-2xl">
          {(['all', 'new', 'read', 'archived'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                filter === f
                  ? 'bg-[#00ABED] text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#121824] border border-white/5 rounded-2xl p-12 text-center text-white/40 text-xs">
          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No inquiries found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.status === 'new'
                  ? 'bg-[#121927] border-[#00ABED]/30 shadow-lg shadow-cyan-950/20'
                  : 'bg-[#121824] border-white/5 opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#004362] to-[#00ABED] text-black font-bold flex items-center justify-center text-xs">
                    {item.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-xs text-[#00ABED] hover:underline"
                    >
                      {item.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.service && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-white/70">
                      {item.service}
                    </span>
                  )}
                  <span className="text-[10px] text-white/40">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>

              {/* Message body */}
              <div className="py-4 text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                {item.message}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${item.email}?subject=Regarding your inquiry with Genie Studio`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ABED]/10 text-[#00ABED] hover:bg-[#00ABED]/20 rounded-lg transition-colors font-semibold text-[11px]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply by Email</span>
                  </a>

                  {item.status !== 'read' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id!, 'read')}
                      className="px-2.5 py-1 text-white/60 hover:text-white rounded-lg transition-colors text-[11px]"
                    >
                      Mark as Read
                    </button>
                  )}

                  {item.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id!, 'archived')}
                      className="px-2.5 py-1 text-white/60 hover:text-white rounded-lg transition-colors text-[11px]"
                    >
                      Archive
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteId(item.id!)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
