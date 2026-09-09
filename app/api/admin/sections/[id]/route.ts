import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    const { title, subtitle, content, sort_order, is_active } = body;
    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) payload.title = title;
    if (subtitle !== undefined) payload.subtitle = subtitle;
    if (content !== undefined) payload.content = content;
    if (sort_order !== undefined) payload.sort_order = sort_order;
    if (is_active !== undefined) payload.is_active = is_active;

    const { data, error } = await serviceClient
      .from('page_sections')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, section: data });
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

    const { error } = await serviceClient.from('page_sections').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
