import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Share2, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/MarketingLayout';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Harita üzerinde proje takibi',
    desc: 'Tüm projelerinizi coğrafi konumlarıyla birlikte tek harita üzerinden görüntüleyin ve yönetin.',
  },
  {
    icon: ShieldCheck,
    title: 'Kurumlar arası izole erişim',
    desc: 'Her kurum yalnızca kendi verisine erişir. Çok kiracılı mimari ile tam veri izolasyonu.',
  },
  {
    icon: Share2,
    title: 'Kontrollü paylaşım',
    desc: 'Bakanlık, milletvekili veya taşeronlara zaman sınırlı, geri alınabilir okuma yetkisi verin.',
  },
  {
    icon: Activity,
    title: 'Gerçek zamanlı ilerleme',
    desc: 'İlerleme, bütçe ve saha notları anlık güncellenir. Karar vericiler her an güncel veriye ulaşır.',
  },
];

const MarketingHome = () => {
  const navigate = useNavigate();

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-4 py-20 md:py-32 border-b border-border/60">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs font-medium text-accent">
            Kurumsal Proje Takip Platformu
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Belediyeler, Bakanlıklar ve Kurumlar için{' '}
            <span className="text-accent">Şeffaf Proje Takip Platformu</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Yürüttüğünüz projeleri tek ekrandan yönetin, ilerlemesini izleyin ve dilediğiniz kuruma —
            bakanlığa, milletvekiline, taşerona — güvenli ve kontrollü şekilde paylaşın.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/iletisim')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Demo Talep Et <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/hizmetler')}>
              Hizmetleri İncele
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Neden bu platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kurum içi şeffaflık ile paylaşımlı iş birliğini tek bir çözümde birleştirir.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-border/60 bg-card hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-2xl border border-accent/30 bg-accent/5 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Kurumunuza özel demo hazırlayalım</h2>
          <p className="text-muted-foreground">
            Ekibinizin ihtiyaçlarına göre yapılandırılmış bir sunum planlayalım.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/iletisim')}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Demo Talep Et
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default MarketingHome;
