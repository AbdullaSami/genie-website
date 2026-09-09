import type { SiteSettings, FooterSection, SocialLink } from '@/types';

interface Props {
  settings?: SiteSettings | null;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
}

export default function Footer({ settings, sections, socialLinks }: Props) {
  const logoUrl = settings?.logo_url || '/MONOCHROMA_HORIZENTAL_VERISON.png';
  const siteName = settings?.site_name || 'Genie Studio';
  const copyright = settings?.copyright_text || '© 2025 Genie Studio. All rights reserved.';

  // If sections provided from CMS
  const hasCustomSections = sections && sections.length > 0;
  const activeSocials = socialLinks?.filter((s) => s.is_active) || [];

  return (
    <footer>
      <div className="footer-logo">
        <img src={logoUrl} alt={siteName} />
      </div>

      <span className="footer-copy">{copyright}</span>

      <div className="footer-links">
        {hasCustomSections ? (
          sections.flatMap((s) => s.links).map((link, i) => (
            <a
              key={i}
              href={link.url}
              target={link.open_in_new_tab ? '_blank' : undefined}
              rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))
        ) : (
          <>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href={`mailto:${settings?.email || 'hello@genies.studio'}`}>Email</a>
          </>
        )}

        {activeSocials.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
