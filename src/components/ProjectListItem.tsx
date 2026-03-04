import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, Building2, Tag, Banknote } from 'lucide-react';
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
  if (!budget) return null;
  if (budget >= 1_000_000) return `${(budget / 1_000_000).toFixed(1)}M TL`;
  if (budget >= 1_000) return `${(budget / 1_000).toFixed(0)}K TL`;
  return `${budget.toLocaleString('tr-TR')} TL`;
};

const statusConfig = {
  'In Progress': { label: 'Devam Ediyor', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'Completed': { label: 'Tamamlandı', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  'Planned': { label: 'Planlanıyor', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20' },
};

interface ProjectListItemProps {
  project: Project;
}

export const ProjectListItem = ({ project }: ProjectListItemProps) => {
  const navigate = useNavigate();
  const cfg = statusConfig[project.status as keyof typeof statusConfig] || statusConfig['Planned'];
  const budgetStr = formatBudget(project.budget);

  const metaItems = [
    project.neighborhood && { icon: MapPin, text: project.neighborhood },
    project.department && { icon: Building2, text: project.department },
    project.category && { icon: Tag, text: project.category },
    budgetStr && { icon: Banknote, text: `Bütçe: ${budgetStr}` },
  ].filter(Boolean) as { icon: React.ElementType; text: string }[];

  const renderStatus = () => {
    if (project.status === 'In Progress') {
      const pct = project.progress || 0;
      return (
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress value={pct} className="h-1.5 flex-1 bg-muted" />
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">%{pct}</span>
        </div>
      );
    }
    if (project.status === 'Completed') {
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] text-muted-foreground">
            {project.completion_date ? formatTurkishDate(project.completion_date) : 'Tamamlandı'}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-[11px] text-muted-foreground">
          {project.planned_date ? formatTurkishDate(project.planned_date) : 'Planlanıyor'}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* ===== MOBILE (< md) ===== */}
      <button
        onClick={() => navigate(`/project/${project.id}`)}
        className="flex md:hidden flex-row gap-3 p-3 border-b border-border/40 items-start w-full text-left active:bg-muted/30 transition-colors"
      >
        <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <p className="text-sm font-semibold leading-tight text-foreground line-clamp-1">{project.title}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            {project.neighborhood && <span>📍 {project.neighborhood}</span>}
            {project.category && <span>• {project.category}</span>}
            {budgetStr && <span className="opacity-60">• {budgetStr}</span>}
          </div>
          <div className="flex items-center justify-between mt-1">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 font-medium border ${cfg.className}`}>
              {cfg.label}
            </Badge>
            {project.status === 'In Progress' && (
              <span className="text-[11px] font-semibold text-muted-foreground">%{project.progress || 0}</span>
            )}
          </div>
        </div>
      </button>

      {/* ===== DESKTOP (≥ md) ===== */}
      <button
        onClick={() => navigate(`/project/${project.id}`)}
        className="hidden md:flex w-full items-center gap-4 px-4 py-3 border-b border-border/30 hover:bg-muted/30 transition-colors text-left group"
      >
        {/* Thumbnail */}
        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">—</div>
          )}
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {project.title}
          </p>
          <div className="flex items-center gap-x-3 mt-0.5 text-[11px] text-muted-foreground font-medium">
            {metaItems.map((item, i) => (
              <span key={i} className={`flex items-center gap-1 ${item.icon === Banknote ? 'opacity-50' : ''}`}>
                <item.icon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{item.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Status badge + progress */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-5 font-semibold border ${cfg.className}`}>
            {cfg.label}
          </Badge>
          <div className="w-[120px]">
            {renderStatus()}
          </div>
        </div>
      </button>
    </>
  );
};
