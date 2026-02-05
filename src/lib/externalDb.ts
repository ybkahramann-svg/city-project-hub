import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;

export const externalDb = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY
);

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  budget: number;
  progress: number;
  image_url: string;
  created_at: string;
}
