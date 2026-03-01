import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutList, Plus, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Ana Sayfa', path: '/mayor' },
  { icon: LayoutList, label: 'Projeler', path: '/mayor', action: 'categories' },
  { icon: Plus, label: 'Ekle', path: '/admin', isCenter: true },
  { icon: Settings, label: 'Admin', path: '/admin' },
];

interface MobileBottomNavProps {
  onNavigateCategories?: () => void;
}

export const MobileBottomNav = ({ onNavigateCategories }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTap = (item: typeof NAV_ITEMS[0]) => {
    if (item.action === 'categories' && onNavigateCategories) {
      onNavigateCategories();
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)] z-50 block md:hidden">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.action && !item.isCenter && location.pathname === item.path;

          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => handleTap(item)}
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
              onClick={() => handleTap(item)}
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
