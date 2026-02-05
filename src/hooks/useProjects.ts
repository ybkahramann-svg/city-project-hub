import { useQuery } from '@tanstack/react-query';
import { externalDb, Project } from '@/lib/externalDb';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await externalDb
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Project[];
    },
  });
};

export const useProjectsByStatus = (status: string) => {
  const { data: projects = [], ...rest } = useProjects();
  const filtered = projects.filter((p) => p.status === status);
  return { data: filtered, ...rest };
};

export const useFeaturedProject = () => {
  const { data: projects = [], ...rest } = useProjects();
  const featured = projects.find(
    (p) => p.status === 'In Progress' && p.progress > 0
  ) || projects[0];
  return { data: featured, ...rest };
};
