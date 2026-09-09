import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomCursor from '@/components/CustomCursor';
import ScrollObserver from '@/components/ScrollObserver';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ServicesGrid from '@/components/ServicesGrid';
import ProjectsGrid from '@/components/ProjectsGrid';
import TeamSection from '@/components/TeamSection';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import StatsBand from '@/components/StatsBand';
import DynamicSectionRenderer from '@/components/DynamicSectionRenderer';
import { createPublicClient } from '@/lib/supabase/server';
import type {
  CMSPage,
  PageSection,
  SiteSettings,
  NavigationItem,
  SocialLink,
  FooterSection,
  Stat,
  Service,
  Project,
  TeamMember,
  Testimonial,
} from '@/types';

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = createPublicClient();

  const [pageRes, settingsRes] = await Promise.all([
    supabase.from('pages').select('*').eq('slug', slug).maybeSingle(),
    supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
  ]);

  const page = pageRes.data as CMSPage | null;
  const settings = settingsRes.data as SiteSettings | null;

  if (!page) {
    return { title: 'Not Found — Genie Studio' };
  }

  const title = page.seo_title || `${page.title} — ${settings?.site_name || 'Genie Studio'}`;
  const description = page.seo_description || settings?.default_seo_description || '';
  const ogImage = page.og_image || settings?.default_og_image || '/COLORD_HORIZENTAL.png';
  const canonical = page.canonical_url || `${settings?.canonical_url || 'https://genies.studio'}/${slug}`;

  return {
    title,
    description,
    robots: page.no_index ? { index: false, follow: false } : undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: settings?.site_name || 'Genie Studio',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function CustomDynamicPage(props: Props) {
  const { slug } = await props.params;

  // Don't intercept home on [slug]
  if (slug === 'home') notFound();

  const supabase = createPublicClient();

  const [
    pageRes,
    settingsRes,
    navRes,
    socialRes,
    footerRes,
    statsRes,
    servicesRes,
    projectsRes,
    teamRes,
    testimonialsRes,
  ] = await Promise.all([
    supabase.from('pages').select('*, page_sections(*)').eq('slug', slug).maybeSingle(),
    supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
    supabase.from('navigation_items').select('*').order('sort_order', { ascending: true }),
    supabase.from('social_links').select('*').order('sort_order', { ascending: true }),
    supabase.from('footer_sections').select('*').order('sort_order', { ascending: true }),
    supabase.from('stats').select('*').order('sort_order', { ascending: true }),
    supabase.from('services').select('*').order('sort_order', { ascending: true }),
    supabase.from('projects').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('team').select('*').order('sort_order', { ascending: true }),
    supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
  ]);

  const page = pageRes.data as (CMSPage & { page_sections: PageSection[] }) | null;
  if (!page || !page.is_published) {
    notFound();
  }

  const settings = settingsRes.data as SiteSettings | null;
  const navItems = (navRes.data as NavigationItem[]) || [];
  const socialLinks = (socialRes.data as SocialLink[]) || [];
  const footerSections = (footerRes.data as FooterSection[]) || [];

  const stats = (statsRes.data as Stat[]) || [];
  const services = (servicesRes.data as Service[]) || [];
  const projects = (projectsRes.data as Project[]) || [];
  const team = (teamRes.data as TeamMember[]) || [];
  const testimonials = (testimonialsRes.data as Testimonial[]) || [];

  const sections = page.page_sections
    ? [...page.page_sections].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  function renderSectionBlock(sec: PageSection) {
    if (!sec.is_active) return null;

    switch (sec.block_type) {
      case 'hero':
        return (
          <Hero
            key={sec.id}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      case 'stats_band':
        return <StatsBand key={sec.id} stats={stats} />;
      case 'services_grid':
        return (
          <ServicesGrid
            key={sec.id}
            services={services}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      case 'about':
        return (
          <AboutSection
            key={sec.id}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      case 'projects_grid':
        return (
          <ProjectsGrid
            key={sec.id}
            projects={projects}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      case 'team_section':
        return (
          <TeamSection
            key={sec.id}
            team={team}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      case 'testimonials':
        return (
          <Testimonials
            key={sec.id}
            testimonials={testimonials}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      case 'contact_form':
        return (
          <ContactForm
            key={sec.id}
            title={sec.title}
            subtitle={sec.subtitle}
            content={sec.content}
          />
        );
      default:
        return <DynamicSectionRenderer key={sec.id} section={sec} />;
    }
  }

  return (
    <main>
      <CustomCursor />
      <ScrollObserver />
      <Nav settings={settings} items={navItems} />

      <div className="pt-20">
        {sections.length > 0 ? (
          sections.map(renderSectionBlock)
        ) : (
          <div className="py-24 text-center text-white/50 text-sm">
            This page has no content blocks yet.
          </div>
        )}
      </div>

      <Footer
        settings={settings}
        sections={footerSections}
        socialLinks={socialLinks}
      />
    </main>
  );
}
