import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    // Reorder action
    if (body.action === 'reorder' && Array.isArray(body.sections)) {
      for (const item of body.sections) {
        await serviceClient
          .from('page_sections')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
      }
      return NextResponse.json({ success: true });
    }

    // Duplicate action
    if (body.action === 'duplicate' && body.id) {
      const { data: original, error: origErr } = await serviceClient
        .from('page_sections')
        .select('*')
        .eq('id', body.id)
        .single();

      if (origErr || !original) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      const { data: newSec, error: dupErr } = await serviceClient
        .from('page_sections')
        .insert({
          page_id: original.page_id,
          block_type: original.block_type,
          title: original.title ? `${original.title} (Copy)` : null,
          subtitle: original.subtitle,
          content: original.content,
          sort_order: (original.sort_order || 0) + 1,
          is_active: original.is_active,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dupErr) return NextResponse.json({ error: dupErr.message }, { status: 500 });
      return NextResponse.json({ success: true, section: newSec });
    }

    // Create new section
    const { page_id, block_type, title, subtitle, content, sort_order, is_active } = body;

    if (!page_id || !block_type) {
      return NextResponse.json({ error: 'Missing page_id or block_type' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('page_sections')
      .insert({
        page_id,
        block_type,
        title: title || '',
        subtitle: subtitle || '',
        content: content || {},
        sort_order: sort_order ?? 0,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, section: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
