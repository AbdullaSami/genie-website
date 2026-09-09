import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();

    const { data: page, error: pageErr } = await serviceClient
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (pageErr) return NextResponse.json({ error: pageErr.message }, { status: 404 });

    const { data: sections, error: secErr } = await serviceClient
      .from('page_sections')
      .select('*')
      .eq('page_id', id)
      .order('sort_order', { ascending: true });

    if (secErr) return NextResponse.json({ error: secErr.message }, { status: 500 });

    return NextResponse.json({ page: { ...page, sections: sections || [] } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    const { slug, title, seo_title, seo_description, og_image, canonical_url, no_index, is_published, sort_order } = body;

    const payload: any = {
      title,
      seo_title,
      seo_description,
      og_image,
      canonical_url,
      no_index: no_index ?? false,
      is_published: is_published ?? true,
      sort_order: sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    if (slug) {
      payload.slug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    }

    const { data, error } = await serviceClient
      .from('pages')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, page: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();

    // Protect home page from deletion
    const { data: page } = await serviceClient.from('pages').select('slug').eq('id', id).single();
    if (page?.slug === 'home') {
      return NextResponse.json({ error: 'The Home page cannot be deleted.' }, { status: 400 });
    }

    const { error } = await serviceClient.from('pages').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
