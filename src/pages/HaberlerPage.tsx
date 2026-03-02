import { Newspaper, ExternalLink, Calendar, TrendingUp, Gavel, Clock } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const NEWS_ITEMS = [
  { id: 1, title: 'Kepez\'e 3 yeni kültür merkezi kazandırılıyor', summary: 'Belediye başkanı, 2026 yılı vizyon projelerini açıkladı. Kültür ve sanat alanında büyük yatırımlar planlanıyor.', date: '2026-03-01', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop', source: 'Antalya Haber' },
  { id: 2, title: 'Dijital belediyecilik dönüşümü başladı', summary: 'Tüm belediye hizmetleri mobil uygulama üzerinden sunulacak. Vatandaşlar artık sıra beklemeyecek.', date: '2026-02-27', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop', source: 'Kepez Bülten' },
  { id: 3, title: 'Varsak\'ta yeni park alanı hizmete açıldı', summary: '15.000 m² yeşil alan vatandaşların kullanımına sunuldu. Çocuk oyun alanları ve spor sahaları mevcut.', date: '2026-02-22', image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=400&h=250&fit=crop', source: 'Belediye Basın' },
  { id: 4, title: 'Altyapı yatırımlarında rekor bütçe', summary: '2026 yılında altyapıya 250 milyon TL ayrıldı. Su, kanalizasyon ve yol çalışmaları hız kazanacak.', date: '2026-02-18', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop', source: 'Antalya Ekonomi' },
  { id: 5, title: 'Kepez Belediyesi\'nden eğitime destek', summary: 'Okul öncesi eğitim kurumlarına 5 milyon TL\'lik malzeme desteği sağlandı.', date: '2026-02-14', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop', source: 'Eğitim Gazetesi' },
  { id: 6, title: 'Yeni bisiklet yolları projesi onaylandı', summary: '25 km bisiklet yolu ile Kepez daha yaşanabilir bir ilçe olacak.', date: '2026-02-10', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop', source: 'Kepez Bülten' },
];

const TENDERS = [
  { id: 1, title: 'Kepez Spor Kompleksi İnşaatı', date: '2026-03-18', budget: 45_000_000, type: 'upcoming' as const },
  { id: 2, title: 'Akdeniz Bulvarı Yol Yenileme', date: '2026-03-25', budget: 12_500_000, type: 'upcoming' as const },
  { id: 3, title: 'Okul Onarım Paketi (12 Okul)', date: '2026-02-20', budget: 8_700_000, type: 'concluded' as const, winner: 'Yılmaz İnşaat A.Ş.' },
  { id: 4, title: 'Dijital Belediye Altyapısı', date: '2026-02-15', budget: 2_100_000, type: 'concluded' as const, winner: 'TeknoSoft Ltd.' },
];

const formatDate = (d: string) => {
  const date = new Date(d);
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatCurrency = (v: number) => `${v.toLocaleString('tr-TR')} TL`;

const HaberlerPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-10">
        {/* News Section */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Newspaper className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Basın ve Haberler</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {NEWS_ITEMS.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/40 overflow-hidden bg-card group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative h-40 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-semibold">{item.source}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.summary}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tenders Section */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Gavel className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold text-foreground">İhale Duyuruları</h1>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            {TENDERS.map((t, i) => (
              <div key={t.id} className={`px-4 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors ${i < TENDERS.length - 1 ? 'border-b border-border/30' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === 'upcoming' ? 'bg-accent/10' : 'bg-green-500/10'}`}>
                  {t.type === 'upcoming' ? <Clock className="w-4.5 h-4.5 text-accent" /> : <TrendingUp className="w-4.5 h-4.5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.type === 'upcoming' ? 'Yaklaşan İhale' : `Kazanan: ${t.winner}`} · {formatDate(t.date)}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground flex-shrink-0">{formatCurrency(t.budget)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default HaberlerPage;
