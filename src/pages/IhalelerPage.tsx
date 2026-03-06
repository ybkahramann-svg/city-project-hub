import { Calendar, TrendingUp, Gavel, Clock, Building2 } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const UPCOMING_TENDERS = [
  { id: 1, title: 'Kepez Spor Kompleksi İnşaatı', date: '2026-03-18', budget: 45_000_000, department: 'Fen İşleri', description: 'Kepez ilçesine modern bir spor kompleksi inşa edilecektir. Proje kapsamında yüzme havuzu, kapalı spor salonu ve açık saha tesisleri yer almaktadır.' },
  { id: 2, title: 'Akdeniz Bulvarı Yol Yenileme', date: '2026-03-25', budget: 12_500_000, department: 'Altyapı', description: 'Akdeniz Bulvarı üzerindeki 4.2 km\'lik yol kesiminin asfalt yenileme ve kaldırım düzenleme çalışması.' },
  { id: 3, title: 'Varsak Mahallesi Park Düzenlemesi', date: '2026-04-02', budget: 3_200_000, department: 'Park ve Bahçeler', description: '15.000 m² alan üzerine çocuk oyun alanı, yürüyüş parkuru ve peyzaj düzenlemesi.' },
  { id: 4, title: 'Güneş Enerji Santrali Kurulumu', date: '2026-04-10', budget: 8_900_000, department: 'Enerji', description: 'Belediye binalarının enerji ihtiyacını karşılamak üzere güneş enerji santrali kurulumu.' },
];

const CONCLUDED_TENDERS = [
  { id: 5, title: 'Okul Onarım Paketi (12 Okul)', date: '2026-02-20', budget: 8_700_000, winner: 'Yılmaz İnşaat A.Ş.', savings: 12, description: '12 okulda dış cephe, çatı ve iç mekan onarım çalışmaları tamamlanmıştır.' },
  { id: 6, title: 'Dijital Belediye Altyapısı', date: '2026-02-15', budget: 2_100_000, winner: 'TeknoSoft Ltd.', savings: 8, description: 'E-belediye portalı, mobil uygulama ve dijital arşiv sistemi kurulumu.' },
  { id: 7, title: 'Kent Mobilyaları Tedarik İhalesi', date: '2026-02-05', budget: 1_450_000, winner: 'Akdeniz Mobilya San.', savings: 15, description: 'İlçe genelinde bank, çöp kutusu ve aydınlatma direği tedarik ve montajı.' },
];

const formatCurrency = (v: number) => `₺${(v / 1_000_000).toFixed(1)}M`;

const formatDate = (d: string) => {
  const date = new Date(d);
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function IhalelerPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="max-w-[1000px] mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gavel className="w-5 h-5 text-accent" />
            İhaleler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Kepez Belediyesi ihale takip sistemi</p>
        </div>

        {/* Upcoming */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Yaklaşan İhaleler</h2>
          <div className="space-y-3">
            {UPCOMING_TENDERS.map((t) => (
              <div key={t.id} className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-base font-bold text-foreground">{formatCurrency(t.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{t.department}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(t.date)}</span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-semibold">
                    <Clock className="w-3 h-3" /> Yaklaşan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Concluded */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sonuçlanan İhaleler</h2>
          <div className="space-y-3">
            {CONCLUDED_TENDERS.map((t) => (
              <div key={t.id} className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-base font-bold text-foreground">{formatCurrency(t.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{t.winner}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" />%{t.savings} tasarruf</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(t.date)}</span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-semibold">
                    Tamamlandı
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
}
