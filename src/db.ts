import { createClient } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  subject?: string;
  semester?: string;
}

export interface ActivityLog {
  id: string;
  action_type: string;
  actor_id: string;
  actor_email: string;
  actor_name: string;
  target_id?: string;
  target_email?: string;
  target_name?: string;
  document_name?: string;
  message: string;
  created_at: string;
}

export async function createActivityLog(log: {
  action_type: string;
  actor_id: string;
  actor_email: string;
  actor_name: string;
  target_id?: string;
  target_email?: string;
  target_name?: string;
  document_name?: string;
  message: string;
}) {
  const { error } = await supabase
    .from('activity_logs')
    .insert([log]);

  if (error) {
    console.error('Error creating activity log:', error);
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
