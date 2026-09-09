import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seed() {
  console.log('🌱 Seeding CMS data from existing website...');

  // 1. Site Settings
  console.log('Setting up site_settings...');
  const { error: settingsErr } = await supabase
    .from('site_settings')
    .upsert({
      id: 'default',
      site_name: 'Genie Studio',
      logo_url: '/COLORD_HORIZENTAL.png',
      favicon_url: '/favicon.ico',
      default_seo_title: 'Genie Studio® — A Brand of Magic That Never Fails',
      default_seo_description:
        'Genie Studio is a full-service creative studio specialising in brand identity, web, 3D, AI automation, marketing, and event planning.',
      default_og_image: '/COLORD_HORIZENTAL.png',
      canonical_url: 'https://genies.studio',
      phone: '+20 100 000 0000',
      mobile: '+20 100 000 0001',
      email: 'hello@genies.studio',
      secondary_email: 'contact@genies.studio',
      address: 'Cairo, Egypt',
      google_maps_url: 'https://maps.google.com',
      business_hours: 'Sun - Thu: 9:00 AM - 6:00 PM',
      copyright_text: '© 2025 Genie Studio. All rights reserved.',
      updated_at: new Date().toISOString(),
    });

  if (settingsErr) console.warn('site_settings error:', settingsErr.message);

  // 2. Social Links
  console.log('Setting up social_links...');
  const socialLinks = [
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/genie.studio', sort_order: 1 },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/genie-studio', sort_order: 2 },
    { platform: 'x', label: 'X (Twitter)', url: 'https://x.com/geniestudio', sort_order: 3 },
    { platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/201000000000', sort_order: 4 },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/geniestudio', sort_order: 5 },
  ];

  for (const s of socialLinks) {
    const { data: existing } = await supabase.from('social_links').select('id').eq('platform', s.platform).limit(1);
    if (!existing || existing.length === 0) {
      await supabase.from('social_links').insert(s);
    }
  }

  // 3. Navigation Items
  console.log('Setting up navigation_items...');
  const navItems = [
    { title: 'Services', url: '#services', sort_order: 1 },
    { title: 'Work', url: '#work', sort_order: 2 },
    { title: 'About', url: '#about', sort_order: 3 },
    { title: 'Contact', url: '#contact', sort_order: 4 },
  ];

  for (const n of navItems) {
    const { data: existing } = await supabase.from('navigation_items').select('id').eq('title', n.title).limit(1);
    if (!existing || existing.length === 0) {
      await supabase.from('navigation_items').insert(n);
    }
  }

  // 4. Footer Sections
  console.log('Setting up footer_sections...');
  const footerSections = [
    {
      title: 'Navigation',
      sort_order: 1,
      links: [
        { label: 'Services', url: '#services' },
        { label: 'Work', url: '#work' },
        { label: 'About', url: '#about' },
        { label: 'Contact', url: '#contact' },
      ],
    },
    {
      title: 'Contact',
      sort_order: 2,
      links: [
        { label: 'Email Us', url: 'mailto:hello@genies.studio' },
        { label: 'Call Us', url: 'tel:+201000000000' },
      ],
    },
  ];

  for (const f of footerSections) {
    const { data: existing } = await supabase.from('footer_sections').select('id').eq('title', f.title).limit(1);
    if (!existing || existing.length === 0) {
      await supabase.from('footer_sections').insert(f);
    }
  }

  // 5. Media assets register
  console.log('Registering existing media assets...');
  const initialMedia = [
    {
      name: 'COLORD_HORIZENTAL.png',
      file_path: 'COLORD_HORIZENTAL.png',
      url: '/COLORD_HORIZENTAL.png',
      size: 530103,
      mime_type: 'image/png',
      alt_text: 'Genie Studio Colored Horizontal Logo',
    },
    {
      name: 'ICON_VERSION.png',
      file_path: 'ICON_VERSION.png',
      url: '/ICON_VERSION.png',
      size: 431963,
      mime_type: 'image/png',
      alt_text: 'Genie Studio Star Icon',
    },
    {
      name: 'MONOCHROMA_HORIZENTAL_VERISON.png',
      file_path: 'MONOCHROMA_HORIZENTAL_VERISON.png',
      url: '/MONOCHROMA_HORIZENTAL_VERISON.png',
      size: 529566,
      mime_type: 'image/png',
      alt_text: 'Genie Studio Monochrome Logo',
    },
  ];

  for (const m of initialMedia) {
    const { data: existing } = await supabase.from('media').select('id').eq('name', m.name).limit(1);
    if (!existing || existing.length === 0) {
      await supabase.from('media').insert(m);
    }
  }

  // 6. Pages (Home Page)
  console.log('Setting up Pages (Home)...');
  let homePageId;
  const { data: existingHome } = await supabase.from('pages').select('id').eq('slug', 'home').limit(1);
  if (existingHome && existingHome.length > 0) {
    homePageId = existingHome[0].id;
  } else {
    const { data: createdHome, error: homeErr } = await supabase
      .from('pages')
      .insert({
        slug: 'home',
        title: 'Home',
        seo_title: 'Genie Studio® — A Brand of Magic That Never Fails',
        seo_description:
          'Genie Studio is a full-service creative studio specialising in brand identity, web, 3D, AI automation, marketing, and event planning.',
        og_image: '/COLORD_HORIZENTAL.png',
        canonical_url: 'https://genies.studio',
        is_published: true,
        sort_order: 1,
      })
      .select('id')
      .single();

    if (homeErr) {
      console.error('Home page creation error:', homeErr.message);
      return;
    }
    homePageId = createdHome.id;
  }

  // 7. Page Sections for Home
  console.log('Setting up Page Sections for Home...');
  const sections = [
    {
      page_id: homePageId,
      block_type: 'hero',
      title: 'Bold Ideas, Real Results',
      subtitle:
        'A full-service creative studio building brands, digital experiences, 3D visuals, AI systems, and unforgettable events — for teams that refuse to be ordinary.',
      sort_order: 1,
      is_active: true,
      content: {
        eyebrow: 'Cairo, Egypt · Est. 2022',
        icon_url: '/ICON_VERSION.png',
        primary_cta_text: 'See Our Work',
        primary_cta_url: '#work',
        secondary_cta_text: 'Start a Project',
        secondary_cta_url: '#contact',
        slogan_items: [
          'A BRAND OF MAGIC THAT NEVER FAILS',
          'BRAND IDENTITY',
          'WEB & DIGITAL',
          '3D DESIGN',
          'AI AUTOMATION',
          'EVENT PLANNING',
        ],
      },
    },
    {
      page_id: homePageId,
      block_type: 'stats_band',
      title: 'Studio Stats',
      subtitle: 'Delivering excellence consistently',
      sort_order: 2,
      is_active: true,
      content: {
        section_label: 'Impact',
      },
    },
    {
      page_id: homePageId,
      block_type: 'services_grid',
      title: 'Six ways we make magic happen',
      subtitle:
        'From the first spark to the final pixel — we cover every creative discipline your brand needs to grow.',
      sort_order: 3,
      is_active: true,
      content: {
        section_label: 'What We Do',
      },
    },
    {
      page_id: homePageId,
      block_type: 'about',
      title: 'Built on clarity, craft, and imagination',
      subtitle:
        'Genie Studio is a creative powerhouse that partners with ambitious brands to deliver identities, digital experiences, and campaigns that leave a lasting mark.',
      sort_order: 4,
      is_active: true,
      content: {
        section_label: 'About Genie Studio',
        body: 'From brand strategy and visual identity to web development, 3D production, AI automation, and event planning — we bring every idea to life with precision and purpose.',
        icon_url: '/ICON_VERSION.png',
        visual_text: 'Est. 2022 · Cairo, Egypt',
        tags: [
          'Brand Identity',
          'Art Direction',
          'UI / UX',
          'Web Dev',
          '3D & Motion',
          'AI Systems',
          'Events',
          'Marketing',
        ],
      },
    },
    {
      page_id: homePageId,
      block_type: 'projects_grid',
      title: 'Projects that speak for themselves',
      subtitle:
        "A selection of brands and experiences we've had the privilege to create.",
      sort_order: 5,
      is_active: true,
      content: {
        section_label: 'Our Work',
      },
    },
    {
      page_id: homePageId,
      block_type: 'team_section',
      title: 'Meet the board',
      subtitle: 'The minds behind every idea, strategy, and pixel.',
      sort_order: 6,
      is_active: true,
      content: {
        section_label: 'The Team',
      },
    },
    {
      page_id: homePageId,
      block_type: 'testimonials',
      title: 'What Clients Say',
      subtitle: 'Client feedback and testimonials',
      sort_order: 7,
      is_active: true,
      content: {
        section_label: 'What Clients Say',
      },
    },
    {
      page_id: homePageId,
      block_type: 'contact_form',
      title: "Let's build something magical",
      subtitle: "Tell us about your project and we'll make the magic happen.",
      sort_order: 8,
      is_active: true,
      content: {
        section_label: 'Ready to Start?',
        submit_text: 'Send Message →',
        success_message: "✦ Message sent! We'll be in touch soon.",
        services: [
          'Brand Identity & Strategy',
          'Web Design & Development',
          '3D Design & Visualization',
          'AI Automation',
          'Marketing & Social Media',
          'Event Planning & Identity',
          'Something else',
        ],
      },
    },
  ];

  for (const sec of sections) {
    const { data: existingSec } = await supabase
      .from('page_sections')
      .select('id')
      .eq('page_id', homePageId)
      .eq('block_type', sec.block_type)
      .limit(1);

    if (!existingSec || existingSec.length === 0) {
      await supabase.from('page_sections').insert(sec);
    }
  }

  console.log('✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
