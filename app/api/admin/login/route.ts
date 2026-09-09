import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check if user is in admin_users
    const serviceClient = createServiceClient();
    const { data: adminRecord } = await serviceClient
      .from('admin_users')
      .select('id, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!adminRecord) {
      // If user metadata marks as admin, upsert into admin_users
      if (data.user.user_metadata?.role === 'admin') {
        await serviceClient.from('admin_users').upsert({
          id: data.user.id,
          email: data.user.email!,
          role: 'admin',
        });
      } else {
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: 'Access denied: Admin role required.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: adminRecord?.role || 'admin',
      },
    });
  } catch (err: any) {
    console.error('[Admin Login Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
