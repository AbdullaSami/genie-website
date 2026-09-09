'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import RichTextEditor from '@/components/admin/RichTextEditor';
import type { CMSPage, PageSection, BlockType } from '@/types';

const BLOCK_TYPE_LABELS: Record<BlockType, { name: string; desc: string }> = {
  hero: { name: 'Hero Section', desc: 'Main banner with headline, actions, and animated ticker' },
  about: { name: 'About Studio', desc: 'Brand narrative, visual badge, and skill tags' },
  services_grid: { name: 'Services Grid', desc: 'Six core studio capabilities from collection' },
  projects_grid: { name: 'Projects Grid', desc: 'Featured portfolio showcase from collection' },
  team_section: { name: 'Team Board', desc: 'Executive leadership and team bio cards' },
  testimonials: { name: 'Client Testimonials', desc: 'Client quotes and slider from collection' },
  contact_form: { name: 'Contact Form', desc: 'Interactive project inquiry submission form' },
  stats_band: { name: 'Stats Band', desc: 'Live animated statistics counters' },
  rich_text: { name: 'Rich Text Article', desc: 'Long-form formatted text, headings, and lists' },
  features: { name: 'Features / Highlights', desc: 'Multi-column grid of key highlights' },
  faq: { name: 'FAQ Accordion', desc: 'Frequently asked questions with collapsible answers' },
  cta: { name: 'Call To Action Banner', desc: 'High-conversion banner with action buttons' },
  gallery: { name: 'Media Gallery', desc: 'Curated image gallery with captions' },
  custom_html: { name: 'Custom HTML / Embed', desc: 'Custom code embed or HTML snippet' },
};

