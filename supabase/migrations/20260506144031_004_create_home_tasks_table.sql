/*
  # Create home tasks table

  1. New Tables
    - `home_tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, task name)
      - `completed` (boolean, task status)
      - `month` (text, YYYY-MM format)
      - `priority` (text, task priority)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `home_tasks` table
    - Add policy for users to manage their own tasks
*/

CREATE TABLE IF NOT EXISTS home_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  completed boolean DEFAULT false,
  month text NOT NULL,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE home_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON home_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON home_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON home_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON home_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_home_tasks_user_id ON home_tasks(user_id);
CREATE INDEX idx_home_tasks_month ON home_tasks(month);
CREATE INDEX idx_home_tasks_user_month ON home_tasks(user_id, month);
