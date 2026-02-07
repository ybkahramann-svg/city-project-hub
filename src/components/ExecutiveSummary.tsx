import { HardHat, CheckCircle, TrendingUp } from 'lucide-react';
import { Project } from '@/lib/externalDb';

interface ExecutiveSummaryProps {
  projects: Project[];
}

const formatBudget = (total: number): string => {
  if (total >= 1_000_000_000) return `₺${(total / 1_000_000_000).toFixed(1)}B`;
  if (total >= 1_000_000) return `₺${(total / 1_000_000).toFixed(0)}M`;
  if (total >= 1_000) return `₺${(total / 1_000).toFixed(0)}K`;
  return `₺${total.toFixed(0)}`;
};

export const ExecutiveSummary = ({ projects }: ExecutiveSummaryProps) => {
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const activeSites = projects.filter((p) => p.status === 'In Progress').length;
  const completedWorks = projects.filter((p) => p.status === 'Completed').length;

  const cards = [
    {
      label: 'TOTAL INVESTMENT',
      value: formatBudget(totalBudget),
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: 'ACTIVE SITES',
      value: activeSites.toString(),
      icon: HardHat,
      highlight: false,
    },
    {
      label: 'COMPLETED WORKS',
      value: completedWorks.toString(),
      icon: CheckCircle,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-xl p-5 flex items-center gap-4"
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
            <card.icon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p
              className={`text-2xl font-bold tracking-tight ${
                card.highlight ? 'text-accent' : 'text-foreground'
              }`}
            >
              {card.value}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
          </div>
          {/* Glossy sheen */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.04] to-transparent" />
        </div>
      ))}
    </div>
  );
};
