import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, FolderOpen, Newspaper, HeartHandshake, MoreHorizontal, Settings, X } from 'lucide-react';
import { useState } from 'react';

const PRIMARY_ITEMS = [
  { icon: Home, label: 'Ana Sayfa', path: '/mayor' },
  { icon: FolderOpen, label: 'Projeler', path: '/projeler' },
  { icon: Map, label: 'Harita', path: '/harita' },
  { icon: HeartHandshake, label: 'Hizmetler', path: '/hizmetler' },
];

const MORE_ITEMS = [
  { icon: Newspaper, label: 'Haberler', path: '/haberler' },
  { icon: Settings, label: 'Admin', path: '/admin' },
];

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some((i) => location.pathname === i.path);

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-[60px] right-4 bg-card border border-border/60 rounded-xl shadow-xl p-2 space-y-1 min-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setMoreOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-accent bg-accent/10' : 'text-foreground hover:bg-muted/60'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)] z-[100] block md:hidden">
        <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
          {PRIMARY_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]"
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]"
          >
            {moreOpen ? (
              <X className="w-5 h-5 text-accent" />
            ) : (
              <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'text-accent' : 'text-muted-foreground'}`} />
            )}
            <span className={`text-[10px] font-medium ${moreOpen || isMoreActive ? 'text-accent' : 'text-muted-foreground'}`}>
              Daha Fazla
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
