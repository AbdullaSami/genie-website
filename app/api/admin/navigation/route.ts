import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('navigation_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    if (body.reorder && Array.isArray(body.items)) {
      // Batch reorder
      for (const item of body.items) {
        await serviceClient
          .from('navigation_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
      }
      return NextResponse.json({ success: true });
    }

    const { id, title, url, is_external, open_in_new_tab, is_active, sort_order } = body;
    const payload: any = {
      title,
      url,
      is_external: is_external ?? false,
      open_in_new_tab: open_in_new_tab ?? false,
      is_active: is_active ?? true,
      sort_order: sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await serviceClient
        .from('navigation_items')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await serviceClient
        .from('navigation_items')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: result.data });
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
    const { error } = await serviceClient.from('navigation_items').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
