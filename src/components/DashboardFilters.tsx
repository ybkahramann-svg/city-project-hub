import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Project } from '@/lib/externalDb';

interface DashboardFiltersProps {
  projects: Project[];
  search: string;
  onSearchChange: (val: string) => void;
  district: string;
  onDistrictChange: (val: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (val: string) => void;
}

export const DashboardFilters = ({
  projects,
  search,
  onSearchChange,
  district,
  onDistrictChange,
  neighborhood,
  onNeighborhoodChange,
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
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects..."
          className="pl-9 bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
        />
      </div>

      {/* District */}
      <select
        value={district}
        onChange={(e) => {
          onDistrictChange(e.target.value);
          onNeighborhoodChange('');
        }}
        className="px-3 py-2 bg-input/50 border border-border/50 rounded-md text-foreground text-sm focus:border-accent outline-none"
      >
        <option value="">All Districts</option>
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Neighborhood */}
      <select
        value={neighborhood}
        onChange={(e) => onNeighborhoodChange(e.target.value)}
        className="px-3 py-2 bg-input/50 border border-border/50 rounded-md text-foreground text-sm focus:border-accent outline-none"
      >
        <option value="">All Neighborhoods</option>
        {neighborhoods.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
};
