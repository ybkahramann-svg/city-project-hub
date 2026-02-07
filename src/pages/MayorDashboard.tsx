import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ProjectHero } from '@/components/ProjectHero';
import { ProjectCarousel } from '@/components/ProjectCarousel';
import { CategoryView } from '@/components/CategoryView';
import { DashboardFilters } from '@/components/DashboardFilters';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { useProjects } from '@/hooks/useProjects';

type Tab = 'projects' | 'categories';

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [tab, setTab] = useState<Tab>('projects');
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (district) result = result.filter((p) => p.district === district);
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    return result;
  }, [projects, search, district, neighborhood]);

  const featured = filtered.find((p) => p.status === 'In Progress' && p.progress > 0) || filtered[0];
  const inProgress = filtered.filter((p) => p.status === 'In Progress');
  const completed = filtered.filter((p) => p.status === 'Completed');
  const planned = filtered.filter((p) => p.status === 'Planned');

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
              {(['projects', 'categories'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
                    tab === t
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2 border-border/50 hover:border-accent/50 hover:text-accent"
              >
                <LogOut className="w-4 h-4" />
                Exit
              </Button>
            </div>
          </div>

          {/* Filters */}
          <DashboardFilters
            projects={projects}
            search={search}
            onSearchChange={setSearch}
            district={district}
            onDistrictChange={setDistrict}
            neighborhood={neighborhood}
            onNeighborhoodChange={setNeighborhood}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <ExecutiveSummary projects={filtered} />
        {tab === 'projects' ? (
          <>
            {featured && (
              <section>
                <ProjectHero project={featured} />
              </section>
            )}
            <section className="space-y-12">
              {inProgress.length > 0 && (
                <ProjectCarousel projects={inProgress} title="In Progress" status="In Progress" />
              )}
              {completed.length > 0 && (
                <ProjectCarousel projects={completed} title="Completed" status="Completed" />
              )}
              {planned.length > 0 && (
                <ProjectCarousel projects={planned} title="Planned" status="Planned" />
              )}
            </section>
            {filtered.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <p className="text-3xl">📋</p>
                <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        ) : (
          <CategoryView projects={filtered} />
        )}
      </main>
    </div>
  );
};

export default MayorDashboard;
