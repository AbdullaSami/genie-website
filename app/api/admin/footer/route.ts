import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('footer_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sections: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    if (body.reorder && Array.isArray(body.sections)) {
      for (const item of body.sections) {
        await serviceClient
          .from('footer_sections')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
      }
      return NextResponse.json({ success: true });
    }

    const { id, title, sort_order, links, is_active } = body;
    const payload: any = {
      title,
      sort_order: sort_order ?? 0,
      links: links ?? [],
      is_active: is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await serviceClient
        .from('footer_sections')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await serviceClient
        .from('footer_sections')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, section: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('footer_sections').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
