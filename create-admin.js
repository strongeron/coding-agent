import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  console.log('Creating admin user...');

  const { data, error } = await supabase.auth.signUp({
    email: 'strongeron@gmail.com',
    password: 'admin',
  });

  if (error) {
    console.error('Error creating user:', error.message);

    if (error.message.includes('already registered')) {
      console.log('\n⚠️  User already exists. You can login with:');
      console.log('Email: strongeron@gmail.com');
      console.log('Password: admin');
    }

    process.exit(1);
  }

  console.log('✅ Admin user created successfully!');
  console.log('Email: strongeron@gmail.com');
  console.log('Password: admin');
  console.log('\nYou can now login with these credentials.');

  process.exit(0);
}

createAdminUser();
