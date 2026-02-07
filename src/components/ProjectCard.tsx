import { Link } from 'react-router-dom';
import { Project } from '@/lib/externalDb';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link to={`/project/${project.id}`} className="block min-w-[200px] flex-shrink-0">
      <Card className="group relative overflow-hidden bg-secondary/40 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/20 h-full">
        {/* Image Container */}
        <div className="relative h-28 overflow-hidden bg-muted">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-2xl text-primary">📋</div>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-foreground border border-border">
            {project.status}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{project.category}</p>
            <h3 className="font-bold text-foreground line-clamp-2 text-sm mt-1">{project.title}</h3>
          </div>

          {(project.district || project.neighborhood) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="truncate">{[project.district, project.neighborhood].filter(Boolean).join(' / ')}</span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-accent font-semibold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>

          <p className="text-xs text-muted-foreground">
            💰 ${Number(project.budget).toLocaleString()}
          </p>
        </div>
      </Card>
    </Link>
  );
};
