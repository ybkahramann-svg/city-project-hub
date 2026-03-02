import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { DashboardFilters, SortOption } from '@/components/DashboardFilters';
import { CategoryView } from '@/components/CategoryView';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ProjectListItem } from '@/components/ProjectListItem';
import { Project } from '@/lib/externalDb';

type ViewMode = 'list' | 'categories';
type StatusFilter = '' | 'In Progress' | 'Completed' | 'Planned';

const sortProjects = (projects: Project[], sort: SortOption): Project[] => {
  const sorted = [...projects];
  switch (sort) {
    case 'az': return sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    case 'za': return sorted.sort((a, b) => b.title.localeCompare(a.title, 'tr'));
    case 'newest': return sorted.sort((a, b) => {
      const da = a.completion_date || a.created_at || '';
      const db = b.completion_date || b.created_at || '';
      return db.localeCompare(da);
    });
    case 'budget_desc': return sorted.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    case 'budget_asc': return sorted.sort((a, b) => (a.budget || 0) - (b.budget || 0));
    default: return sorted;
  }
};

export const ProjectsPage = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (category) result = result.filter((p) => p.category === category);
    if (district) result = result.filter((p) => p.district === district);
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    return sortProjects(result, sort);
  }, [projects, search, statusFilter, category, district, neighborhood, sort]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Projeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'Tümü', value: '' },
    { label: 'Devam Edenler', value: 'In Progress' },
    { label: 'Tamamlananlar', value: 'Completed' },
    { label: 'Planlananlar', value: 'Planned' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Status tabs */}
      <div className="sticky top-14 z-[9997] bg-background border-b border-border/50">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
                  statusFilter === tab.value ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="w-px h-5 bg-border/60 mx-1 flex-shrink-0" />
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'categories' : 'list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
                viewMode === 'categories' ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'
              }`}
            >
              Kategoriler
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[calc(3.5rem+44px)] z-[9996] bg-background border-b border-border/50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-2">
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

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4 px-1">
          <h1 className="text-xl font-bold text-foreground">Projeler</h1>
          <span className="text-sm text-muted-foreground font-medium">({filtered.length} proje)</span>
        </div>

        {viewMode === 'list' ? (
          filtered.length > 0 ? (
            <>
              {/* Desktop table header */}
              <div className="hidden md:flex items-center gap-4 px-3 py-2 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                <div className="w-14 flex-shrink-0" />
                <div className="flex-1 min-w-0">Proje</div>
                <div className="w-[140px] flex-shrink-0">Konum</div>
                <div className="w-[160px] flex-shrink-0">Durum</div>
                <div className="w-[120px] flex-shrink-0 text-right">Bütçe</div>
              </div>
              <div className="rounded-lg border border-border/40 overflow-hidden bg-card/30 md:rounded-lg md:border">
                {filtered.map((project) => (
                  <ProjectListItem key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 space-y-4">
              <p className="text-3xl">📋</p>
              <h3 className="text-xl font-semibold text-foreground">Proje bulunamadı</h3>
              <p className="text-muted-foreground">Arama veya filtreleri değiştirmeyi deneyin</p>
            </div>
          )
        ) : (
          <CategoryView projects={filtered} />
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default ProjectsPage;
