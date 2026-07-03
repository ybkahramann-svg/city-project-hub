import { BarChart3, TrendingUp, HardHat, CheckCircle, FolderKanban } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface AnalyticsPanelProps {
  projects: Project[];
}

const formatBudget = (total: number): string => {
  if (total >= 1_000_000_000) return `₺${(total / 1_000_000_000).toFixed(1)}B`;
  if (total >= 1_000_000) return `₺${(total / 1_000_000).toFixed(0)}M`;
  if (total >= 1_000) return `₺${(total / 1_000).toFixed(0)}K`;
  return `₺${total.toFixed(0)}`;
};

export const AnalyticsPanel = ({ projects }: AnalyticsPanelProps) => {
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const completed = projects.filter((p) => p.status === 'Completed').length;
  const inProgress = projects.filter((p) => p.status === 'In Progress').length;
  const planned = projects.filter((p) => p.status === 'Planned').length;
  const total = projects.length;

  const statusBars = [
    { label: 'Tamamlandı', count: completed, color: 'bg-green-500', pct: total ? (completed / total) * 100 : 0 },
    { label: 'Devam Ediyor', count: inProgress, color: 'bg-yellow-500', pct: total ? (inProgress / total) * 100 : 0 },
    { label: 'Planlanıyor', count: planned, color: 'bg-red-400', pct: total ? (planned / total) * 100 : 0 },
  ];

  return (
    <div className="h-full flex flex-col rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Genel Analiz</h3>
      </div>

      {/* Stats */}
      <div className="flex-1 p-3 md:p-4 flex flex-col justify-between gap-2 md:gap-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="rounded-lg bg-secondary/40 p-2 md:p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <FolderKanban className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Projeler</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{total}</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2 md:p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Bütçe</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-accent">{formatBudget(totalBudget)}</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2 md:p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <HardHat className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Aktif</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{inProgress}</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-2 md:p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Biten</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{completed}</p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Durum Dağılımı</h4>
          {statusBars.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="text-foreground font-semibold">{s.count} ({Math.round(s.pct)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.color} transition-all duration-500`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
