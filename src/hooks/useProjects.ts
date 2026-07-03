import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;

const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const useProjects = () => {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects });
};

export const useProjectsByStatus = (status: string) => {
  const { data: projects = [], ...rest } = useProjects();
  const filtered = projects.filter((p) => p.status === status);
  return { data: filtered, ...rest };
};

export const useFeaturedProject = () => {
  const { data: projects = [], ...rest } = useProjects();
  const featured = projects.find(
    (p) => p.status === 'In Progress' && p.progress && p.progress > 0
  ) || projects[0];
  return { data: featured, ...rest };
};
