import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { CommandCenterMap } from '@/components/CommandCenterMap';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { DashboardFilters, SortOption } from '@/components/DashboardFilters';

type StatusFilter = '' | 'In Progress' | 'Completed' | 'Planned';

const MapPage = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [sort, setSort] = useState<SortOption>('newest');

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    if (district) result = result.filter((p) => p.district === district);
    if (category) result = result.filter((p) => p.category === category);
    if (status) result = result.filter((p) => p.status === status);
    return result;
  }, [projects, search, neighborhood, district, category, status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-0">
        <div className="w-10 h-10 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Spacer for GlobalHeader */}
      <div className="h-14 shrink-0" />

      {/* Filter bar - above map, solid background */}
      <div className="relative z-[999] bg-background border-b border-border/50 shadow-sm shrink-0">
        <div className="px-3 py-2">
          <DashboardFilters
            projects={projects}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            district={district}
            onDistrictChange={setDistrict}
            neighborhood={neighborhood}
            onNeighborhoodChange={setNeighborhood}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
      </div>

      {/* Map - takes remaining space, leaves room for mobile bottom nav */}
      <div className="relative z-0 flex-1 min-h-0 pb-[5rem] md:pb-0">
        <div className="w-full h-full">
          <CommandCenterMap projects={filtered} />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MapPage;
