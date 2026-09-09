'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, Trash2, Edit, ExternalLink, Globe, Lock } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { CMSPage } from '@/types';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // New page modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newSlug) return;
    setCreating(true);

    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug,
          is_published: true,
          sort_order: pages.length + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create page');

      setToast({ message: 'Page created successfully!', type: 'success' });
      setModalOpen(false);
      setNewTitle('');
      setNewSlug('');
      loadPages();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeletePage() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/pages/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete page');

      setToast({ message: 'Page deleted', type: 'success' });
      setDeleteId(null);
      loadPages();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
        Loading pages...
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Page"
        description="Are you sure you want to permanently delete this page and all its content blocks?"
        confirmText="Delete Page"
        onConfirm={handleDeletePage}
        onCancel={() => setDeleteId(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Pages &amp; Block Builder</h1>
          <p className="text-xs text-white/50 mt-1">
            Build and manage all pages on your website using modular content blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </button>
      </div>

      <div className="bg-[#121824] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        {pages.map((p) => {
          const isHome = p.slug === 'home';
          const publicUrl = isHome ? '/' : `/${p.slug}`;

          return (
            <div
              key={p.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004362] to-[#00ABED] text-black flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    {isHome && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00ABED]/15 text-[#00ABED] border border-[#00ABED]/30">
                        Default Home
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.is_published
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                    <span className="font-mono text-[#00ABED]">{publicUrl}</span>
                    <span>·</span>
                    <span>{p.sections_count || 0} Content Blocks</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link
                  href={publicUrl}
                  target="_blank"
                  className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="View live page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <Link
                  href={`/admin/pages/${p.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl transition-all shadow-md shadow-cyan-950/40"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Blocks</span>
                </Link>

                {!isHome ? (
                  <button
                    type="button"
                    onClick={() => setDeleteId(p.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Delete page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-2 text-white/20" title="Home page cannot be deleted">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Page Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141923] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white">Create New Website Page</h3>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Page Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Case Studies, About Us, Privacy"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      );
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">URL Slug</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-xs bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-white/40 font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="about-us"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-r-xl text-white font-mono focus:outline-none focus:border-[#00ABED]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-white/70 bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#00ABED] text-black rounded-xl disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
