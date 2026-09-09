// ═══════════════════════════════════════════════════════════
//  GENIE STUDIO — CMS & Database Types
// ═══════════════════════════════════════════════════════════

export interface Stat {
  id: number;
  value: number;
  label: string;
  sort_order: number;
  is_active?: boolean;
}

export interface Service {
  id: number;
  number: string;
  name: string;
  description: string;
  tags: string[];
  sort_order: number;
  is_active?: boolean;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  cover_url: string | null;
  gradient: string | null;
  external_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo_url: string;
  bio: string;
  sort_order: number;
  is_active?: boolean;
}

export interface Testimonial {
  id: number;
  quote: string;
  client_name: string;
  client_title: string;
  sort_order: number;
  is_active?: boolean;
}

export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  service?: string | null;
  message: string;
  status?: 'new' | 'read' | 'archived';
  notes?: string | null;
  created_at?: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string;
  favicon_url: string;
  default_seo_title: string;
  default_seo_description: string;
  default_og_image: string;
  canonical_url: string;
  phone: string;
  mobile: string;
  email: string;
  secondary_email: string;
  address: string;
  google_maps_url: string;
  business_hours: string;
  copyright_text: string;
  updated_at?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  is_external: boolean;
  open_in_new_tab: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface FooterLink {
  label: string;
  url: string;
  is_external?: boolean;
  open_in_new_tab?: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  sort_order: number;
  links: FooterLink[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  no_index: boolean;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  sections?: PageSection[];
}

export type BlockType =
  | 'hero'
  | 'about'
  | 'services_grid'
  | 'projects_grid'
  | 'team_section'
  | 'testimonials'
  | 'contact_form'
  | 'stats_band'
  | 'rich_text'
  | 'features'
  | 'faq'
  | 'cta'
  | 'gallery'
  | 'custom_html';

export interface PageSection {
  id: string;
  page_id: string;
  block_type: BlockType;
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, any>;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  file_path: string;
  url: string;
  size: number;
  mime_type: string;
  alt_text?: string | null;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface HeroBlockContent {
  eyebrow?: string;
  icon_url?: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  slogan_items?: string[];
  background_image?: string;
}

export interface AboutBlockContent {
  section_label?: string;
  body?: string;
  icon_url?: string;
  visual_text?: string;
  tags?: string[];
}

export interface RichTextBlockContent {
  html: string;
  section_label?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQBlockContent {
  section_label?: string;
  items: FAQItem[];
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeaturesBlockContent {
  section_label?: string;
  items: FeatureItem[];
}

export interface CTABlockContent {
  section_label?: string;
  button_text: string;
  button_url: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface GalleryBlockContent {
  section_label?: string;
  images: GalleryImage[];
}

export interface PageData {
  stats: Stat[];
  services: Service[];
  projects: Project[];
  team: TeamMember[];
  testimonials: Testimonial[];
  page?: CMSPage | null;
  sections?: PageSection[];
  settings?: SiteSettings | null;
  navItems?: NavigationItem[];
  socialLinks?: SocialLink[];
  footerSections?: FooterSection[];
}
