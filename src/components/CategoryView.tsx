import { useMemo } from 'react';
import { Project } from '@/lib/externalDb';
import { ProjectListItem } from './ProjectListItem';

interface CategoryViewProps {
  projects: Project[];
}

export const CategoryView = ({ projects }: CategoryViewProps) => {
  const grouped = useMemo(() => {
    const map: Record<string, Project[]> = {};
    projects.forEach((p) => {
      const cat = p.category || 'Kategorisiz';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [projects]);

  if (grouped.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Filtrelere uygun proje bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {grouped.map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center gap-3 px-2 mb-3">
            <h2 className="text-xl font-bold text-foreground">{category}</h2>
            <span className="text-sm text-muted-foreground font-medium">({items.length} proje)</span>
          </div>

          {/* Table header – hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 px-3 py-2 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <div className="w-14 flex-shrink-0" />
            <div className="flex-1 min-w-0">Proje</div>
            <div className="w-[140px] flex-shrink-0">Konum</div>
            <div className="w-[160px] flex-shrink-0">Durum</div>
            <div className="w-[120px] flex-shrink-0 text-right">Bütçe</div>
          </div>

          {/* Rows */}
          <div className="rounded-lg border border-border/40 overflow-hidden bg-card/30">
            {items.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
