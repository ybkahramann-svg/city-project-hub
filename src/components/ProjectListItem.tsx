import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar } from 'lucide-react';
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

  const renderDesktopStatus = () => {
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
    const pct = project.progress || 0;
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress value={pct} className="h-1.5 flex-1 bg-muted" />
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">%{pct}</span>
      </div>
    );
  };

  const renderMobileStatus = () => {
    if (project.status === 'Completed') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
    if (project.status === 'Planned') {
      return <Calendar className="w-5 h-5 text-destructive" />;
    }
    const pct = project.progress || 0;
    return <span className="text-sm font-bold text-primary">%{pct}</span>;
  };

  return (
    <>
      {/* ===== MOBILE CARD (< md) ===== */}
      <button
        onClick={() => navigate(`/project/${project.id}`)}
        className="flex md:hidden flex-row gap-3 p-3 bg-card border border-border/60 rounded-xl shadow-sm mb-3 items-start w-full text-left active:scale-[0.98] transition-transform"
      >
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 justify-between min-h-[5rem]">
          <div>
            <p className="whitespace-normal text-base font-semibold leading-tight text-foreground">
              {project.title}
            </p>
            {project.neighborhood && (
              <p className="text-sm text-muted-foreground mt-0.5">{project.neighborhood}</p>
            )}
          </div>

          {/* Bottom info row */}
          <div className="mt-auto pt-2 flex justify-between items-end">
            <div>{renderMobileStatus()}</div>
            <span className="text-sm font-medium text-foreground">{formatBudget(project.budget)}</span>
          </div>
        </div>
      </button>

      {/* ===== DESKTOP ROW (≥ md) ===== */}
      <button
        onClick={() => navigate(`/project/${project.id}`)}
        className="hidden md:flex w-full items-center gap-4 px-3 py-3 border-b border-border/40 hover:bg-muted/40 transition-colors text-left group"
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {project.title}
          </p>
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

        {/* Location */}
        <div className="w-[140px] flex-shrink-0">
          <p className="text-xs text-muted-foreground truncate">
            {[project.district, project.neighborhood].filter(Boolean).join(' / ') || '—'}
          </p>
        </div>

        {/* Status */}
        <div className="w-[160px] flex-shrink-0">
          {renderDesktopStatus()}
        </div>

        {/* Budget */}
        <div className="w-[120px] flex-shrink-0 text-right">
          <span className="text-xs font-semibold text-foreground">{formatBudget(project.budget)}</span>
        </div>
      </button>
    </>
  );
};
