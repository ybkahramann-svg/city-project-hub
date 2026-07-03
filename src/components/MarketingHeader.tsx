import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Ana Sayfa', end: true },
  { to: '/biz-kimiz', label: 'Biz Kimiz' },
  { to: '/hizmetler', label: 'Hizmetler' },
  { to: '/iletisim', label: 'İletişim' },
];

export const MarketingHeader = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border/60 z-[9999]">
      <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-accent">
          <Building2 className="w-5 h-5" />
          <span className="tracking-wide">YBK Proje Platform</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/uygulama')}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Giriş Yap
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Menü"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-3 text-sm font-medium rounded-md',
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
