'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, Layers, Inbox, ArrowUpRight, Plus, Sparkles, ChevronRight, Settings } from 'lucide-react';
import type { CMSPage, ContactSubmission } from '@/types';
import styles from './workspace.module.css';

type DashboardData = { pages: CMSPage[]; inquiries: ContactSubmission[]; media: number; collections: number };

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const paths = ['pages', 'media', 'inquiries', ...['services', 'projects', 'team', 'testimonials', 'stats'].map(type => `collections?type=${type}`)];
        const results = await Promise.all(paths.map(async path => {
          const response = await fetch(`/api/admin/${path}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Unable to load workspace');
          return response.json();
        }));
        setData({ pages: results[0].pages || [], media: (results[1].media || []).length, inquiries: results[2].submissions || [], collections: results.slice(3).reduce((sum, result) => sum + (result.items || []).length, 0) });
        setError(false);
      } catch { if (!controller.signal.aborted) setError(true); }
    }
    load();
    return () => controller.abort();
  }, [attempt]);

  if (error) return <div className={`${styles.panel} ${styles.empty}`} role="alert"><Inbox size={32} /><strong>We couldn’t load your workspace</strong><p>Please try again to see your latest content and inquiries.</p><button className={`${styles.primary} mt-5`} onClick={() => { setError(false); setAttempt(attempt + 1); }}>Try again</button></div>;
  if (!data) return <div className={styles.empty} role="status"><Sparkles size={28} /><p>Loading your workspace…</p></div>;

  const published = data.pages.filter(page => page.is_published).length;
  const newInquiries = data.inquiries.filter(item => item.status === 'new').length;
  const recent = [...data.inquiries].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5);
  const metrics = [
    { label: 'Total inquiries', value: data.inquiries.length, detail: `${newInquiries} new · ready for a reply`, icon: Inbox, href: '/admin/inquiries' },
    { label: 'Website pages', value: data.pages.length, detail: `${published} published · ${data.pages.length - published} drafts`, icon: FileText, href: '/admin/pages' },
    { label: 'Collection items', value: data.collections, detail: 'Across your five collections', icon: Layers, href: '/admin/collections' },
    { label: 'Media assets', value: data.media, detail: 'Your creative library, organized', icon: ImageIcon, href: '/admin/media' },
  ];
  const actions = [
    { title: 'Manage pages', description: 'Build and update your website content', icon: FileText, href: '/admin/pages' },
    { title: 'Organize collections', description: 'Projects, services, people & more', icon: Layers, href: '/admin/collections' },
    { title: 'Upload media', description: 'Give your next idea a visual', icon: ImageIcon, href: '/admin/media' },
    { title: 'Website settings', description: 'Keep your studio details up to date', icon: Settings, href: '/admin/settings' },
  ];

  return <div>
    <div className={styles.heading}><div><p className={styles.eyebrow}>Your studio, at a glance</p><h1>Workspace overview</h1><p className={styles.subtitle}>A little clarity for your next big idea.</p></div><Link href="/admin/pages" className={styles.primary}><Plus size={16} /> Manage pages</Link></div>
    <div className={styles.welcome}><div><h2>Welcome to your creative workspace.</h2><p>Keep your content fresh and your client conversations moving. Everything you need to manage Genie Studio is right here.</p></div><div className={styles.welcomeArt} aria-hidden="true"><Sparkles size={40} strokeWidth={1.3} /></div></div>
    <div className={styles.metrics}>{metrics.map(metric => <Link href={metric.href} key={metric.label} className={styles.metric}><div className={styles.metricLabel}>{metric.label}<span className={styles.metricIcon}><metric.icon size={17} /></span></div><strong>{metric.value}</strong><small>{metric.detail}</small></Link>)}</div>
    <div className={styles.dashboardGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Recent inquiries</h2><p>Your latest client conversations</p></div><Link href="/admin/inquiries">View all <ArrowUpRight size={14} /></Link></div>
        {recent.length ? recent.map(item => <Link href="/admin/inquiries" className={styles.inquiryRow} key={item.id}><span className={styles.avatar}>{item.name.slice(0, 2).toUpperCase()}</span><div className={styles.inquiryDetails}><strong>{item.name}</strong><p>{item.service || item.message}</p></div><span className={`${styles.badge} ${item.status === 'new' ? styles.badgeNew : ''}`}>{item.status || 'new'}</span><ChevronRight size={14} color="#b1b8c7" /></Link>) : <div className={styles.empty}><Inbox size={30} /><strong>Your next conversation starts here</strong><p>New website inquiries will appear in your inbox.</p></div>}
      </section>
      <div><section className={styles.panel}><div className={styles.panelHeading}><div><h2>Quick actions</h2><p>Make something happen</p></div><Sparkles size={16} color="#aaa0db" /></div>{actions.map(action => <Link href={action.href} className={styles.quickAction} key={action.title}><span><action.icon size={18} /></span><div><strong>{action.title}</strong><small>{action.description}</small></div><ChevronRight size={14} /></Link>)}</section>
        <section className={`${styles.panel} ${styles.publication}`}><h2>Content readiness</h2><p>{published} of {data.pages.length} pages published{data.pages.length - published > 0 ? ` · ${data.pages.length - published} waiting in drafts` : ''}</p><div className={styles.progress} role="progressbar" aria-label="Published pages" aria-valuenow={published} aria-valuemin={0} aria-valuemax={data.pages.length || 1}><span style={{ width: `${data.pages.length ? published / data.pages.length * 100 : 0}%` }} /></div></section>
      </div>
    </div>
  </div>;
}
