import { Newspaper, ExternalLink, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Kepez\'e 3 yeni kültür merkezi kazandırılıyor',
    summary: 'Belediye başkanı, 2026 yılı vizyon projelerini açıkladı.',
    date: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&h=80&fit=crop',
    source: 'Antalya Haber',
  },
  {
    id: 2,
    title: 'Dijital belediyecilik dönüşümü başladı',
    summary: 'Tüm hizmetler mobil uygulama üzerinden sunulacak.',
    date: '2026-02-27',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&h=80&fit=crop',
    source: 'Kepez Bülten',
  },
  {
    id: 3,
    title: 'Varsak\'ta yeni park alanı hizmete açıldı',
    summary: '15.000 m² yeşil alan vatandaşların kullanımına sunuldu.',
    date: '2026-02-22',
    image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=120&h=80&fit=crop',
    source: 'Belediye Basın',
  },
  {
    id: 4,
    title: 'Altyapı yatırımlarında rekor bütçe',
    summary: '2026 yılında altyapıya 250 milyon TL ayrıldı.',
    date: '2026-02-18',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=80&fit=crop',
    source: 'Antalya Ekonomi',
  },
];

const formatDate = (d: string) => {
  const date = new Date(d);
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const NewsFeed = () => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Basın ve Haberler</h3>
        </div>
        <Link to="/haberler" className="text-[11px] text-muted-foreground hover:text-accent transition-colors flex items-center gap-0.5 font-medium">
          Tümünü Gör <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
        <div className="divide-y divide-border/30">
          {NEWS_ITEMS.map((item) => (
            <Link key={item.id} to="/haberler" className="px-4 py-3 flex gap-3 hover:bg-accent/5 transition-colors cursor-pointer group block">
              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{item.source}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(item.date)}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
