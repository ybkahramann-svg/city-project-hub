import { useState } from 'react';
import { z } from 'zod';
import { MarketingLayout } from '@/components/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Mail, Phone, Building2 } from 'lucide-react';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Ad Soyad gereklidir').max(100),
  organization: z.string().trim().min(2, 'Kurum adı gereklidir').max(150),
  title: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email('Geçerli bir e-posta girin').max(255),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Mesaj en az 10 karakter olmalı').max(2000),
});

const initial = {
  full_name: '',
  organization: '',
  title: '',
  email: '',
  phone: '',
  message: '',
};

const IletisimPage = () => {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Form geçersiz');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('contact_requests').insert({
      full_name: parsed.data.full_name,
      organization: parsed.data.organization,
      title: parsed.data.title || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }
    setSent(true);
    setForm(initial);
  };

  return (
    <MarketingLayout>
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8">
          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs font-medium text-accent">
                İletişim
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Demo Talep Edin</h1>
              <p className="text-muted-foreground leading-relaxed">
                Kurumunuza özel bir sunum planlayalım. Formu doldurun, ekibimiz 1 iş günü içinde
                sizinle iletişime geçsin.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium">YBK Proje İnşaat Ltd. Şti.</p>
                  <p className="text-xs text-muted-foreground">Antalya, Türkiye</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <p className="text-sm text-muted-foreground">iletisim@ybkproje.com</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-0.5" />
                <p className="text-sm text-muted-foreground">+90 (242) 000 00 00</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="p-8 rounded-2xl border border-accent/40 bg-accent/5 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Teşekkürler!</h2>
                <p className="text-muted-foreground">
                  Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Yeni talep gönder
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-6 md:p-8 rounded-2xl border border-border/60 bg-card space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Ad Soyad *</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={handleChange('full_name')}
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="organization">Kurum / Kuruluş *</Label>
                    <Input
                      id="organization"
                      value={form.organization}
                      onChange={handleChange('organization')}
                      required
                      maxLength={150}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Görev / Unvan</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={handleChange('title')}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange('phone')}
                      maxLength={30}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Mesaj *</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={handleChange('message')}
                    required
                    maxLength={2000}
                    rows={5}
                    placeholder="Kurumunuz ve beklentileriniz hakkında kısa bilgi verin."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default IletisimPage;
