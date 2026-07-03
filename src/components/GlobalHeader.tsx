import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, Map, Newspaper, HeartHandshake, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUB_PAGES = ['/admin/project/', '/project/'];
const MARKETING_ROUTES = ['/', '/biz-kimiz', '/hizmetler', '/iletisim'];

export const GlobalHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (MARKETING_ROUTES.includes(location.pathname)) return null;

  const isSubPage = SUB_PAGES.some((p) => location.pathname.startsWith(p));

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-md border-b border-border/60 z-[9999] flex items-center px-4 md:px-6">
      <div className="flex items-center justify-between max-w-[1440px] w-full mx-auto">
        {/* Left: Back + Brand */}
        <div className="flex items-center gap-3">
          {isSubPage && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors flex-shrink-0"
              aria-label="Geri"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-accent hover:opacity-80 transition-opacity"
          >
            <Landmark className="w-5 h-5" />
            <span className="tracking-wide">Kepez Belediyesi</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/projeler')}
              className={`text-muted-foreground hover:text-foreground ${location.pathname === '/projeler' ? 'text-accent' : ''}`}>
              Projeler
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/harita')}
              className={`gap-1.5 text-muted-foreground hover:text-foreground ${location.pathname === '/harita' ? 'text-accent' : ''}`}>
              <Map className="w-4 h-4" /> Harita
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/haberler')}
              className={`gap-1.5 text-muted-foreground hover:text-foreground ${location.pathname === '/haberler' ? 'text-accent' : ''}`}>
              <Newspaper className="w-4 h-4" /> Haberler
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hizmetler')}
              className={`gap-1.5 text-muted-foreground hover:text-foreground ${location.pathname === '/hizmetler' ? 'text-accent' : ''}`}>
              <HeartHandshake className="w-4 h-4" /> Hizmetler
            </Button>
          </div>

          {/* Notification bell (always visible) */}
          <button
            className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Bildirimler"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Desktop profile button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profil')}
            className="hidden md:flex gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <User className="w-4 h-4" />
            Profil
          </Button>
        </div>
      </div>
    </header>
  );
};
