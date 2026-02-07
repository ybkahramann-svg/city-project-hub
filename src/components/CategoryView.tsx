import { useMemo } from 'react';
import { Project } from '@/lib/externalDb';
import { ProjectCard } from './ProjectCard';

interface CategoryViewProps {
  projects: Project[];
}

export const CategoryView = ({ projects }: CategoryViewProps) => {
  const grouped = useMemo(() => {
    const map: Record<string, Project[]> = {};
    projects.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [projects]);

  if (grouped.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No projects match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {grouped.map(([category, items]) => (
        <div key={category} className="space-y-4">
          <div className="px-2">
            <h2 className="text-2xl font-bold text-foreground">{category}</h2>
            <p className="text-sm text-muted-foreground mt-1">{items.length} projects</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
