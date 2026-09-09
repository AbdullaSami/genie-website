import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function runSQL(query) {
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`SQL query failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

async function main() {
  console.log('🚀 Running 003_cms_schema.sql migration...');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '003_cms_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await runSQL(sql);
    console.log('✅ Migration 003_cms_schema.sql executed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }

  // Ensure storage bucket exists
  console.log('📦 Checking storage bucket "website-media"...');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: buckets, error: bucketListErr } = await supabase.storage.listBuckets();
  if (bucketListErr) {
    console.warn('⚠️ Could not list buckets:', bucketListErr.message);
  } else {
    const exists = buckets?.some((b) => b.name === 'website-media');
    if (!exists) {
      console.log('Creating public bucket "website-media"...');
      const { data: created, error: createErr } = await supabase.storage.createBucket('website-media', {
        public: true,
        fileSizeLimit: 20971520, // 20MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'],
      });
      if (createErr) {
        console.warn('⚠️ Bucket creation note:', createErr.message);
      } else {
        console.log('✅ Storage bucket "website-media" created successfully.');
      }
    } else {
      console.log('✅ Storage bucket "website-media" already exists.');
    }
  }

  // Verify created tables
  console.log('🔍 Verifying CMS tables...');
  const tables = [
    'site_settings',
    'social_links',
    'navigation_items',
    'footer_sections',
    'pages',
    'page_sections',
    'media',
    'admin_users',
    'services',
    'projects',
    'team',
    'testimonials',
    'stats',
    'contact_submissions',
  ];

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ Table ${table} error:`, error.message);
    } else {
      console.log(`✅ Table "${table}" ready (count: ${count ?? 0})`);
    }
  }

  console.log('🎉 Database setup complete!');
}

main();
