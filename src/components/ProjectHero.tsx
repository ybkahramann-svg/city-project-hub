import { Link } from 'react-router-dom';
import { Project } from '@/lib/externalDb';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface ProjectHeroProps {
  project: Project | undefined;
}

export const ProjectHero = ({ project }: ProjectHeroProps) => {
  if (!project) return null;

  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="relative w-full h-96 rounded-xl overflow-hidden group cursor-pointer">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{
            backgroundImage: project.image_url ? `url('${project.image_url}')` : 'linear-gradient(135deg, hsl(45 85% 55% / 0.1), hsl(220 20% 20%))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-8 text-foreground">
          <div className="space-y-4">
            <div>
              <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30 mb-3">
                {project.category}
              </Badge>
              <h1 className="text-5xl font-bold mb-2 text-foreground drop-shadow-lg">{project.title}</h1>
              <p className="text-lg text-foreground/80 max-w-2xl drop-shadow-md">{project.description}</p>
              {(project.district || project.neighborhood) && (
                <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{[project.district, project.neighborhood].filter(Boolean).join(' / ')}</span>
                </div>
              )}
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Status</p>
                <p className="text-lg font-semibold text-accent">{project.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Budget</p>
                <p className="text-lg font-semibold text-foreground">${Number(project.budget).toLocaleString()}</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Progress</p>
                  <p className="text-lg font-semibold text-accent">{project.progress}%</p>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
