import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/supabase/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.role,
    },
  });
}
