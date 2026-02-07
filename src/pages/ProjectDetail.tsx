import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const project = projects.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-3xl">🚫</p>
          <h2 className="text-xl font-bold text-foreground">Project not found</h2>
          <Button onClick={() => navigate('/mayor')} variant="outline" className="gap-2 border-border/50 hover:border-accent/50 hover:text-accent">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = project.status === 'Completed' ? 'text-green-400' : project.status === 'In Progress' ? 'text-accent' : 'text-blue-400';

  return (
    <div className="min-h-screen bg-background relative">
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: project.image_url ? `url('${project.image_url}')` : undefined,
          filter: 'blur(40px) brightness(0.3)',
        }}
      />
      <div className="absolute inset-0 bg-background/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Back Button */}
        <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-md border-b border-border/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Button
              onClick={() => navigate('/mayor')}
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image */}
            <div className="rounded-2xl overflow-hidden border border-border/30 bg-secondary/20">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover min-h-[400px]"
                />
              ) : (
                <div className="w-full min-h-[400px] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-6xl">🏗️</span>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className="space-y-3">
                <Badge className="bg-accent/20 text-accent border-accent/30">{project.category}</Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">{project.title}</h1>
              </div>

              {/* District / Neighborhood */}
              {(project.district || project.neighborhood) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-lg">
                    {[project.district, project.neighborhood].filter(Boolean).join(' / ')}
                  </span>
                </div>
              )}

              {/* Budget */}
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Budget</p>
                <p className="text-4xl font-bold text-accent">
                  ${Number(project.budget).toLocaleString()}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                <p className={`text-xl font-semibold ${statusColor}`}>{project.status}</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest">Progress</span>
                  <span className="text-accent font-bold text-lg">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                <p className="text-foreground/80 leading-relaxed text-lg">{project.description}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetail;
