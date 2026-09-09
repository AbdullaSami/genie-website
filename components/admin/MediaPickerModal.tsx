'use client';

import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Search, X, Check } from 'lucide-react';
import type { MediaItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaItem?: MediaItem) => void;
  selectedUrl?: string;
}

export default function MediaPickerModal({ isOpen, onClose, onSelect, selectedUrl }: Props) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  async function fetchMedia(query = '') {
    setLoading(true);
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      if (data.media) {
        setMediaList((prev) => [data.media, ...prev]);
        onSelect(data.media.url, data.media);
        onClose();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#141923] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161d2b]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#00ABED]" />
            <h3 className="text-base font-semibold text-white">Media Library</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-[#10141d]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchMedia(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#00ABED]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#00ABED] hover:bg-[#009AD4] rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40 text-sm">
              Loading media library...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ImageIcon className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/60 text-sm font-medium">No images found</p>
              <p className="text-white/40 text-xs mt-1">Upload an image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {mediaList.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.url, item);
                      onClose();
                    }}
                    className={`group relative aspect-square rounded-xl overflow-hidden border transition-all text-left bg-black/40 ${
                      isSelected
                        ? 'border-[#00ABED] ring-2 ring-[#00ABED]/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text || item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-[10px] text-white truncate w-full">{item.name}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00ABED] text-black flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-white/10 bg-[#161d2b]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
