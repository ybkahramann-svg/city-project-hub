import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CommandCenterMap } from '@/components/CommandCenterMap';
import { useProjects } from '@/hooks/useProjects';

const MapPage = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background z-10">
        <button
          onClick={() => navigate('/mayor')}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
        <h1 className="text-sm font-bold uppercase tracking-widest text-accent">Kuşbakışı Harita</h1>
      </header>

      {/* Full map */}
      <div className="flex-1">
        <CommandCenterMap projects={projects} />
      </div>
    </div>
  );
};

export default MapPage;
