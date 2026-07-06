import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function safeNext(next: string | null): string {
  if (!next) return '/admin';
  if (!next.startsWith('/') || next.startsWith('//')) return '/admin';
  return next;
}

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast({
        title: 'Giriş başarısız',
        description: 'E-posta veya şifre hatalı.',
        variant: 'destructive',
      });
      return;
    }

    navigate(next);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
            <Landmark className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Yönetici Girişi</h1>
          <p className="text-sm text-muted-foreground">Devam etmek için giriş yapın</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-border/40 bg-card/50 p-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
