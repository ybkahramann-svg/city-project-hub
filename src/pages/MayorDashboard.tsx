import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, CheckCircle, AlertTriangle, Wallet, ArrowRight } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useProjects } from '@/hooks/useProjects';
import { ProjectListItem } from '@/components/ProjectListItem';
import { Button } from '@/components/ui/button';

const formatBudget = (total: number): string => {
  if (total >= 1_000_000_000) return `₺${(total / 1_000_000_000).toFixed(1)}B`;
  if (total >= 1_000_000) return `₺${(total / 1_000_000).toFixed(0)}M`;
  if (total >= 1_000) return `₺${(total / 1_000).toFixed(0)}K`;
  return `₺${total.toFixed(0)}`;
};

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();

  const inProgress = useMemo(() => projects.filter((p) => p.status === 'In Progress'), [projects]);
  const completed = useMemo(() => projects.filter((p) => p.status === 'Completed'), [projects]);
  const atRisk = useMemo(() => projects.filter((p) => p.status === 'In Progress' && (p.progress || 0) < 30).length, [projects]);
  const totalBudget = useMemo(() => projects.reduce((s, p) => s + (p.budget || 0), 0), [projects]);

  // Top 4 most recent / active projects for highlights
  const highlights = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      const da = a.completion_date || a.created_at || '';
      const db = b.completion_date || b.created_at || '';
      return db.localeCompare(da);
    });
    return sorted.slice(0, 4);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Projeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const KPI_CARDS = [
    { label: 'Aktif Projeler', value: inProgress.length.toString(), icon: HardHat, gradient: 'from-yellow-500/20 to-yellow-600/5', iconColor: 'text-yellow-500' },
    { label: 'Tamamlananlar', value: completed.length.toString(), icon: CheckCircle, gradient: 'from-green-500/20 to-green-600/5', iconColor: 'text-green-500' },
    { label: 'Riskli / Geciken', value: atRisk.toString(), icon: AlertTriangle, gradient: 'from-red-500/20 to-red-600/5', iconColor: 'text-red-400' },
    { label: 'Toplam Bütçe', value: formatBudget(totalBudget), icon: Wallet, gradient: 'from-accent/20 to-accent/5', iconColor: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-8">
        {/* Executive KPI Hero */}
        <section>
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-4">İlçe Yönetim Özeti</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KPI_CARDS.map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-xl border border-border/40 bg-gradient-to-br ${kpi.gradient} p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-foreground">{kpi.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground px-1">Öne Çıkanlar</h2>
          <div className="rounded-lg border border-border/40 overflow-hidden bg-card/30">
            {highlights.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/projeler')}
              className="gap-2 font-semibold"
            >
              Tüm Projeleri Gör
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MayorDashboard;
