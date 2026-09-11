'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Trash2, Copy, Check, Image as ImageIcon, ExternalLink } from 'lucide-react';
import Toast from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { MediaItem } from '@/types';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia(query = '') {
    try {
      const res = await fetch(`/api/admin/media${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setToast({ message: 'File uploaded successfully!', type: 'success' });
      loadMedia();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    try {
      const res = await fetch(`/api/admin/media?id=${deleteItem.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete media');

      setToast({ message: 'Media item deleted', type: 'success' });
      setDeleteItem(null);
      loadMedia();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  function copyUrl(item: MediaItem) {
    const fullUrl = item.url.startsWith('http')
      ? item.url
      : `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setToast({ message: 'URL copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatBytes(bytes: number) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={!!deleteItem}
        title="Delete Media File"
        description={`Are you sure you want to permanently delete "${deleteItem?.name}"? Any content referencing this URL will no longer show this image.`}
        confirmText="Delete File"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Media Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload, browse, and manage images stored in Supabase Storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-lg shadow-slate-200/50 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>
        </div>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search images by name or alt text..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadMedia(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-white/30 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
        <div className="text-sm text-slate-500 px-2">
          Total items: <span className="font-semibold text-slate-900">{mediaList.length}</span>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mr-2" />
          Loading media assets...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          No media files found. Click &quot;Upload Image&quot; to add your first asset.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-200 transition-all shadow-md"
            >
              <div className="relative aspect-video bg-black/40 overflow-hidden flex items-center justify-center">
                <img
                  src={item.url}
                  alt={item.alt_text || item.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-50 text-slate-900 text-sm transition-colors"
                    title="Open full image"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyUrl(item)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-50 text-slate-900 text-sm transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteItem(item)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <p className="text-sm font-semibold text-slate-900 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{formatBytes(item.size)}</span>
                  <span className="font-mono">{item.mime_type?.split('/')[1]?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
