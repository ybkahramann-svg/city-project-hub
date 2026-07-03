import { MarketingLayout } from '@/components/MarketingLayout';
import { FolderKanban, Building2, Share2, Lock, Check } from 'lucide-react';

const SECTIONS = [
  {
    icon: FolderKanban,
    title: 'Proje Yönetimi',
    desc: 'Tek ekrandan tüm projelerinizi yönetin.',
    items: [
      'Harita ve liste görünümü ile proje takibi',
      'İlerleme yüzdesi, bütçe ve durum güncellemeleri',
      'Kategori, ilçe ve durum bazlı filtreleme',
      'Gerçek zamanlı fotoğraf ve saha notu ekleme',
      'Proje bazlı bütçe ve gider takibi',
    ],
  },
  {
    icon: Building2,
    title: 'Çoklu Kurum Desteği',
    desc: 'Belediye, bakanlık, milletvekili ofisi ve taşeron — hepsi tek platformda.',
    items: [
      'Çok kiracılı (multi-tenant) mimari',
      'Her kurum yalnızca kendi verisine erişir',
      'Belediye, bakanlık, taşeron, milletvekili ofisi rolleri',
      'Kurum bazlı özelleştirilebilir dashboard',
      'Kurumlar arası veri karışması imkansız',
    ],
  },
  {
    icon: Share2,
    title: 'Paylaşım ve Yetkilendirme',
    desc: 'Doğru veriyi, doğru kişiye, doğru sürede paylaşın.',
    items: [
      'Proje bazlı veya kurum bazlı paylaşım',
      'Zaman sınırlı erişim (belirli bir tarihte sona erer)',
      'Tek tıkla geri alınabilir yetkiler',
      'Yalnızca okuma yetkisi ile güvenli paylaşım',
      'Kime, ne zaman, neyi paylaştığınızın kaydı',
    ],
  },
  {
    icon: Lock,
    title: 'Güvenlik',
    desc: 'Kamu verisi güvende — kurumsal seviye altyapı.',
    items: [
      'Satır seviyesinde güvenlik politikaları (RLS)',
      'Rol tabanlı yetki yönetimi (admin, editör, izleyici)',
      'Şifreli veri iletimi (TLS) ve dinlenme',
      'Denetim izleri: kim, ne zaman, neyi değiştirdi',
      'Yedekleme ve olağanüstü durum kurtarma',
    ],
  },
];

const HizmetlerMarketingPage = () => {
  return (
    <MarketingLayout>
      <section className="px-4 py-16 md:py-20 border-b border-border/60">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs font-medium text-accent">
            Hizmetler
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Kurumsal proje takibi için tam donanım
          </h1>
          <p className="text-lg text-muted-foreground">
            Sahadan raporlamaya, çoklu kurum yönetiminden güvenli paylaşıma kadar tek platformda.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {SECTIONS.map((s) => (
            <div key={s.title} className="p-6 md:p-8 rounded-2xl border border-border/60 bg-card">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <s.icon className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
              <ul className="space-y-2">
                {s.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default HizmetlerMarketingPage;
