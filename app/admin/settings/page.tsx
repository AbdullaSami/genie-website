'use client';

import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Globe, Phone, Mail, MapPin, Clock, Check } from 'lucide-react';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import Toast from '@/components/admin/Toast';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // Media picker target field
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setToast({ message: 'Website settings saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Error saving settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: keyof SiteSettings, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
        Loading website settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <MediaPickerModal
        isOpen={!!mediaTarget}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (mediaTarget) {
            updateField(mediaTarget as keyof SiteSettings, url);
          }
        }}
        selectedUrl={mediaTarget ? (settings as any)[mediaTarget] : undefined}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Website Settings & SEO</h1>
          <p className="text-xs text-white/50 mt-1">
            Configure global website parameters, branding, contact coordinates, and default search engine metadata.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Brand & Identity */}
        <section className="bg-[#121824] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-sm font-semibold text-white">
            <Globe className="w-4 h-4 text-[#00ABED]" />
            <span>Brand Identity & Assets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Website Name</label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => updateField('site_name', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Canonical URL</label>
              <input
                type="url"
                value={settings.canonical_url || ''}
                onChange={(e) => updateField('canonical_url', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.logo_url || ''}
                  onChange={(e) => updateField('logo_url', e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
                <button
                  type="button"
                  onClick={() => setMediaTarget('logo_url')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00ABED]" />
                  <span>Browse</span>
                </button>
              </div>
              {settings.logo_url && (
                <div className="mt-2 p-2 bg-black/40 rounded-xl border border-white/5 w-fit">
                  <img src={settings.logo_url} alt="Logo preview" className="h-6 w-auto object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Favicon URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.favicon_url || ''}
                  onChange={(e) => updateField('favicon_url', e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
                <button
                  type="button"
                  onClick={() => setMediaTarget('favicon_url')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00ABED]" />
                  <span>Browse</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Global SEO Settings */}
        <section className="bg-[#121824] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-sm font-semibold text-white">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Default SEO & OpenGraph</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Default SEO Title</label>
              <input
                type="text"
                value={settings.default_seo_title || ''}
                onChange={(e) => updateField('default_seo_title', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Default Meta Description</label>
              <textarea
                rows={3}
                value={settings.default_seo_description || ''}
                onChange={(e) => updateField('default_seo_description', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Default OpenGraph Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.default_og_image || ''}
                  onChange={(e) => updateField('default_og_image', e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
                />
                <button
                  type="button"
                  onClick={() => setMediaTarget('default_og_image')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00ABED]" />
                  <span>Browse</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Coordinates */}
        <section className="bg-[#121824] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-sm font-semibold text-white">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Primary Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Secondary Email</label>
              <input
                type="email"
                value={settings.secondary_email || ''}
                onChange={(e) => updateField('secondary_email', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Primary Phone</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Mobile / WhatsApp</label>
              <input
                type="text"
                value={settings.mobile || ''}
                onChange={(e) => updateField('mobile', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-white/70">Physical Address</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-white/70">Google Maps URL</label>
              <input
                type="url"
                value={settings.google_maps_url || ''}
                onChange={(e) => updateField('google_maps_url', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-white/70">Business Hours</label>
              <input
                type="text"
                value={settings.business_hours || ''}
                onChange={(e) => updateField('business_hours', e.target.value)}
                placeholder="Sun - Thu: 9:00 AM - 6:00 PM"
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
              />
            </div>
          </div>
        </section>

        {/* Legal & Copyright */}
        <section className="bg-[#121824] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-sm font-semibold text-white">
            <Check className="w-4 h-4 text-white/60" />
            <span>Footer & Legal</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Copyright Text</label>
            <input
              type="text"
              value={settings.copyright_text || ''}
              onChange={(e) => updateField('copyright_text', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ABED]"
            />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#00ABED] hover:bg-[#009AD4] text-black font-semibold text-sm rounded-xl shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
