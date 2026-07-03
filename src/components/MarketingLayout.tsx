import { Link } from 'react-router-dom';
import { MarketingHeader } from './MarketingHeader';

export const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MarketingHeader />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="border-t border-border/60 py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} YBK Proje İnşaat Ltd. Şti. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link to="/biz-kimiz" className="hover:text-foreground">Biz Kimiz</Link>
            <Link to="/hizmetler" className="hover:text-foreground">Hizmetler</Link>
            <Link to="/iletisim" className="hover:text-foreground">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
