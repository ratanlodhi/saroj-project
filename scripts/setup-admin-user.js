/**
 * Script to create an admin user in Supabase
 * This script uses Supabase Admin API to create a user with admin privileges
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install dotenv
 * 2. Get your Supabase Service Role Key from: https://supabase.com/dashboard/project/_/settings/api
 * 3. Create a .env.local file with:
 *    VITE_SUPABASE_URL=your_supabase_url
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * 
 * Usage: node scripts/setup-admin-user.js
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load environment variables from .env.local
let supabaseUrl;
let supabaseServiceKey;

try {
  const envPath = resolve(__dirname, '../.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
  
  supabaseUrl = envVars.VITE_SUPABASE_URL;
  supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
} catch (error) {
  console.error('⚠️  Could not read .env.local file');
}

// Fallback to process.env
supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
supabaseServiceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables\n');
  console.error('Please create a .env.local file in the project root with:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n');
  console.error('Get your Service Role Key from:');
  console.error('  https://supabase.com/dashboard/project/_/settings/api\n');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'Admin';

async function setupAdminUser() {
  console.log('🔧 Setting up admin user...\n');

  try {
    // Step 1: Create the user in Supabase Auth
    console.log('📝 Creating admin user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: ADMIN_NAME,
        name: ADMIN_NAME
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('ℹ️  Admin user already exists in Auth');
        
        // Try to get the existing user
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          throw listError;
        }

        const existingUser = users.users.find(u => u.email === ADMIN_EMAIL);
        
        if (!existingUser) {
          throw new Error('User exists but could not be retrieved');
        }

        authData.user = existingUser;
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Admin user created successfully');
    }

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error('Failed to get user ID');
    }

    // Step 2: Ensure profile exists
    console.log('\n📝 Checking profile...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileCheckError) {
      console.error('Error checking profile:', profileCheckError);
    }

    if (!existingProfile) {
      console.log('Creating profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: ADMIN_EMAIL,
          display_name: ADMIN_NAME
        });

      if (profileError) {
        if (profileError.code === '23505') {
          console.log('ℹ️  Profile already exists');
        } else {
          throw profileError;
        }
      } else {
        console.log('✅ Profile created successfully');
      }
    } else {
      console.log('ℹ️  Profile already exists');
    }

    // Step 3: Grant admin role
    console.log('\n📝 Granting admin role...');
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleCheckError) {
      console.error('Error checking role:', roleCheckError);
    }

    if (!existingRole) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (roleError) {
        if (roleError.code === '23505') {
          console.log('ℹ️  Admin role already granted');
        } else {
          throw roleError;
        }
      } else {
        console.log('✅ Admin role granted successfully');
      }
    } else {
      console.log('ℹ️  Admin role already granted');
    }

    console.log('\n✅ Admin user setup completed successfully!');
    console.log('\n📧 Admin Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Name: ${ADMIN_NAME}`);
    console.log('\n🎉 You can now login with these credentials and access the admin panel!');

  } catch (error) {
    console.error('\n❌ Error setting up admin user:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminUser();
