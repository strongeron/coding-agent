# Troubleshooting Guide

## Issue: "Database error querying schema" when logging in

### What We Found

Your application setup is correct:
- ✅ Database tables (conversations, messages, sandboxes) are properly created
- ✅ Row Level Security (RLS) policies are correctly configured
- ✅ User account exists in the auth.users table
- ✅ Environment variables are set correctly
- ✅ Frontend code is working properly
- ✅ Vite proxy is configured to route API calls to Mastra server

### The Root Cause

The error "Database error querying schema" is coming from **Supabase Auth service itself**, not your application code. This is an infrastructure-level issue with your Supabase project.

### Possible Reasons

1. **Supabase Project Paused**: Free-tier projects automatically pause after inactivity
2. **Auth Service Issue**: The Supabase Auth service may need to be restarted
3. **Recent Migration**: If you recently created the project, auth services may still be initializing
4. **Database Connection Pool**: The connection pool for auth may be exhausted

### Solutions to Try

#### 1. Check Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `iszikapvftepyvctivdh`
3. Check the project status (top of dashboard)
4. If it says "Paused", click "Resume" or "Restore"

#### 2. Restart Supabase Services

In your Supabase Dashboard:
1. Go to Settings → General
2. Scroll down to "Pause project" section
3. Click "Pause project" and wait
4. Click "Resume project"

This will restart all services including Auth.

#### 3. Verify Auth Service Health

1. In Supabase Dashboard, go to "Authentication" section
2. Check if you can see the user list
3. If the page loads slowly or errors, the Auth service has issues

#### 4. Check Project Logs

1. In Supabase Dashboard, go to "Logs" → "Postgres Logs"
2. Look for any errors related to auth schema queries
3. Also check "Auth Logs" for authentication-specific errors

#### 5. Recreate User Account

If the project is running but auth fails:

```bash
# Delete the old test user from Supabase Dashboard
# Then run:
node create-admin.js
```

#### 6. Contact Supabase Support

If none of the above work:
1. Go to https://supabase.com/dashboard/support
2. Report the issue with details:
   - Project ID: `iszikapvftepyvctivdh`
   - Error: "Database error querying schema" during signInWithPassword
   - User email: strongeron@gmail.com

### Verify the Fix

Once you've tried the solutions, test authentication:

```bash
node test-auth.js
```

If successful, you should see:
```
✅ Authentication successful!
✅ Found X conversations
✅ Conversation created successfully!
```

### Development Workflow

Once auth is working, start the development servers:

```bash
npm run dev
```

This starts both:
- Vite dev server (port 5173) - Frontend
- Mastra server (port 4111) - Backend API

Then navigate to http://localhost:5173 and log in with:
- Email: strongeron@gmail.com
- Password: admin

### Additional Notes

- The frontend Vite build completed successfully
- All database queries work fine when using service role key
- The issue is specifically with the Auth service endpoint
- Your application code has proper error logging now for future debugging

### Need More Help?

If you continue to experience issues after trying these solutions, please provide:
1. Screenshots from Supabase Dashboard showing project status
2. The full error output from `node test-auth.js`
3. Any error messages from Supabase Dashboard logs
