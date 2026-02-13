import { Link } from 'react-router-dom';
import { Project } from '@/lib/externalDb';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { ProjectImage } from './ProjectImage';

interface ProjectCardProps {
  project: Project;
}

const getPlannedTiming = (): string => {
  const years = [2025, 2026, 2027];
  const durations = ['6 Months', '8 Months', '12 Months', '18 Months', '24 Months'];
  const year = years[Math.floor(Math.random() * years.length)];
  const duration = durations[Math.floor(Math.random() * durations.length)];
  return `${year} - ${duration}`;
};

const StatusFooter = ({ project }: { project: Project }) => {
  if (project.status === 'In Progress') {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-accent font-semibold">{project.progress ?? 0}%</span>
        </div>
        <Progress value={project.progress ?? 0} className="h-1.5" />
      </div>
    );
  }

  if (project.status === 'Completed') {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-green-400">Completed</span>
      </div>
    );
  }

  // Planned
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-medium">{getPlannedTiming()}</span>
    </div>
  );
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link to={`/project/${project.id}`} className="block min-w-[200px] max-w-[200px] flex-shrink-0">
      <Card className="group relative overflow-hidden bg-secondary/40 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:scale-105 h-full flex flex-col">
        {/* Image Container — fixed aspect ratio */}
        <div className="relative h-28 overflow-hidden bg-muted flex-shrink-0">
          <ProjectImage
            src={project.image_url}
            alt={project.title}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Content — flex-grow middle, sticky footer */}
        <div className="p-3 flex flex-col flex-grow">
          <div className="flex-grow">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{project.category}</p>
            <h3 className="font-bold text-foreground line-clamp-2 text-sm mt-1">{project.title}</h3>

            {(project.district || project.neighborhood) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                <span className="truncate">{[project.district, project.neighborhood].filter(Boolean).join(' / ')}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-2">
            <StatusFooter project={project} />
          </div>
        </div>
      </Card>
    </Link>
  );
};
