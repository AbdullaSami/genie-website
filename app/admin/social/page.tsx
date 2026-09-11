'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Share2, Save, X } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { SocialLink } from '@/types';

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      const res = await fetch('/api/admin/social');
      const data = await res.json();
      if (data.links) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error('Failed to load social links:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLink(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLink?.platform || !editingLink?.url) {
      setToast({ message: 'Platform and URL are required', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLink),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save link');

      setToast({ message: 'Social profile saved', type: 'success' });
      setModalOpen(false);
      setEditingLink(null);
      loadLinks();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/social?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setToast({ message: 'Social profile removed', type: 'success' });
      setDeleteId(null);
      loadLinks();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const next = [...links];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const updated = next.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setLinks(updated);

    try {
      await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, links: updated }),
      });
      setToast({ message: 'Order updated', type: 'success' });
    } catch {
      loadLinks();
    }
  }

  async function toggleActive(item: SocialLink) {
    try {
      await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });
      loadLinks();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mr-2" />
        Loading social profiles...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Social Profile"
        description="Are you sure you want to remove this social profile link?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Social Media Links</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your brand profiles on Instagram, LinkedIn, X, WhatsApp, Facebook, and more.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingLink({
              platform: 'instagram',
              label: 'Instagram',
              url: 'https://',
              is_active: true,
              sort_order: links.length + 1,
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-lg shadow-slate-200/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
        {links.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Share2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No social links configured yet.
          </div>
        ) : (
          links.map((link, index) => (
            <div
              key={link.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                link.is_active ? 'hover:bg-slate-50' : 'opacity-50 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === links.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 capitalize">{link.label}</span>
                    <span className="text-[11px] text-slate-500 font-mono">({link.platform})</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-[#4F46E5]/80 hover:underline truncate block max-w-sm"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActive(link)}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    link.is_active
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {link.is_active ? 'Active' : 'Disabled'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(link);
                    setModalOpen(true);
                  }}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-50 text-slate-900 text-sm rounded-lg transition-colors"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteId(link.id)}
                  className="p-1.5 text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingLink?.id ? 'Edit Social Profile' : 'New Social Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Platform</label>
                <select
                  value={editingLink?.platform || 'instagram'}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      platform: e.target.value,
                      label: e.target.options[e.target.selectedIndex].text,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X / Twitter</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="custom">Other / Custom</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Display Label</label>
                <input
                  type="text"
                  required
                  value={editingLink?.label || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Profile / Chat URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/genie.studio"
                  value={editingLink?.url || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingLink?.is_active ?? true}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, is_active: e.target.checked })
                    }
                    className="rounded bg-slate-50 border-slate-200 text-[#4F46E5]"
                  />
                  <span>Active &amp; visible on website</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-[#4F46E5] text-white rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
