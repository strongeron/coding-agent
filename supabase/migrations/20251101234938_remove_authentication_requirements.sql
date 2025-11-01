/*
  # Remove Authentication Requirements

  ## Overview
  This migration removes all authentication-related constraints and policies from the database,
  allowing the application to function without user authentication.

  ## Changes

  ### 1. Drop All RLS Policies
  - Remove all authentication-based Row Level Security policies
  - Conversations, messages, and sandboxes tables will be accessible without auth

  ### 2. Modify Conversations Table
  - Make user_id column nullable
  - Remove user_id index since it's no longer used for filtering

  ### 3. Create Permissive Policies
  - Add new policies that allow all operations without authentication
  - Enable public access to all tables for SELECT, INSERT, UPDATE, DELETE

  ## Security Note
  - This configuration is suitable for development and single-user environments
  - All data becomes publicly accessible without authentication
*/

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can view sandboxes in own conversations" ON sandboxes;
DROP POLICY IF EXISTS "Users can create sandboxes in own conversations" ON sandboxes;
DROP POLICY IF EXISTS "Users can update sandboxes in own conversations" ON sandboxes;

-- Drop user_id index since we're no longer filtering by user
DROP INDEX IF EXISTS idx_conversations_user_id;

-- Make user_id nullable in conversations table
ALTER TABLE conversations ALTER COLUMN user_id DROP NOT NULL;

-- Create permissive policies for public access
CREATE POLICY "Allow all operations on conversations"
  ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on messages"
  ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on sandboxes"
  ON sandboxes
  FOR ALL
  USING (true)
  WITH CHECK (true);
