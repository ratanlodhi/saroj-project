import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envText = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^=:#]+)=(.*)$/);
  if (!m) continue;
  env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
}

const url = env.VITE_SUPABASE_URL;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@sarojprakashbandi.com';
const ADMIN_PASSWORD = 'admin@123';

async function main() {
  const { data: usersData, error: listErr } = await sb.auth.admin.listUsers();
  if (listErr) throw listErr;

  let adminUser = usersData.users.find((u) => u.email === ADMIN_EMAIL);
  if (!adminUser) {
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Admin' },
    });
    if (createErr) throw createErr;
    adminUser = created.user;
  }

  const uid = adminUser.id;

  const { error: profileErr } = await sb.from('profiles').upsert({
    id: uid,
    email: ADMIN_EMAIL,
    display_name: 'Admin',
  });
  if (profileErr) console.error('Profile upsert warning:', profileErr.message);

  const { data: existingRole, error: roleCheckErr } = await sb
    .from('user_roles')
    .select('id')
    .eq('user_id', uid)
    .eq('role', 'admin')
    .maybeSingle();
  if (roleCheckErr) throw roleCheckErr;

  if (!existingRole) {
    const { error: roleInsertErr } = await sb.from('user_roles').insert({
      user_id: uid,
      role: 'admin',
    });
    if (roleInsertErr) throw roleInsertErr;
  }

  console.log('admin_ready', { email: ADMIN_EMAIL, user_id: uid });
}

main().catch((err) => {
  console.error('ensure-admin failed:', err.message || err);
  process.exit(1);
});
