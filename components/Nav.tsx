'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { NavigationItem, SiteSettings } from '@/types';

interface Props {
  settings?: SiteSettings | null;
  items?: NavigationItem[];
}

const DEFAULT_LINKS = [
  { id: '1', title: 'Services', url: '#services', is_external: false, open_in_new_tab: false },
  { id: '2', title: 'Work', url: '#work', is_external: false, open_in_new_tab: false },
  { id: '3', title: 'About', url: '#about', is_external: false, open_in_new_tab: false },
  { id: '4', title: 'Contact', url: '#contact', is_external: false, open_in_new_tab: false },
];

export default function Nav({ settings, items }: Props) {
  useEffect(() => {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = items && items.length > 0 ? items.filter((i) => i.is_active) : DEFAULT_LINKS;
  const logoUrl = settings?.logo_url || '/COLORD_HORIZENTAL.png';
  const siteName = settings?.site_name || 'Genie Studio';

  return (
    <nav id="mainNav">
      <Link className="nav-logo" href="/">
        <img src={logoUrl} alt={siteName} />
      </Link>

      <div className="nav-links">
        {navLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target={link.open_in_new_tab ? '_blank' : undefined}
            rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
          >
            {link.title}
          </a>
        ))}
      </div>

      <a className="nav-cta" href="#contact">
        Let&apos;s Talk →
      </a>
    </nav>
  );
}
