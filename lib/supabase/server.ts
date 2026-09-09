import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/** Browser/SSR client with cookie support for auth */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — can be ignored
          }
        },
      },
    }
  );
}

/** Lightweight public client for server-side public read queries */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Service-role client for server-side privileged operations (never exposed to browser) */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Get the currently logged-in user and verify if they are an admin */
export async function getAdminSession() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) return null;

    // Verify in admin_users table using service client
    const serviceClient = createServiceClient();
    const { data: adminRecord } = await serviceClient
      .from('admin_users')
      .select('id, email, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminRecord) {
      // If user metadata says admin, also register in admin_users for consistency
      if (user.user_metadata?.role === 'admin') {
        await serviceClient.from('admin_users').upsert({
          id: user.id,
          email: user.email!,
          role: 'admin',
        });
        return { user, role: 'admin' };
      }
      return null;
    }

    return { user, role: adminRecord.role };
  } catch (err) {
    console.error('[AdminSession Error]:', err);
    return null;
  }
}

/** Check if there are ANY admin accounts registered in the database */
export async function hasAnyAdmin() {
  try {
    const serviceClient = createServiceClient();
    const { count, error } = await serviceClient
      .from('admin_users')
      .select('*', { count: 'exact', head: true });
    if (error) return false;
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Enforce admin authorization, throws or redirects if not authorized */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

