import { Milk, GraduationCap, Music, HeartHandshake, Calendar, Users, Banknote, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ServiceData {
  id: string;
  title: string;
  category: 'sosyal' | 'kultur' | 'egitim';
  status: 'ongoing' | 'upcoming';
  metricIcon: string;
  metricText: string;
  description: string;
  icon: LucideIcon;
  imageUrl?: string;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ongoing: { label: 'Devam Ediyor', className: 'bg-green-500/15 text-green-600 border-green-500/30' },
  upcoming: { label: 'Yaklaşıyor', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
};

const METRIC_ICONS: Record<string, string> = {
  users: '👥',
  money: '💰',
  calendar: '📅',
  heart: '❤️',
};

export const ServiceCard = ({ service }: { service: ServiceData }) => {
  const status = STATUS_MAP[service.status];
  const Icon = service.icon;

  return (
    <div className="rounded-xl border border-border/50 bg-card hover:shadow-md transition-shadow p-4 flex gap-4 items-start">
      {/* Icon / Image */}
      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-accent" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight">{service.title}</h3>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${status.className}`}>
            {status.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
        <div className="pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted/60 rounded-md px-2 py-1">
            <span>{METRIC_ICONS[service.metricIcon] || '📊'}</span>
            {service.metricText}
          </span>
        </div>
      </div>
    </div>
  );
};
