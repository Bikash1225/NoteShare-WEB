/*
  # Fix RLS Policies to Prevent Infinite Recursion

  1. Changes
    - Drop all existing policies on admins, documents, and profiles tables
    - Recreate simplified policies that avoid circular dependencies
    - Use auth.uid() directly and check profiles.is_admin without referencing admins table
  
  2. Security
    - Maintain secure access control
    - All tables keep RLS enabled
    - Admin checks simplified to prevent recursion
*/

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop all existing policies on documents
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete any document" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

-- Drop all existing policies on admins
DROP POLICY IF EXISTS "Only admins can view admin list" ON admins;
DROP POLICY IF EXISTS "Admins can view admin list" ON admins;
DROP POLICY IF EXISTS "Only admins can add admins" ON admins;
DROP POLICY IF EXISTS "Admins can add admins" ON admins;
DROP POLICY IF EXISTS "Only admins can remove admins" ON admins;
DROP POLICY IF EXISTS "Admins can remove admins" ON admins;

-- Profiles policies
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Documents policies
CREATE POLICY "documents_select_policy"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "documents_insert_policy"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = uploaded_by);

CREATE POLICY "documents_delete_policy"
  ON documents FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Admins policies (simplified to prevent recursion)
CREATE POLICY "admins_select_policy"
  ON admins FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

CREATE POLICY "admins_insert_policy"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

CREATE POLICY "admins_delete_policy"
  ON admins FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );