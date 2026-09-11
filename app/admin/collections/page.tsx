'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Save,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

type CollectionType = 'services' | 'projects' | 'team' | 'testimonials' | 'stats';

export default function AdminCollectionsPage() {
  const [activeTab, setActiveTab] = useState<CollectionType>('services');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // Edit / Add modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  // Media picker target
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);

  useEffect(() => {
    loadCollection(activeTab);
  }, [activeTab]);

  async function loadCollection(type: CollectionType) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/collections?type=${type}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load collection:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...editingItem };

      // Parse tags if on services
      if (activeTab === 'services' && typeof payload.tags === 'string') {
        payload.tags = payload.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      }

      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: activeTab,
          id: editingItem?.id,
          item: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setToast({ message: 'Item saved successfully!', type: 'success' });
      setModalOpen(false);
      setEditingItem(null);
      loadCollection(activeTab);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/collections?type=${activeTab}&id=${deleteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete item');

      setToast({ message: 'Item deleted', type: 'success' });
      setDeleteId(null);
      loadCollection(activeTab);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const updated = next.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setItems(updated);

    try {
      await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: activeTab,
          action: 'reorder',
          items: updated,
        }),
      });
      setToast({ message: 'Order updated', type: 'success' });
    } catch {
      loadCollection(activeTab);
    }
  }

  function openNewModal() {
    if (activeTab === 'services') {
      setEditingItem({
        number: `0${items.length + 1}`,
        name: '',
        description: '',
        tags: '',
        sort_order: items.length + 1,
      });
    } else if (activeTab === 'projects') {
      setEditingItem({
        title: '',
        category: 'Brand Identity',
        cover_url: null,
        gradient: 'linear-gradient(135deg,#4F46E5,#004362)',
        external_url: 'https://',
        is_active: true,
        sort_order: items.length + 1,
      });
    } else if (activeTab === 'team') {
      setEditingItem({
        name: '',
        role: '',
        photo_url: 'https://placehold.co/320x320/1a1a1a/00ABED?text=Photo',
        bio: '',
        sort_order: items.length + 1,
      });
    } else if (activeTab === 'testimonials') {
      setEditingItem({
        quote: '',
        client_name: '',
        client_title: '',
        sort_order: items.length + 1,
      });
    } else if (activeTab === 'stats') {
      setEditingItem({
        value: 10,
        label: '',
        sort_order: items.length + 1,
      });
    }
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Item"
        description="Are you sure you want to delete this item? It will be permanently removed from the website."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <MediaPickerModal
        isOpen={!!mediaTarget}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (mediaTarget && editingItem) {
            setEditingItem({ ...editingItem, [mediaTarget]: url });
          }
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Content Collections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage reusable website components: Services, Portfolio Projects, Team, Testimonials, and Stats.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-lg shadow-slate-200/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="capitalize">Add {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl w-fit overflow-x-auto">
        {(['services', 'projects', 'team', 'testimonials', 'stats'] as CollectionType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#4F46E5] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Collection items table/list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mr-2" />
          Loading {activeTab}...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No items found in this collection.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
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

                {/* Preview Thumbnail for projects / team */}
                {activeTab === 'projects' && (
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 border border-slate-200 overflow-hidden bg-cover bg-center"
                    style={
                      item.cover_url
                        ? { backgroundImage: `url('${item.cover_url}')` }
                        : { background: item.gradient || '#004362' }
                    }
                  />
                )}
                {activeTab === 'team' && (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                )}

                {/* Details */}
                <div className="min-w-0">
                  {activeTab === 'services' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[#4F46E5] font-bold">{item.number}</span>
                        <span className="text-sm font-semibold text-slate-900 truncate">{item.name}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate max-w-md">{item.description}</p>
                    </>
                  )}

                  {activeTab === 'projects' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-50 text-[#4F46E5]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-slate-500 truncate">{item.external_url || '#'}</p>
                    </>
                  )}

                  {activeTab === 'team' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                        <span className="text-sm text-[#4F46E5] font-medium">· {item.role}</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{item.bio}</p>
                    </>
                  )}

                  {activeTab === 'testimonials' && (
                    <>
                      <p className="text-sm text-slate-600 line-clamp-1 italic">&ldquo;{item.quote}&rdquo;</p>
                      <p className="text-[11px] text-slate-500">
                        {item.client_name} · {item.client_title}
                      </p>
                    </>
                  )}

                  {activeTab === 'stats' && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#4F46E5]">{item.value}+</span>
                      <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const editObj = { ...item };
                    if (activeTab === 'services' && Array.isArray(editObj.tags)) {
                      editObj.tags = editObj.tags.join(', ');
                    }
                    setEditingItem(editObj);
                    setModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-50 text-slate-900 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
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
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 capitalize">
                {editingItem?.id ? `Edit ${activeTab.slice(0, -1)}` : `New ${activeTab.slice(0, -1)}`}
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
              {/* Form fields based on collection type */}
              {activeTab === 'services' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Number (e.g. 01, 02)</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.number || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, number: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Service Name</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem?.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editingItem?.tags || ''}
                      placeholder="e.g. Logo, Guidelines, Brand Voice"
                      onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </>
              )}

              {activeTab === 'projects' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Project Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Category</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.category || ''}
                      placeholder="e.g. Brand Identity, Web Design, 3D"
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Cover Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingItem?.cover_url || ''}
                        placeholder="Leave empty to use CSS gradient"
                        onChange={(e) => setEditingItem({ ...editingItem, cover_url: e.target.value })}
                        className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaTarget('cover_url')}
                        className="px-3 py-2 bg-slate-50 text-slate-900 rounded-xl text-sm flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">CSS Gradient Fallback</label>
                    <input
                      type="text"
                      value={editingItem?.gradient || 'linear-gradient(135deg,#4F46E5,#004362)'}
                      onChange={(e) => setEditingItem({ ...editingItem, gradient: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">External Link URL</label>
                    <input
                      type="url"
                      value={editingItem?.external_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, external_url: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </>
              )}

              {activeTab === 'team' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Role / Position</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.role || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Photo URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={editingItem?.photo_url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, photo_url: e.target.value })}
                        className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaTarget('photo_url')}
                        className="px-3 py-2 bg-slate-50 text-slate-900 rounded-xl text-sm flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Bio</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem?.bio || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </>
              )}

              {activeTab === 'testimonials' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Client Quote</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem?.quote || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Client Name</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.client_name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, client_name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Client Title / Company</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.client_title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, client_title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </>
              )}

              {activeTab === 'stats' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Numeric Value</label>
                    <input
                      type="number"
                      required
                      value={editingItem?.value ?? 0}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, value: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Label</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.label || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </>
              )}

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
