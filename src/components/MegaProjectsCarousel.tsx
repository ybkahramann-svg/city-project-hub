import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const MEGA_PROJECTS = [
  {
    id: 'mega-1',
    title: 'Kepez Bilim ve Teknoloji Vadisi',
    description: 'Antalya\'nın en büyük teknoloji ve inovasyon merkezi. 50.000 m² alan üzerine kurulacak.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    budget: '₺320M',
    status: 'Planlama Aşamasında',
  },
  {
    id: 'mega-2',
    title: 'Akdeniz Sahil Yürüyüş Yolu',
    description: '12 km uzunluğunda sahil bandı peyzaj ve yürüyüş parkuru projesi.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    budget: '₺180M',
    status: 'İhale Sürecinde',
  },
  {
    id: 'mega-3',
    title: 'Kepez Entegre Sağlık Kampüsü',
    description: 'Modern hastane, rehabilitasyon merkezi ve sağlıklı yaşam parkı.',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop',
    budget: '₺450M',
    status: 'Tasarım Aşamasında',
  },
  {
    id: 'mega-4',
    title: 'Yeşil Ulaşım Ağı',
    description: 'Elektrikli otobüs hatları ve bisiklet yolları entegrasyonu.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    budget: '₺95M',
    status: 'Devam Ediyor',
  },
];

export const MegaProjectsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-foreground">Vizyon Projeleri</h2>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => scroll('left')} className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll('right')} className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-2"
      >
        {MEGA_PROJECTS.map((project) => (
          <div
            key={project.id}
            className="snap-start flex-shrink-0 w-[300px] md:w-[340px] rounded-xl border border-border/40 overflow-hidden bg-card group cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/projeler')}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-block px-2 py-0.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-semibold">
                  {project.status}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-bold backdrop-blur-sm">
                  {project.budget}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
