import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://vduwcjfddwcrtpvkihxp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdXdjamZkZHdjcnRwdmtpaHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDcwNDMsImV4cCI6MjA4NTc4MzA0M30.l0DqagpLy3xEcZsXh79jCJSJVXcUUXftGg-Ernp-kI0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Project {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  budget?: number;
  progress?: number;
  image_url?: string;
  district?: string;
  neighborhood?: string;
  department?: string;
  manager_name?: string;
  start_date?: string;
  end_date?: string;
  impact_stat?: string;
  latitude?: number;
  longitude?: number;
  gallery_images?: string[] | null;
  is_umbrella?: boolean;
  sub_locations?: { name: string; status: string; lat: number; lng: number }[] | null;
  completion_date?: string;
  planned_date?: string;
  detailed_address?: string;
  created_at?: string;
}

// 1. GET PROJECTS
export const getProjects = async (): Promise<Project[]> => {
  console.log("Fetching projects directly...");
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching:", error);
    throw error;
  }
  return data || [];
};

// 2. ADD PROJECT
export const addProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  console.log("Adding project:", project);
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();

  if (error) {
    console.error("Error adding:", error);
    throw error;
  }
  return data;
};

// 3. UPDATE PROJECT
export const updateProject = async (id: string, updates: Partial<Omit<Project, 'id'>>): Promise<Project> => {
  console.log("Updating project:", id, updates);
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating:", error);
    throw error;
  }
  return data;
};

// 4. DELETE PROJECT
export const deleteProject = async (id: string): Promise<void> => {
  console.log("Deleting project:", id);
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting:", error);
    throw error;
  }
};
