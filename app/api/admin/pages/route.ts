import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();

    const { data: pages, error } = await serviceClient
      .from('pages')
      .select('*, page_sections(id)')
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = pages?.map((p: any) => ({
      ...p,
      sections_count: p.page_sections ? p.page_sections.length : 0,
    }));

    return NextResponse.json({ pages: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    const { slug, title, seo_title, seo_description, og_image, canonical_url, no_index, is_published, sort_order } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    const { data, error } = await serviceClient
      .from('pages')
      .insert({
        slug: cleanSlug,
        title,
        seo_title: seo_title || title,
        seo_description: seo_description || '',
        og_image: og_image || '',
        canonical_url: canonical_url || '',
        no_index: no_index ?? false,
        is_published: is_published ?? true,
        sort_order: sort_order ?? 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, page: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
