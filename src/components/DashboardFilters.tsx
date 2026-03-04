import { useMemo } from 'react';
import { Search, ArrowUpDown, MapPin, Home, FolderKanban, Building2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/lib/externalDb';

export type SortOption = 'az' | 'za' | 'newest' | 'budget_desc' | 'budget_asc';

interface DashboardFiltersProps {
  projects: Project[];
  search: string;
  onSearchChange: (val: string) => void;
  category?: string;
  onCategoryChange?: (val: string) => void;
  district: string;
  onDistrictChange: (val: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (val: string) => void;
  sort: SortOption;
  onSortChange: (val: SortOption) => void;
  status?: string;
  onStatusChange?: (val: string) => void;
  department?: string;
  onDepartmentChange?: (val: string) => void;
}

export const DashboardFilters = ({
  projects,
  search,
  onSearchChange,
  category = '',
  onCategoryChange,
  district,
  onDistrictChange,
  neighborhood,
  onNeighborhoodChange,
  sort,
  onSortChange,
  status = '',
  onStatusChange,
  department = '',
  onDepartmentChange,
}: DashboardFiltersProps) => {
  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort(),
    [projects]
  );

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

  const departments = useMemo(
    () => [...new Set(projects.map((p) => p.department).filter(Boolean))].sort(),
    [projects]
  );

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      {/* Search */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Proje Ara..."
          className="pl-9 bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent w-full"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-2 md:flex-shrink-0">
        {/* Category */}
        {onCategoryChange && (
          <Select
            value={category || '__all__'}
            onValueChange={(val) => onCategoryChange(val === '__all__' ? '' : val)}
          >
            <SelectTrigger className="w-full md:w-[140px] bg-card border-border/50 text-foreground text-xs h-9">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Kategori" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-[9999]">
              <SelectItem value="__all__">Tüm Kategoriler</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* District */}
        <Select
          value={district || '__all__'}
          onValueChange={(val) => {
            onDistrictChange(val === '__all__' ? '' : val);
            onNeighborhoodChange('');
          }}
        >
          <SelectTrigger className="w-full md:w-[140px] bg-card border-border/50 text-foreground text-xs h-9">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <SelectValue placeholder="İlçe" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-[9999]">
            <SelectItem value="__all__">Tüm İlçeler</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d} value={d!}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Neighborhood */}
        <Select
          value={neighborhood || '__all__'}
          onValueChange={(val) => onNeighborhoodChange(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-full md:w-[140px] bg-card border-border/50 text-foreground text-xs h-9">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <SelectValue placeholder="Mahalle" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-[9999]">
            <SelectItem value="__all__">Tüm Mahalleler</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n} value={n!}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department */}
        {onDepartmentChange && (
          <Select
            value={department || '__all__'}
            onValueChange={(val) => onDepartmentChange(val === '__all__' ? '' : val)}
          >
            <SelectTrigger className="w-full md:w-[150px] bg-card border-border/50 text-foreground text-xs h-9">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Müdürlük" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-[9999]">
              <SelectItem value="__all__">Tüm Müdürlükler</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d!}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status */}
        {onStatusChange && (
          <Select
            value={status || '__all__'}
            onValueChange={(val) => onStatusChange(val === '__all__' ? '' : val)}
          >
            <SelectTrigger className="w-full md:w-[130px] bg-card border-border/50 text-foreground text-xs h-9">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Durum" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-[9999]">
              <SelectItem value="__all__">Tüm Durumlar</SelectItem>
              <SelectItem value="In Progress">Devam Edenler</SelectItem>
              <SelectItem value="Completed">Tamamlananlar</SelectItem>
              <SelectItem value="Planned">Planlananlar</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <Select value={sort} onValueChange={(val) => onSortChange(val as SortOption)}>
          <SelectTrigger className="w-full md:w-[150px] bg-card border-border/50 text-foreground text-xs h-9">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-[9999]">
            <SelectItem value="newest">Yeniden Eskiye</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="za">Z-A</SelectItem>
            <SelectItem value="budget_desc">Bütçe (Azalan)</SelectItem>
            <SelectItem value="budget_asc">Bütçe (Artan)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
