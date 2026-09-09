import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

const ALLOWED_COLLECTIONS = ['services', 'projects', 'team', 'testimonials', 'stats'];

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('type');

    if (!collection || !ALLOWED_COLLECTIONS.includes(collection)) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from(collection)
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
    const { collection, action, item, items, id } = body;

    if (!collection || !ALLOWED_COLLECTIONS.includes(collection)) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Batch reorder
    if (action === 'reorder' && Array.isArray(items)) {
      for (const row of items) {
        await serviceClient
          .from(collection)
          .update({ sort_order: row.sort_order })
          .eq('id', row.id);
      }
      return NextResponse.json({ success: true });
    }

    // Insert or update
    if (id) {
      const { data, error } = await serviceClient
        .from(collection)
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, item: data });
    } else {
      const { data, error } = await serviceClient
        .from(collection)
        .insert(item)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, item: data });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('type');
    const id = searchParams.get('id');

    if (!collection || !ALLOWED_COLLECTIONS.includes(collection) || !id) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from(collection).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
