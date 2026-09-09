'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Image as ImageIcon,
  Layers,
  Inbox,
  ArrowUpRight,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    mediaCount: 0,
    servicesCount: 0,
    projectsCount: 0,
    teamCount: 0,
    testimonialsCount: 0,
    inquiriesCount: 0,
    newInquiriesCount: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [pagesRes, mediaRes, servicesRes, projectsRes, teamRes, testRes, inqRes] =
          await Promise.all([
            fetch('/api/admin/pages').then((r) => r.json()).catch(() => ({ pages: [] })),
            fetch('/api/admin/media').then((r) => r.json()).catch(() => ({ media: [] })),
            fetch('/api/admin/collections?type=services').then((r) => r.json()).catch(() => ({ items: [] })),
            fetch('/api/admin/collections?type=projects').then((r) => r.json()).catch(() => ({ items: [] })),
            fetch('/api/admin/collections?type=team').then((r) => r.json()).catch(() => ({ items: [] })),
            fetch('/api/admin/collections?type=testimonials').then((r) => r.json()).catch(() => ({ items: [] })),
            fetch('/api/admin/inquiries').then((r) => r.json()).catch(() => ({ submissions: [] })),
          ]);

        const pages = pagesRes.pages || [];
        const media = mediaRes.media || [];
        const services = servicesRes.items || [];
        const projects = projectsRes.items || [];
        const team = teamRes.items || [];
        const testimonials = testRes.items || [];
        const inquiries = inqRes.submissions || [];

        setStats({
          totalPages: pages.length,
          publishedPages: pages.filter((p: any) => p.is_published).length,
          draftPages: pages.filter((p: any) => !p.is_published).length,
          mediaCount: media.length,
          servicesCount: services.length,
          projectsCount: projects.length,
          teamCount: team.length,
          testimonialsCount: testimonials.length,
          inquiriesCount: inquiries.length,
          newInquiriesCount: inquiries.filter((i: any) => i.status === 'new').length,
        });

        setRecentInquiries(inquiries.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin mr-2" />
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002D43] via-[#004362] to-[#0F141F] p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ABED]/20 text-[#00ABED] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Genie Studio Content Manager
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            Manage your pages, content blocks, service offerings, portfolio projects, media assets, and incoming client inquiries from one central control panel.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121824] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Pages</span>
            <FileText className="w-4 h-4 text-[#00ABED]" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalPages}</div>
          <div className="text-[11px] text-white/40 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">{stats.publishedPages} published</span>
            <span>·</span>
            <span>{stats.draftPages} draft</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Media Assets</span>
            <ImageIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.mediaCount}</div>
          <div className="text-[11px] text-white/40">In Supabase Storage bucket</div>
        </div>

        <div className="bg-[#121824] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Collections</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.servicesCount + stats.projectsCount + stats.teamCount}
          </div>
          <div className="text-[11px] text-white/40">
            {stats.servicesCount} Services · {stats.projectsCount} Projects
          </div>
        </div>

        <div className="bg-[#121824] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Inquiries</span>
            <Inbox className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.inquiriesCount}</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {stats.newInquiriesCount} unread / new
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Inquiries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/pages"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#121824] border border-white/5 hover:border-[#00ABED]/40 hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00ABED]/10 text-[#00ABED] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white group-hover:text-[#00ABED] transition-colors">
                    Edit Pages & Sections
                  </h3>
                  <p className="text-[11px] text-white/40">Customize homepage and custom pages</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>

            <Link
              href="/admin/collections"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#121824] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                    Manage Collections
                  </h3>
                  <p className="text-[11px] text-white/40">Services, projects, team & reviews</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>

            <Link
              href="/admin/media"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#121824] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                    Upload & Browse Media
                  </h3>
                  <p className="text-[11px] text-white/40">Manage logos, images & project covers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#121824] border border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                    Website Settings & SEO
                  </h3>
                  <p className="text-[11px] text-white/40">Contact info, metadata & branding</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Inquiries Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Recent Client Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-xs text-[#00ABED] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#121824] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No inquiries received yet. When visitors fill out the contact form, submissions will appear here.
              </div>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white truncate">{inq.name}</h4>
                      {inq.status === 'new' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          New
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/40">
                          {inq.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 truncate">{inq.email} · {inq.service || 'General'}</p>
                    <p className="text-xs text-white/70 line-clamp-1 italic">&ldquo;{inq.message}&rdquo;</p>
                  </div>
                  <div className="text-[10px] text-white/30 shrink-0">
                    {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
