import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/externalDb';

const statusConfig = {
  'In Progress': { label: 'Devam Ediyor', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'Completed': { label: 'Tamamlandı', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  'Planned': { label: 'Planlanıyor', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20' },
};

const formatBudget = (budget?: number) => {
  if (!budget) return null;
  return budget.toLocaleString('tr-TR') + ' TL';
};

interface ProjectCardViewProps {
  project: Project;
}

export const ProjectCardView = ({ project }: ProjectCardViewProps) => {
  const navigate = useNavigate();
  const cfg = statusConfig[project.status as keyof typeof statusConfig] || statusConfig['Planned'];
  const budgetStr = formatBudget(project.budget);
  const metaParts = [project.neighborhood, project.department].filter(Boolean);

  return (
    <button
      onClick={() => navigate(`/project/${project.id}`)}
      className="flex flex-col rounded-xl overflow-hidden border border-border/40 bg-card hover:shadow-lg hover:border-border transition-all duration-200 text-left group w-full"
    >
      {/* Image */}
      <div className="aspect-[16/10] w-full bg-muted overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Görsel Yok</div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug">
          {project.title}
        </h3>

        {metaParts.length > 0 && (
          <p className="text-xs text-muted-foreground font-medium truncate">
            {metaParts.join(' • ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-5 font-semibold border ${cfg.className}`}>
            {cfg.label}
          </Badge>
          {budgetStr && (
            <span className="text-xs text-muted-foreground font-medium opacity-50">{budgetStr}</span>
          )}
        </div>
      </div>
    </button>
  );
};
