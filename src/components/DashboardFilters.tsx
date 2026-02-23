import { useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Project } from '@/lib/externalDb';

export type SortOption = 'az' | 'za' | 'newest' | 'budget_desc' | 'budget_asc';

interface DashboardFiltersProps {
  projects: Project[];
  search: string;
  onSearchChange: (val: string) => void;
  district: string;
  onDistrictChange: (val: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (val: string) => void;
  sort: SortOption;
  onSortChange: (val: SortOption) => void;
}

export const DashboardFilters = ({
  projects,
  search,
  onSearchChange,
  district,
  onDistrictChange,
  neighborhood,
  onNeighborhoodChange,
  sort,
  onSortChange,
}: DashboardFiltersProps) => {
  const districts = useMemo(
    () => [...new Set(projects.map((p) => p.district).filter(Boolean))].sort(),
    [projects]
  );

  const neighborhoods = useMemo(
    () =>
      [
        ...new Set(
          projects
            .filter((p) => !district || p.district === district)
            .map((p) => p.neighborhood)
            .filter(Boolean)
        ),
      ].sort(),
    [projects, district]
  );

  return (
    <div className="space-y-2 md:space-y-0">
      {/* Search – full width on mobile, inline on desktop */}
      <div className="relative w-full md:w-auto md:min-w-[200px] md:flex-1 md:inline-block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Proje Ara..."
          className="pl-9 bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent w-full"
        />
      </div>

      {/* Filters row – grid on mobile, inline flex on desktop */}
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-3 md:mt-0 mt-2">
        {/* District */}
        <select
          value={district}
          onChange={(e) => {
            onDistrictChange(e.target.value);
            onNeighborhoodChange('');
          }}
          className="px-3 py-2 bg-card border border-border/50 rounded-md text-foreground text-sm focus:border-accent outline-none w-full md:w-auto"
        >
          <option value="">Tüm İlçeler</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Neighborhood */}
        <select
          value={neighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          className="px-3 py-2 bg-card border border-border/50 rounded-md text-foreground text-sm focus:border-accent outline-none w-full md:w-auto"
        >
          <option value="">Tüm Mahalleler</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5 col-span-2 md:col-span-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 bg-card border border-border/50 rounded-md text-foreground text-sm focus:border-accent outline-none w-full md:w-auto"
          >
            <option value="newest">Yeniden Eskiye</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="budget_desc">Bütçe (Azalan)</option>
            <option value="budget_asc">Bütçe (Artan)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
