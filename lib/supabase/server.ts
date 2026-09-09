import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.SUPABASE_URL!
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function createPublicClient() {
  return createSupabaseClient(
    supabaseUrl,
    supabasePublishableKey
  )
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options)
              }
            )
          } catch {
            // Server Components cannot always modify cookies.
          }
        },
      },
    }
  )
}

export function createServiceClient() {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured'
    )
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function getAdminSession() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const serviceClient = createServiceClient()

  const { data: adminRecord, error: adminError } =
    await serviceClient
      .from('admin_users')
      .select('id, email, role')
      .eq('id', user.id)
      .maybeSingle()

  if (adminError || !adminRecord) {
    return null
  }

  return {
    user,
    admin: adminRecord,
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function hasAnyAdmin() {
  const serviceClient = createServiceClient()

  const { count, error } = await serviceClient
    .from('admin_users')
    .select('id', {
      count: 'exact',
      head: true,
    })

  if (error) {
    console.error('[hasAnyAdmin]', error)
    return false
  }

  return (count ?? 0) > 0
}
