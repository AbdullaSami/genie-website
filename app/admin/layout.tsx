'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Layers, Image as ImageIcon, Menu, Sliders, Share2, Inbox, Settings, ExternalLink, LogOut, X, Sparkles, Search, ChevronRight } from 'lucide-react';
import styles from './workspace.module.css';

const groups = [
  { label: 'Workspace', items: [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Client inquiries', href: '/admin/inquiries', icon: Inbox },
  ] },
  { label: 'Content', items: [
    { name: 'Pages & builder', href: '/admin/pages', icon: FileText },
    { name: 'Collections', href: '/admin/collections', icon: Layers },
    { name: 'Media library', href: '/admin/media', icon: ImageIcon },
  ] },
  { label: 'Website', items: [
    { name: 'Navigation', href: '/admin/navigation', icon: Menu },
    { name: 'Footer', href: '/admin/footer', icon: Sliders },
    { name: 'Social links', href: '/admin/social', icon: Share2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ] },
];
const items = groups.flatMap(group => group.items);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const isLogin = pathname === '/admin/login';
  const current = items.find(item => item.href === pathname) || items.find(item => item.href !== '/admin' && pathname.startsWith(item.href));

  useEffect(() => {
    if (isLogin) return;
    let active = true;
    fetch('/api/admin/session').then(res => res.json()).then(data => {
      if (!active) return;
      if (data.authenticated && data.user) setUser({ ...data.user, role: data.role || data.user.role });
      else router.replace('/admin/login');
    }).catch(() => { if (active) router.replace('/admin/login'); });
    return () => { active = false; };
  }, [isLogin, router]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = menuButton.current;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLElement>('a, button')?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const controls = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a, button, input') || []).filter(el => el.offsetParent !== null);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKey); trigger?.focus(); };
  }, [mobileOpen]);

  async function logout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error();
      setUser(null);
      router.replace('/admin/login');
    } catch { setLogoutError('Could not sign out. Please try again.'); }
    finally { setLoggingOut(false); }
  }

  if (isLogin) return <div className={styles.workspace}>{children}</div>;
  if (!user) return <div className={`${styles.workspace} ${styles.loading}`} role="status"><Sparkles size={30} /><p>Opening your workspace…</p></div>;

  return (
    <div className={styles.workspace}>
      <a href="#crm-main" className={styles.skip}>Skip to content</a>
      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}
      <aside ref={sidebar} id="crm-sidebar" aria-label="Workspace navigation" className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <Link href="/admin" className={styles.brand} onClick={() => setMobileOpen(false)}>
          <span className={styles.brandIcon}><Sparkles size={22} /></span>
          <span>genie<span className={styles.brandDot}>.</span><small>STUDIO WORKSPACE</small></span>
        </Link>
        <button className={styles.closeMenu} aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        <label className={styles.navSearch}><Search size={16} /><input aria-label="Find a workspace page" placeholder="Find a page…" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <div className={styles.navGroups}>
          {groups.map(group => {
            const matches = group.items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
            return matches.length > 0 && <div key={group.label} className={styles.navGroup}><p>{group.label}</p>{matches.map(item => {
              const active = current?.href === item.href;
              return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`${styles.navLink} ${active ? styles.active : ''}`} onClick={() => { setMobileOpen(false); setSearch(''); }}><item.icon size={18} /><span>{item.name}</span>{active && <span className={styles.activeDot} />}</Link>;
            })}</div>;
          })}
          {!items.some(item => item.name.toLowerCase().includes(search.toLowerCase())) && <p className={styles.noResults}>No pages found.</p>}
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.siteCard}><span className={styles.siteMark}>G</span><div><strong>Genie Studio</strong><small>Your creative studio</small></div><Link href="/" target="_blank" aria-label="Open public website"><ExternalLink size={16} /></Link></div>
          <div className={styles.account}><span className={styles.avatar}>{user.email.slice(0, 2).toUpperCase()}</span><div><strong title={user.email}>{user.email}</strong><small>{user.role || 'Administrator'}</small></div><button onClick={logout} disabled={loggingOut} aria-label="Sign out"><LogOut size={17} /></button></div>
          {logoutError && <p role="alert" className={styles.error}>{logoutError}</p>}
        </div>
      </aside>
      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><button ref={menuButton} className={styles.menuButton} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="crm-sidebar" onClick={() => setMobileOpen(true)}><Menu size={22} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{current?.name || 'Page editor'}</strong></div>
          <Link href="/" target="_blank" className={styles.websiteLink}>View website <ExternalLink size={15} /></Link>
        </header>
        <main id="crm-main" tabIndex={-1} className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