export default function PageBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const [page, setPage] = useState<CMSPage | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // Active accordion section
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals
  const [addBlockModal, setAddBlockModal] = useState(false);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);

  // Media Picker state
  const [mediaCallback, setMediaCallback] = useState<((url: string) => void) | null>(null);

  useEffect(() => {
    loadPageData();
  }, [pageId]);

  async function loadPageData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      const data = await res.json();
      if (data.page) {
        setPage(data.page);
        setSections(data.page.sections || []);
        if (data.page.sections?.length > 0 && !expandedId) {
          setExpandedId(data.page.sections[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load page data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePageMeta(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!page) return;
    setSavingPage(true);

    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update page');

      setToast({ message: 'Page metadata and SEO saved!', type: 'success' });
      setPageSettingsOpen(false);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSavingPage(false);
    }
  }

  async function handleAddBlock(type: BlockType) {
    try {
      const defaultContent: Record<string, any> = {};
      if (type === 'hero') {
        defaultContent.eyebrow = 'Cairo, Egypt · Est. 2022';
        defaultContent.primary_cta_text = 'See Our Work';
        defaultContent.primary_cta_url = '#work';
        defaultContent.secondary_cta_text = 'Start a Project';
        defaultContent.secondary_cta_url = '#contact';
        defaultContent.slogan_items = ['A BRAND OF MAGIC THAT NEVER FAILS', 'BRAND IDENTITY'];
      } else if (type === 'rich_text') {
        defaultContent.html = '<p>Write your formatted content here...</p>';
      } else if (type === 'cta') {
        defaultContent.button_text = "Let's Talk";
        defaultContent.button_url = '#contact';
      } else if (type === 'faq') {
        defaultContent.items = [{ question: 'What services do you offer?', answer: 'We offer brand, web, 3D, and AI services.' }];
      } else if (type === 'features') {
        defaultContent.items = [{ title: 'Fast Execution', description: 'Projects delivered on schedule.' }];
      }

      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: pageId,
          block_type: type,
          title: BLOCK_TYPE_LABELS[type]?.name || 'New Section',
          subtitle: '',
          content: defaultContent,
          sort_order: sections.length + 1,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add section');

      setToast({ message: 'Content block added!', type: 'success' });
      setAddBlockModal(false);
      await loadPageData();
      if (data.section?.id) {
        setExpandedId(data.section.id);
      }
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleSaveSection(section: PageSection) {
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save section');

      setToast({ message: `Saved block: ${section.title || section.block_type}`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDeleteSection() {
    if (!deleteSectionId) return;
    try {
      const res = await fetch(`/api/admin/sections/${deleteSectionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete section');

      setToast({ message: 'Section removed', type: 'success' });
      setDeleteSectionId(null);
      loadPageData();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleDuplicateSection(id: string) {
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate');

      setToast({ message: 'Section duplicated', type: 'success' });
      await loadPageData();
      if (data.section?.id) setExpandedId(data.section.id);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function moveSection(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;

    const updated = next.map((sec, i) => ({ ...sec, sort_order: i + 1 }));
    setSections(updated);

    try {
      await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          sections: updated,
        }),
      });
      setToast({ message: 'Block order updated', type: 'success' });
    } catch {
      loadPageData();
    }
  }

  function updateSectionState(id: string, updates: Partial<PageSection>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }

  function updateSectionContent(id: string, contentKey: string, val: any) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          content: {
            ...s.content,
            [contentKey]: val,
          },
        };
      })
    );
  }

  if (loading || !page) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
        Loading Page Builder...
      </div>
    );
  }

  const publicUrl = page.slug === 'home' ? '/' : `/${page.slug}`;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteSectionId}
        title="Delete Content Block"
        description="Are you sure you want to delete this block? This action cannot be undone."
        confirmText="Delete Block"
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteSectionId(null)}
      />

      <MediaPickerModal
        isOpen={!!mediaCallback}
        onClose={() => setMediaCallback(null)}
        onSelect={(url) => {
          if (mediaCallback) mediaCallback(url);
          setMediaCallback(null);
        }}
      />

      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 text-white/50 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{page.title}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  page.is_published
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {page.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-white/40 font-mono mt-0.5">{publicUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={publicUrl}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#00ABED]" />
            <span>Preview Page</span>
          </Link>

          <button
            type="button"
            onClick={() => setPageSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>SEO &amp; Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setAddBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="bg-[#121824] border border-white/5 rounded-2xl p-12 text-center text-white/40 text-xs">
            <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No content blocks on this page yet. Click &quot;Add Block&quot; to begin building.
          </div>
        ) : (
          sections.map((section, index) => {
            const isExpanded = expandedId === section.id;
            const blockInfo = BLOCK_TYPE_LABELS[section.block_type] || {
              name: section.block_type,
              desc: '',
            };

            return (
              <div
                key={section.id}
                className={`bg-[#121824] border rounded-2xl transition-all overflow-hidden ${
                  isExpanded ? 'border-[#00ABED]/40 shadow-xl shadow-cyan-950/20' : 'border-white/5'
                } ${!section.is_active ? 'opacity-60' : ''}`}
              >
                {/* Header Bar */}
                <div className="p-4 flex items-center justify-between gap-3 bg-[#151d2c]/50">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Reorder controls */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSection(index, 'up')}
                        className="p-1 rounded text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(index, 'down')}
                        className="p-1 rounded text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div
                      className="cursor-pointer select-none min-w-0"
                      onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#00ABED] uppercase font-bold">
                          {section.block_type}
                        </span>
                        <h4 className="text-sm font-semibold text-white truncate">
                          {section.title || blockInfo.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-white/40 truncate">{blockInfo.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !section.is_active;
                        updateSectionState(section.id, { is_active: next });
                        handleSaveSection({ ...section, is_active: next });
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        section.is_active
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-white/30 hover:bg-white/5'
                      }`}
                      title={section.is_active ? 'Block is Active' : 'Block is Disabled'}
                    >
                      {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateSection(section.id)}
                      className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Duplicate block"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteSectionId(section.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : section.id)}
                      className="p-1.5 text-white/50 hover:text-white rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Block Editor Form */}
                {isExpanded && (
                  <div className="p-6 border-t border-white/5 space-y-5 bg-[#10141d]/80">
                    {/* Common Title & Subtitle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/70">Section Title / Headline</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => updateSectionState(section.id, { title: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/70">Section Subtitle / Description</label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => updateSectionState(section.id, { subtitle: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                        />
                      </div>
                    </div>

                    {/* Block-specific fields */}
                    {section.block_type === 'hero' && (
                      <div className="space-y-4 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Eyebrow Tagline</label>
                            <input
                              type="text"
                              value={section.content.eyebrow || ''}
                              onChange={(e) => updateSectionContent(section.id, 'eyebrow', e.target.value)}
                              placeholder="e.g. Cairo, Egypt · Est. 2022"
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Icon URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={section.content.icon_url || ''}
                                onChange={(e) => updateSectionContent(section.id, 'icon_url', e.target.value)}
                                className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setMediaCallback(() => (url: string) =>
                                    updateSectionContent(section.id, 'icon_url', url))
                                }
                                className="px-3 py-2 bg-white/10 text-white rounded-xl text-xs flex items-center gap-1"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-[#00ABED]" />
                                <span>Browse</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Primary CTA Text</label>
                            <input
                              type="text"
                              value={section.content.primary_cta_text || ''}
                              onChange={(e) => updateSectionContent(section.id, 'primary_cta_text', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Primary CTA URL</label>
                            <input
                              type="text"
                              value={section.content.primary_cta_url || ''}
                              onChange={(e) => updateSectionContent(section.id, 'primary_cta_url', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Secondary CTA Text</label>
                            <input
                              type="text"
                              value={section.content.secondary_cta_text || ''}
                              onChange={(e) => updateSectionContent(section.id, 'secondary_cta_text', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Secondary CTA URL</label>
                            <input
                              type="text"
                              value={section.content.secondary_cta_url || ''}
                              onChange={(e) => updateSectionContent(section.id, 'secondary_cta_url', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-white/70">
                            Animated Slogan Strip Items (comma separated)
                          </label>
                          <input
                            type="text"
                            value={Array.isArray(section.content.slogan_items) ? section.content.slogan_items.join(', ') : ''}
                            onChange={(e) =>
                              updateSectionContent(
                                section.id,
                                'slogan_items',
                                e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                              )
                            }
                            className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                          />
                        </div>
                      </div>
                    )}

                    {section.block_type === 'about' && (
                      <div className="space-y-4 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Section Label</label>
                            <input
                              type="text"
                              value={section.content.section_label || 'About Genie Studio'}
                              onChange={(e) => updateSectionContent(section.id, 'section_label', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Visual Badge Text</label>
                            <input
                              type="text"
                              value={section.content.visual_text || 'Est. 2022 · Cairo, Egypt'}
                              onChange={(e) => updateSectionContent(section.id, 'visual_text', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-white/70">Secondary Narrative Paragraph</label>
                          <textarea
                            rows={3}
                            value={section.content.body || ''}
                            onChange={(e) => updateSectionContent(section.id, 'body', e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-white/70">Skill Tags (comma separated)</label>
                          <input
                            type="text"
                            value={Array.isArray(section.content.tags) ? section.content.tags.join(', ') : ''}
                            onChange={(e) =>
                              updateSectionContent(
                                section.id,
                                'tags',
                                e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                              )
                            }
                            className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                          />
                        </div>
                      </div>
                    )}

                    {section.block_type === 'rich_text' && (
                      <div className="space-y-4 pt-2 border-t border-white/5">
                        <RichTextEditor
                          value={section.content.html || ''}
                          onChange={(html) => updateSectionContent(section.id, 'html', html)}
                          label="Article Content"
                        />
                      </div>
                    )}

                    {section.block_type === 'cta' && (
                      <div className="space-y-4 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Button Text</label>
                            <input
                              type="text"
                              value={section.content.button_text || ''}
                              onChange={(e) => updateSectionContent(section.id, 'button_text', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/70">Button URL</label>
                            <input
                              type="text"
                              value={section.content.button_url || ''}
                              onChange={(e) => updateSectionContent(section.id, 'button_url', e.target.value)}
                              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {section.block_type === 'custom_html' && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <label className="text-xs font-medium text-white/70 font-mono">Raw HTML Code</label>
                        <textarea
                          rows={6}
                          value={section.content.html || ''}
                          onChange={(e) => updateSectionContent(section.id, 'html', e.target.value)}
                          className="w-full font-mono text-xs p-3 bg-black/50 border border-white/10 rounded-xl text-emerald-400 focus:outline-none focus:border-[#00ABED]"
                        />
                      </div>
                    )}

                    {/* Save Button for this block */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleSaveSection(section)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl transition-all shadow-md shadow-cyan-950/30"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Block Changes</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Block Modal */}
      {addBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#141923] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Add Content Block</h3>
                <p className="text-xs text-white/50">Choose a modular section to insert into this page</p>
              </div>
              <button
                type="button"
                onClick={() => setAddBlockModal(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => {
                const info = BLOCK_TYPE_LABELS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAddBlock(type)}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#00ABED]/10 hover:border-[#00ABED]/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#00ABED] transition-colors">
                        {info.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/30 uppercase">{type}</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-snug">{info.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Page SEO & Settings Modal */}
      {pageSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#141923] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Page SEO &amp; Settings</h3>
              <button
                type="button"
                onClick={() => setPageSettingsOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePageMeta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Page Title</label>
                <input
                  type="text"
                  required
                  value={page.title || ''}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>

              {page.slug !== 'home' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={page.slug || ''}
                    onChange={(e) => setPage({ ...page, slug: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#00ABED]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">SEO Meta Title</label>
                <input
                  type="text"
                  value={page.seo_title || ''}
                  onChange={(e) => setPage({ ...page, seo_title: e.target.value })}
                  placeholder="Defaults to Site Title if left blank"
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={page.seo_description || ''}
                  onChange={(e) => setPage({ ...page, seo_description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">OpenGraph Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={page.og_image || ''}
                    onChange={(e) => setPage({ ...page, og_image: e.target.value })}
                    className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setMediaCallback(() => (url: string) => setPage({ ...page, og_image: url }))
                    }
                    className="px-3 py-2 bg-white/10 text-white rounded-xl text-xs flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#00ABED]" />
                    <span>Browse</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={page.is_published}
                    onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-[#00ABED]"
                  />
                  <span>Publish this page publicly</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={page.no_index}
                    onChange={(e) => setPage({ ...page, no_index: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-[#00ABED]"
                  />
                  <span>Prevent search engines from indexing (noindex)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPageSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-white/70 bg-white/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPage}
                  className="px-4 py-2 text-xs font-semibold bg-[#00ABED] text-black rounded-xl shadow-md disabled:opacity-50"
                >
                  {savingPage ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
