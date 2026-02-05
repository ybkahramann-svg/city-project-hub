import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ProjectHero } from '@/components/ProjectHero';
import { ProjectCarousel } from '@/components/ProjectCarousel';
import { useProjects, useFeaturedProject, useProjectsByStatus } from '@/hooks/useProjects';

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: featured } = useFeaturedProject();
  const { data: inProgress } = useProjectsByStatus('In Progress');
  const { data: completed } = useProjectsByStatus('Completed');
  const { data: planned } = useProjectsByStatus('Planned');
  const { isLoading } = useProjects();

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mayor's Dashboard</h1>
            <p className="text-sm text-muted-foreground">Municipal Projects Overview</p>
          </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section>
          <ProjectHero project={featured} />
        </section>

        {/* Carousels */}
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

        {/* Empty State */}
        {inProgress.length === 0 && completed.length === 0 && planned.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <p className="text-3xl">📋</p>
            <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
            <p className="text-muted-foreground">
              Start by adding projects through the Admin Panel
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MayorDashboard;
