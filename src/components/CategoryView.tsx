import { useMemo, useState } from 'react';
import type { Project } from '@/hooks/useProjects';
import { ProjectListItem } from './ProjectListItem';

type StatusChip = '' | 'In Progress' | 'Completed' | 'Planned';

const CHIPS: { label: string; value: StatusChip }[] = [
  { label: 'Tümü', value: '' },
  { label: 'Devam Eden', value: 'In Progress' },
  { label: 'Tamamlanan', value: 'Completed' },
  { label: 'Planlanan', value: 'Planned' },
];

interface CategoryViewProps {
  projects: Project[];
}

export const CategoryView = ({ projects }: CategoryViewProps) => {
  const [chipFilter, setChipFilter] = useState<StatusChip>('');

  const filteredProjects = useMemo(() => {
    if (!chipFilter) return projects;
    return projects.filter((p) => p.status === chipFilter);
  }, [projects, chipFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, Project[]> = {};
    filteredProjects.forEach((p) => {
      const cat = p.category || 'Kategorisiz';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [filteredProjects]);

  return (
    <div className="space-y-0 md:space-y-10">
      {/* Netflix-style horizontal filter chips – mobile only */}
      <div className="sticky top-[84px] z-40 bg-background/80 backdrop-blur-md py-2.5 px-4 -mx-4 block md:hidden">
        <div className="flex overflow-x-auto scrollbar-hide gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setChipFilter(chip.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                chipFilter === chip.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Filtrelere uygun proje bulunamadı.</p>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-3 px-2 mb-3 mt-6 md:mt-0">
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
            <div className="rounded-lg border border-border/40 overflow-hidden bg-card/30 md:rounded-lg md:border">
              {items.map((project) => (
                <ProjectListItem key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
