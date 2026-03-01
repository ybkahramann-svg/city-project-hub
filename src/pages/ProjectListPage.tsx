import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CategoryView } from '@/components/CategoryView';
import { DashboardFilters, SortOption } from '@/components/DashboardFilters';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/externalDb';

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

const ProjectListPage = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (category) result = result.filter(p => p.category === category);
    if (district) result = result.filter(p => p.district === district);
    if (neighborhood) result = result.filter(p => p.neighborhood === neighborhood);
    return sortProjects(result, sort);
  }, [projects, search, category, district, neighborhood, sort]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-[9999] bg-background border-b border-border/50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/mayor')}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
          <h1 className="text-sm font-bold uppercase tracking-widest text-accent">Proje Listesi</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[52px] z-[9998] bg-background border-b border-border/50 shadow-sm">
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
        <CategoryView projects={filtered} />
      </main>
    </div>
  );
};

export default ProjectListPage;
