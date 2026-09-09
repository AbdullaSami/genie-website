import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const serviceClient = createServiceClient();

    const payload = {
      ...body,
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await serviceClient
      .from('site_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
