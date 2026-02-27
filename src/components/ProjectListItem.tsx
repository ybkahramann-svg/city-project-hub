import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/lib/externalDb';

const TURKISH_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const formatTurkishDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return `${TURKISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const formatBudget = (budget?: number) => {
  if (!budget) return '—';
  return `${budget.toLocaleString('tr-TR')} TL`;
};

interface ProjectListItemProps {
  project: Project;
}

export const ProjectListItem = ({ project }: ProjectListItemProps) => {
  const navigate = useNavigate();

  const renderStatus = () => {
    if (project.status === 'Completed') {
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium">
            {project.completion_date ? formatTurkishDate(project.completion_date) : 'Tamamlandı'}
          </span>
        </div>
      );
    }
    if (project.status === 'Planned') {
      return (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium">
            {project.planned_date ? `Planlanan: ${formatTurkishDate(project.planned_date)}` : 'Planlanıyor'}
          </span>
        </div>
      );
    }
    // In Progress
    const pct = project.progress || 0;
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress value={pct} className="h-1.5 flex-1 bg-muted" />
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">%{pct}</span>
      </div>
    );
  };

  return (
    <button
      onClick={() => navigate(`/project/${project.id}`)}
      className="w-full flex items-center gap-4 px-3 py-3 border-b border-border/40 hover:bg-muted/40 transition-colors text-left group"
    >
      {/* Col 1: Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {project.image_url ? (
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
        )}
      </div>

      {/* Col 2: Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {project.title}
          </p>
          {/* Mobile-only status badge */}
          <Badge
            className={`sm:hidden text-[10px] font-semibold border-0 flex-shrink-0 ${
              project.status === 'In Progress'
                ? 'bg-yellow-500/90 text-yellow-950'
                : project.status === 'Completed'
                ? 'bg-green-500/90 text-green-950'
                : 'bg-red-400/90 text-red-950'
            }`}
          >
            {project.status === 'In Progress'
              ? 'Devam'
              : project.status === 'Completed'
              ? 'Bitti'
              : 'Plan'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {project.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              {project.category}
            </Badge>
          )}
          {project.department && (
            <span className="text-[10px] text-muted-foreground truncate">{project.department}</span>
          )}
        </div>
      </div>

      {/* Col 3: Location */}
      <div className="hidden md:block w-[140px] flex-shrink-0">
        <p className="text-xs text-muted-foreground truncate">
          {[project.district, project.neighborhood].filter(Boolean).join(' / ') || '—'}
        </p>
      </div>

      {/* Col 4: Status */}
      <div className="hidden sm:block w-[160px] flex-shrink-0">
        {renderStatus()}
      </div>

      {/* Col 5: Budget */}
      <div className="w-[120px] flex-shrink-0 text-right">
        <span className="text-xs font-semibold text-foreground">{formatBudget(project.budget)}</span>
      </div>
    </button>
  );
};
