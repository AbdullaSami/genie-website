import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = process.argv[2] || 'admin@genies.studio';
  const password = process.argv[3] || 'GenieAdmin2025!';

  console.log(`Creating/updating admin user: ${email}...`);

  // Check if user already exists
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Error checking users:', listErr.message);
    process.exit(1);
  }

  let user = users?.users?.find((u) => u.email === email);

  if (!user) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (createErr) {
      console.error('Error creating user:', createErr.message);
      process.exit(1);
    }
    user = newUser.user;
    console.log(`✅ Supabase Auth user created with ID: ${user.id}`);
  } else {
    console.log(`ℹ️ Auth user already exists (${user.id}), ensuring admin role and updating password...`);
    await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
  }

  // Ensure record in admin_users
  const { error: adminErr } = await supabase.from('admin_users').upsert({
    id: user.id,
    email: user.email,
    role: 'admin',
    created_at: new Date().toISOString(),
  });

  if (adminErr) {
    console.error('Error registering in admin_users:', adminErr.message);
    process.exit(1);
  }

  console.log(`
🎉 Admin user setup complete!
   Email:    ${email}
   Password: ${password}
   Dashboard: /admin
  `);
}

main();
