import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';

    const serviceClient = createServiceClient();
    let query = serviceClient.from('media').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,alt_text.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ media: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const alt_text = (formData.get('alt_text') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Generate safe unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `uploads/${timestamp}_${safeName}`;

    // ArrayBuffer for upload
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadErr } = await serviceClient.storage
      .from('website-media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = serviceClient.storage
      .from('website-media')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save to media table
    const { data: mediaRecord, error: dbErr } = await serviceClient
      .from('media')
      .insert({
        name: file.name,
        file_path: storagePath,
        url: publicUrl,
        size: file.size,
        mime_type: file.type,
        alt_text: alt_text || file.name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, media: mediaRecord });
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
    const { data: mediaItem, error: findErr } = await serviceClient
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (findErr || !mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Remove from storage if stored in website-media bucket
    if (mediaItem.file_path && !mediaItem.url.startsWith('/')) {
      await serviceClient.storage.from('website-media').remove([mediaItem.file_path]);
    }

    // Remove from db
    const { error: delErr } = await serviceClient.from('media').delete().eq('id', id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
