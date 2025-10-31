/*
  # Create Conversations and Authentication Schema

  ## Overview
  This migration sets up the database schema for the Mastra Coding Agent UI,
  including conversation storage, message history, and sandbox tracking.

  ## New Tables

  ### `conversations`
  Stores conversation threads for each user session
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `title` (text) - Auto-generated or custom conversation title
  - `created_at` (timestamptz) - When conversation was created
  - `updated_at` (timestamptz) - Last message timestamp

  ### `messages`
  Stores individual messages within conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid, foreign key) - Parent conversation
  - `role` (text) - Message role: 'user' or 'assistant'
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ### `sandboxes`
  Tracks Daytona sandbox sessions linked to conversations
  - `id` (uuid, primary key) - Record identifier
  - `conversation_id` (uuid, foreign key) - Associated conversation
  - `sandbox_id` (text) - Daytona sandbox ID
  - `language` (text) - Sandbox language (python/typescript)
  - `status` (text) - active, stopped, error
  - `created_at` (timestamptz) - Sandbox creation time
  - `last_active_at` (timestamptz) - Last activity timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own conversations and related data
  - Authentication required for all operations
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sandboxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sandbox_id text NOT NULL UNIQUE,
  language text DEFAULT 'python',
  status text DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'error')),
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandboxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view sandboxes in own conversations"
  ON sandboxes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = sandboxes.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sandboxes in own conversations"
  ON sandboxes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = sandboxes.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sandboxes in own conversations"
  ON sandboxes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = sandboxes.conversation_id
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = sandboxes.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sandboxes_conversation_id ON sandboxes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sandboxes_sandbox_id ON sandboxes(sandbox_id);
