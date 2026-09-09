import { NextResponse } from 'next/server';
import { createServiceClient, hasAnyAdmin } from '@/lib/supabase/server';

export async function GET() {
  const adminExists = await hasAnyAdmin();
  return NextResponse.json({ adminExists });
}

export async function POST(request: Request) {
  try {
    const adminExists = await hasAnyAdmin();
    if (adminExists) {
      return NextResponse.json(
        { error: 'Initial setup is already completed. Please log in.' },
        { status: 400 }
      );
    }

    const { email, password } = await request.json();
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Valid email and password (min 6 characters) are required.' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const { data: userData, error: userError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: userError?.message || 'Failed to create user.' },
        { status: 500 }
      );
    }

    const { error: adminError } = await serviceClient.from('admin_users').upsert({
      id: userData.user.id,
      email: userData.user.email!,
      role: 'admin',
    });

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
