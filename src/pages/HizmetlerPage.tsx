import { useState, useMemo } from 'react';
import { Milk, GraduationCap, Music, HeartHandshake, Stethoscope, Baby, BookOpen, Palette } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ServiceCard, type ServiceData } from '@/components/ServiceCard';

const FILTER_TABS = [
  { key: 'all', label: 'Tümü' },
  { key: 'sosyal', label: 'Sosyal Yardım' },
  { key: 'kultur', label: 'Kültür & Sanat' },
  { key: 'egitim', label: 'Eğitim' },
] as const;

const MOCK_SERVICES: ServiceData[] = [
  {
    id: '1', title: 'Halk Süt Dağıtımı', category: 'sosyal', status: 'ongoing',
    icon: Milk, metricIcon: 'users', metricText: '15.000 Çocuğa Ulaşıldı',
    description: 'İlçedeki 0-6 yaş grubundaki çocuklara ücretsiz günlük süt dağıtımı programı.',
  },
  {
    id: '2', title: 'Üniversite Destek Bursu', category: 'egitim', status: 'ongoing',
    icon: GraduationCap, metricIcon: 'money', metricText: 'Aylık 2.500 TL Destek',
    description: 'Başarılı üniversite öğrencilerine aylık burs desteği ve kitap yardımı.',
  },
  {
    id: '3', title: 'Bahar Festivali 2026', category: 'kultur', status: 'upcoming',
    icon: Music, metricIcon: 'calendar', metricText: '15 Mayıs 2026',
    description: 'Açık hava konserleri, yerel sanatçı sergileri ve sokak lezzetleri festivali.',
  },
  {
    id: '4', title: 'Yaşlı Evde Bakım Hizmeti', category: 'sosyal', status: 'ongoing',
    icon: HeartHandshake, metricIcon: 'users', metricText: '2.300 Hane Destekleniyor',
    description: '65 yaş üstü yalnız yaşayan vatandaşlara evde bakım ve temizlik desteği.',
  },
  {
    id: '5', title: 'Ücretsiz Sağlık Taraması', category: 'sosyal', status: 'upcoming',
    icon: Stethoscope, metricIcon: 'calendar', metricText: '1-10 Nisan 2026',
    description: 'Mahalle bazlı mobil sağlık birimleriyle ücretsiz göz ve diş taraması.',
  },
  {
    id: '6', title: 'Anne-Bebek Destek Paketi', category: 'sosyal', status: 'ongoing',
    icon: Baby, metricIcon: 'users', metricText: '8.400 Aileye Ulaşıldı',
    description: 'Yeni doğan bebeklere hoş geldin paketi ve anneye psikolojik danışmanlık.',
  },
  {
    id: '7', title: 'Halk Kütüphanesi Etkinlikleri', category: 'egitim', status: 'ongoing',
    icon: BookOpen, metricIcon: 'users', metricText: 'Haftalık 500+ Katılımcı',
    description: 'Çocuk okuma saatleri, yazar söyleşileri ve dijital okuryazarlık atölyeleri.',
  },
  {
    id: '8', title: 'Yaz Sanat Atölyeleri', category: 'kultur', status: 'upcoming',
    icon: Palette, metricIcon: 'calendar', metricText: '1 Haziran - 31 Ağustos',
    description: 'Resim, seramik, müzik ve tiyatro dallarında ücretsiz yaz atölyeleri.',
  },
];

const HizmetlerPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = useMemo(
    () => activeFilter === 'all' ? MOCK_SERVICES : MOCK_SERVICES.filter((s) => s.category === activeFilter),
    [activeFilter]
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Sosyal Hizmetler & Etkinlikler</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                activeFilter === tab.key
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-card text-muted-foreground border-border/50 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default HizmetlerPage;
