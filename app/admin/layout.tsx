'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Image as ImageIcon,
  Menu as MenuIcon,
  Sliders,
  Share2,
  Inbox,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pages & Builder', href: '/admin/pages', icon: FileText },
  { name: 'Collections', href: '/admin/collections', icon: Layers },
  { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { name: 'Navigation Menu', href: '/admin/navigation', icon: MenuIcon },
  { name: 'Footer', href: '/admin/footer', icon: Sliders },
  { name: 'Social Links', href: '/admin/social', icon: Share2 },
  { name: 'Inquiries', href: '/admin/inquiries', icon: Inbox },
  { name: 'Website Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    // Reset body cursor specifically for admin dashboard
    document.body.style.cursor = 'default';
    const existingCursor = document.querySelector('.cursor') as HTMLElement | null;
    const existingRing = document.querySelector('.cursor-ring') as HTMLElement | null;
    if (existingCursor) existingCursor.style.display = 'none';
    if (existingRing) existingRing.style.display = 'none';

    return () => {
      document.body.style.cursor = '';
      if (existingCursor) existingCursor.style.display = '';
      if (existingRing) existingRing.style.display = '';
    };
  }, []);

  useEffect(() => {
    if (isLoginPage) return;

    async function checkSession() {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.replace('/admin/login');
        }
      } catch {
        router.replace('/admin/login');
      } finally {
        setCheckedSession(true);
      }
    }

    checkSession();
  }, [pathname, isLoginPage, router]);

  const loading = !isLoginPage && !checkedSession;

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
    } catch {
      router.replace('/admin/login');
    }
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#090D14] text-white select-auto">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col items-center justify-center text-white/50 space-y-3">
        <div className="w-8 h-8 border-2 border-[#00ABED] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-wider font-semibold text-white/40">Loading Genie CMS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D14] text-white flex flex-col md:flex-row antialiased select-auto">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0F141F] border-r border-white/5 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo / Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#004362] to-[#00ABED] flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-950/50">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide block">Genie Studio</span>
              <span className="text-[10px] text-[#00ABED] font-mono block -mt-0.5">CMS DASHBOARD</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-6 px-4 overflow-y-auto space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/30">Management</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#00ABED]/10 text-[#00ABED] font-semibold border border-[#00ABED]/25 shadow-sm'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ABED]' : 'text-white/40'}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </div>

        {/* Footer info & logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ABED]/20 text-[#00ABED] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-white/40 uppercase font-mono">{user?.role || 'Admin'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar on mobile/desktop */}
        <header className="h-20 bg-[#0B0F17]/80 backdrop-blur-md border-b border-white/5 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="hidden sm:inline">CMS</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-white font-medium capitalize">
                {pathname === '/admin'
                  ? 'Overview'
                  : pathname.replace('/admin/', '').split('/')[0].replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00ABED]" />
              <span>View Website</span>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 sm:p-12 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
