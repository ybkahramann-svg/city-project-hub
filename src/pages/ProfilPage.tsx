import { User, Moon, Sun, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useEffect, useState } from 'react';

const ProfilPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark((v) => !v);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Avatar & Info */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center">
            <User className="w-10 h-10 text-accent" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground">Mesut Kocagöz</h1>
            <p className="text-sm text-muted-foreground">Belediye Başkanı</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            Tema Değiştir
            <span className="ml-auto text-xs text-muted-foreground">
              {isDark ? 'Koyu' : 'Açık'}
            </span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <Lock className="w-5 h-5" />
            Şifre Değiştir
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </Button>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default ProfilPage;
