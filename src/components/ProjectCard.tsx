import { Link } from 'react-router-dom';
import type { Project } from '@/hooks/useProjects';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle2, Network, CalendarDays } from 'lucide-react';
import { ProjectImage } from './ProjectImage';

interface ProjectCardProps {
  project: Project;
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const formatTurkishDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return `${TURKISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return null;
  }
};

const StatusFooter = ({ project }: { project: Project }) => {
  if (project.status === 'In Progress') {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">İlerleme</span>
          <span className="text-accent font-semibold">{project.progress ?? 0}%</span>
        </div>
        <Progress value={project.progress ?? 0} className="h-1.5" />
      </div>
    );
  }

  if (project.status === 'Completed') {
    const dateStr = formatTurkishDate(project.completion_date);
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-green-400">Tamamlandı</span>
        </div>
        {dateStr && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
        )}
      </div>
    );
  }

  // Planned
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-medium">Planlanıyor</span>
    </div>
  );
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link to={`/project/${project.id}`} className="block min-w-[200px] max-w-[200px] flex-shrink-0">
      <Card className="group relative overflow-hidden bg-secondary/40 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:scale-105 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-28 overflow-hidden bg-muted flex-shrink-0">
          <ProjectImage
            src={project.image_url}
            alt={project.title}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          {project.is_umbrella && (
            <Badge className="absolute top-2 left-2 bg-accent/80 text-accent-foreground border-accent/40 text-[10px] gap-1 backdrop-blur-sm">
              <Network className="w-3 h-3" /> Ağ Projesi
            </Badge>
          )}
        </div>

        {/* Content */}
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
