import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { DashboardFilters, SortOption } from '@/components/DashboardFilters';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ProjectListItem } from '@/components/ProjectListItem';
import { ProjectCardView } from '@/components/ProjectCardView';
import { Project } from '@/lib/externalDb';
import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'list' | 'cards';

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
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    if (status) result = result.filter((p) => p.status === status);
    if (category) result = result.filter((p) => p.category === category);
    if (district) result = result.filter((p) => p.district === district);
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    if (department) result = result.filter((p) => p.department === department);
    return sortProjects(result, sort);
  }, [projects, search, status, category, district, neighborhood, department, sort]);

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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Single filter bar */}
      <div className="sticky top-14 z-[9997] bg-background border-b border-border/50 shadow-sm">
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
            status={status}
            onStatusChange={setStatus}
            department={department}
            onDepartmentChange={setDepartment}
          />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground">Projeler</h1>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Liste Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filtered.length > 0 ? (
          viewMode === 'list' ? (
            <div className="rounded-lg border border-border/40 overflow-hidden bg-card/20">
              {/* Desktop header */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/30">
                <div className="w-11 flex-shrink-0" />
                <div className="flex-1 min-w-0">Proje</div>
                <div className="w-[140px] flex-shrink-0">İlerleme</div>
              </div>
              {filtered.map((project) => (
                <ProjectListItem key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((project) => (
                <ProjectCardView key={project.id} project={project} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Proje bulunamadı</h3>
            <p className="text-muted-foreground">Arama veya filtreleri değiştirmeyi deneyin</p>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default ProjectsPage;
