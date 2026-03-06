import { Calendar, TrendingUp, Gavel, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UPCOMING_TENDERS = [
  { id: 1, title: 'Kepez Spor Kompleksi İnşaatı', date: '2026-03-18', budget: 45_000_000, department: 'Fen İşleri' },
  { id: 2, title: 'Akdeniz Bulvarı Yol Yenileme', date: '2026-03-25', budget: 12_500_000, department: 'Altyapı' },
  { id: 3, title: 'Varsak Mahallesi Park Düzenlemesi', date: '2026-04-02', budget: 3_200_000, department: 'Park ve Bahçeler' },
];

const CONCLUDED_TENDERS = [
  { id: 4, title: 'Okul Onarım Paketi (12 Okul)', date: '2026-02-20', budget: 8_700_000, winner: 'Yılmaz İnşaat A.Ş.', savings: 12 },
  { id: 5, title: 'Dijital Belediye Altyapısı', date: '2026-02-15', budget: 2_100_000, winner: 'TeknoSoft Ltd.', savings: 8 },
];

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`;
  return `₺${v}`;
};

const formatDate = (d: string) => {
  const date = new Date(d);
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const TendersList = () => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <Link to="/ihaleler" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Gavel className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">İhaleler</h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
        {/* Upcoming */}
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Yaklaşan İhaleler</span>
        </div>
        <div className="divide-y divide-border/30">
          {UPCOMING_TENDERS.map((t) => (
            <Link key={t.id} to="/ihaleler" className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 transition-colors cursor-pointer block">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.department}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{formatCurrency(t.budget)}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" /> {formatDate(t.date)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Concluded */}
        <div className="px-4 pt-4 pb-1 border-t border-border/40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sonuçlanan İhaleler</span>
        </div>
        <div className="divide-y divide-border/30">
          {CONCLUDED_TENDERS.map((t) => (
            <Link key={t.id} to="/ihaleler" className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5 transition-colors cursor-pointer block">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.winner} · %{t.savings} tasarruf</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{formatCurrency(t.budget)}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(t.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
