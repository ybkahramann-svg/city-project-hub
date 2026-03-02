import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, FolderOpen, Newspaper, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Ana Sayfa', path: '/mayor' },
  { icon: FolderOpen, label: 'Projeler', path: '/projeler' },
  { icon: Map, label: 'Harita', path: '/harita' },
  { icon: Newspaper, label: 'Haberler', path: '/haberler' },
  { icon: Settings, label: 'Admin', path: '/admin' },
];

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)] z-50 block md:hidden">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.isCenter && location.pathname === item.path;

          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center -mt-4"
              >
                <span className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/30">
                  <Plus className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-medium text-accent mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 py-1 min-w-[56px]"
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
