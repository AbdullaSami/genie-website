'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Menu, Check, X, Save } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { NavigationItem } from '@/types';

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NavigationItem> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadNav();
  }, []);

  async function loadNav() {
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load navigation:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.url) {
      setToast({ message: 'Title and URL are required', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save item');

      setToast({ message: 'Navigation item saved successfully', type: 'success' });
      setModalOpen(false);
      setEditingItem(null);
      loadNav();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/navigation?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');

      setToast({ message: 'Item deleted', type: 'success' });
      setDeleteId(null);
      loadNav();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updated = newItems.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setItems(updated);

    try {
      await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, items: updated }),
      });
      setToast({ message: 'Order updated', type: 'success' });
    } catch {
      loadNav();
    }
  }

  async function toggleActive(item: NavigationItem) {
    try {
      await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });
      loadNav();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mr-2" />
        Loading navigation items...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Navigation Item"
        description="Are you sure you want to remove this link from the header navigation? This will update the public website immediately."
        confirmText="Delete Link"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Website Navigation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage links displayed in the primary header navigation bar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingItem({
              title: '',
              url: '#',
              is_external: false,
              open_in_new_tab: false,
              is_active: true,
              sort_order: items.length + 1,
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-lg shadow-slate-200/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Items List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Menu className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No navigation items created yet. Click &quot;Add Menu Item&quot; above to create one.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                item.is_active ? 'hover:bg-slate-50' : 'opacity-50 bg-slate-50'
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
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    {item.is_external && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-50 text-slate-600 flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" /> External
                      </span>
                    )}
                    {item.open_in_new_tab && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-50 text-slate-600">
                        New Tab
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono text-[#4F46E5]/80">{item.url}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium border transition-colors ${
                    item.is_active
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {item.is_active ? 'Active' : 'Disabled'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(item);
                    setModalOpen(true);
                  }}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-50 text-slate-900 text-sm rounded-lg transition-colors"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingItem?.id ? 'Edit Navigation Item' : 'New Navigation Item'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Menu Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Services, About, Portfolio"
                  value={editingItem?.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Target URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #services, /about, https://external.com"
                  value={editingItem?.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingItem?.is_external ?? false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, is_external: e.target.checked })
                    }
                    className="rounded bg-slate-50 border-slate-200 text-[#4F46E5] focus:ring-0"
                  />
                  <span>Is external link (starts with http/https)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingItem?.open_in_new_tab ?? false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, open_in_new_tab: e.target.checked })
                    }
                    className="rounded bg-slate-50 border-slate-200 text-[#4F46E5] focus:ring-0"
                  />
                  <span>Open link in new browser tab</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingItem?.is_active ?? true}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, is_active: e.target.checked })
                    }
                    className="rounded bg-slate-50 border-slate-200 text-[#4F46E5] focus:ring-0"
                  />
                  <span>Visible in header</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl transition-colors shadow-md"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
