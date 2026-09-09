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
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Social Media Links</h1>
          <p className="text-xs text-white/50 mt-1">
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
          className="flex items-center gap-2 px-4 py-2 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      <div className="bg-[#121824] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        {links.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs">
            <Share2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No social links configured yet.
          </div>
        ) : (
          links.map((link, index) => (
            <div
              key={link.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                link.is_active ? 'hover:bg-white/[0.02]' : 'opacity-50 bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1 rounded text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === links.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1 rounded text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white capitalize">{link.label}</span>
                    <span className="text-[10px] text-white/40 font-mono">({link.platform})</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#00ABED]/80 hover:underline truncate block max-w-sm"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActive(link)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    link.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-white/40 border-white/10'
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
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg transition-colors"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteId(link.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
          <div className="w-full max-w-md bg-[#141923] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">
                {editingLink?.id ? 'Edit Social Profile' : 'New Social Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Platform</label>
                <select
                  value={editingLink?.platform || 'instagram'}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      platform: e.target.value,
                      label: e.target.options[e.target.selectedIndex].text,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
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
                <label className="text-xs font-medium text-white/70">Display Label</label>
                <input
                  type="text"
                  required
                  value={editingLink?.label || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Profile / Chat URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/genie.studio"
                  value={editingLink?.url || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={editingLink?.is_active ?? true}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, is_active: e.target.checked })
                    }
                    className="rounded bg-white/10 border-white/20 text-[#00ABED]"
                  />
                  <span>Active &amp; visible on website</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-white/70 bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#00ABED] text-black rounded-xl"
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
