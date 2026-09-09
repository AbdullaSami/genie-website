'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Sliders, Save, Link as LinkIcon, Check } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { FooterSection, FooterLink } from '@/types';

export default function AdminFooterPage() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // New column modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadFooter();
  }, []);

  async function loadFooter() {
    try {
      const res = await fetch('/api/admin/footer');
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (err) {
      console.error('Failed to load footer sections:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const res = await fetch('/api/admin/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          sort_order: sections.length + 1,
          links: [],
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add column');

      setToast({ message: 'Footer column added', type: 'success' });
      setNewTitle('');
      setModalOpen(false);
      loadFooter();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleSaveSection(section: FooterSection) {
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });
      if (!res.ok) throw new Error('Failed to save column');
      setToast({ message: `Saved column "${section.title}"`, type: 'success' });
      loadFooter();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDeleteSection() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/footer?id=${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete section');
      setToast({ message: 'Column removed', type: 'success' });
      setDeleteId(null);
      loadFooter();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  function addLinkToSection(sectionIndex: number) {
    const next = [...sections];
    next[sectionIndex].links.push({ label: 'New Link', url: '#' });
    setSections(next);
  }

  function updateLink(sectionIndex: number, linkIndex: number, field: keyof FooterLink, val: any) {
    const next = [...sections];
    next[sectionIndex].links[linkIndex] = {
      ...next[sectionIndex].links[linkIndex],
      [field]: val,
    };
    setSections(next);
  }

  function removeLink(sectionIndex: number, linkIndex: number) {
    const next = [...sections];
    next[sectionIndex].links.splice(linkIndex, 1);
    setSections(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
        Loading footer layout...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Footer Column"
        description="Are you sure you want to remove this footer column and all of its links?"
        confirmText="Delete Column"
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteId(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Footer Management</h1>
          <p className="text-xs text-white/50 mt-1">
            Organize the columns and link collections displayed in the website footer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Footer Column</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="bg-[#121824] border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const next = [...sections];
                    next[sIdx].title = e.target.value;
                    setSections(next);
                  }}
                  className="text-sm font-semibold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#00ABED] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDeleteId(section.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Links list */}
              <div className="py-3 space-y-2">
                {section.links.map((link, lIdx) => (
                  <div key={lIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(sIdx, lIdx, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-1/2 px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(sIdx, lIdx, 'url', e.target.value)}
                      placeholder="#url or mailto:"
                      className="w-1/2 px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(sIdx, lIdx)}
                      className="p-1 text-white/40 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addLinkToSection(sIdx)}
                  className="flex items-center gap-1.5 text-xs text-[#00ABED] hover:underline pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add link</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.is_active}
                  onChange={(e) => {
                    const next = [...sections];
                    next[sIdx].is_active = e.target.checked;
                    setSections(next);
                  }}
                  className="rounded bg-white/10 border-white/20 text-[#00ABED]"
                />
                <span>Active</span>
              </label>

              <button
                type="button"
                onClick={() => handleSaveSection(sections[sIdx])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Column</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Column Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#141923] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white">Add New Footer Column</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Column Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Explore, Company, Legal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-white/70 bg-white/5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#00ABED] text-black rounded-lg"
                >
                  Add Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
