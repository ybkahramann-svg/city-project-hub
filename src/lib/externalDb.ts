import { supabase } from '@/integrations/supabase/client';

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

export const externalDb = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase.functions.invoke('external-projects', {
      body: { action: 'getProjects' },
    });

    if (error) throw error;
    return data as Project[];
  },

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    const { data, error } = await supabase.functions.invoke('external-projects', {
      body: { 
        action: 'addProject',
        project: {
          ...project,
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) throw error;
    return data as Project;
  },
};
