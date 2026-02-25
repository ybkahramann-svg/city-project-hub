import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import { updateProject, Project } from '@/lib/externalDb';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Pencil, Save, MapPin, Calendar, Building2, DollarSign,
  FileText, Hash, Globe, Layers, UploadCloud, ImagePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaGallery } from '@/components/MediaGallery';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CATEGORIES = [
  'Altyapı', 'Ulaşım', 'Park & Yeşil Alan', 'Eğitim', 'Sağlık',
  'Kültür & Sanat', 'Spor', 'Sosyal Hizmetler', 'Çevre', 'Kentsel Dönüşüm',
];
const DEPARTMENTS = [
  'Fen İşleri', 'Park ve Bahçeler', 'Yapı Kontrol', 'Temizlik İşleri',
  'Kültür ve Sosyal İşler', 'Destek Hizmetleri', 'İmar ve Şehircilik',
];
const DISTRICTS = ['Kepez', 'Muratpaşa', 'Konyaaltı', 'Aksu', 'Döşemealtı'];

const statusLabel: Record<string, string> = {
  'In Progress': 'Devam Ediyor',
  Completed: 'Tamamlandı',
  Planned: 'Planlandı',
};
const statusBadgeClass: Record<string, string> = {
  'In Progress': 'bg-accent/15 text-accent border-accent/30',
  Completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  Planned: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

interface FormState {
  title: string; description: string; category: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  budget: string; progress: string; department: string; district: string;
  neighborhood: string; latitude: string; longitude: string;
  detailed_address: string; image_url: string; manager_name: string; impact_stat: string;
}

const AdminProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects();

  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '', description: '', category: '', status: 'Planned',
    budget: '', progress: '0', department: '', district: '',
    neighborhood: '', latitude: '', longitude: '', detailed_address: '',
    image_url: '', manager_name: '', impact_stat: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mediaUploaderOpen, setMediaUploaderOpen] = useState(false);

  const openEdit = () => {
    if (!project) return;
    setForm({
      title: project.title || '',
      description: project.description || '',
      category: project.category || '',
      status: project.status,
      budget: String(project.budget || ''),
      progress: String(project.progress || 0),
      department: project.department || '',
      district: project.district || '',
      neighborhood: project.neighborhood || '',
      latitude: String(project.latitude || ''),
      longitude: String(project.longitude || ''),
      detailed_address: (project as any).detailed_address || '',
      image_url: project.image_url || '',
      manager_name: project.manager_name || '',
      impact_stat: project.impact_stat || '',
    });
    setSheetOpen(true);
  };

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Proje adı zorunludur'); return; }
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        status: form.status,
        budget: form.budget ? Number(form.budget) : null,
        progress: form.progress ? Number(form.progress) : 0,
        department: form.department || null,
        district: form.district || null,
        neighborhood: form.neighborhood || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        detailed_address: form.detailed_address.trim() || null,
        image_url: form.image_url || null,
        manager_name: form.manager_name || null,
        impact_stat: form.impact_stat || null,
      };
      await updateProject(id!, payload as any);
      toast.success('Proje güncellendi!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSheetOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return '—';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(budget);
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Proje bulunamadı.</p>
        <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Button>
      </div>
    );
  }

  const subLocations = project.sub_locations as { name: string; status: string; lat: number; lng: number }[] | null;

  const sectionClass = "rounded-xl border border-border/30 bg-card/50 p-5 space-y-3";
  const labelClass = "text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold";
  const valueClass = "text-sm text-foreground font-medium";

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b border-border/30 bg-card/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2 text-muted-foreground hover:text-foreground text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
            <div className="h-5 w-px bg-border/40" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/60 bg-secondary/40 px-2 py-0.5 rounded">
                  ID: {project.id.slice(0, 8)}…
                </span>
                <Badge variant="outline" className={cn('text-[10px] font-semibold border', statusBadgeClass[project.status])}>
                  {statusLabel[project.status]}
                </Badge>
              </div>
              <h1 className="text-lg font-bold text-foreground mt-1">{project.title}</h1>
            </div>
          </div>
          <Button
            onClick={openEdit}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-9 text-sm font-semibold shadow-lg shadow-accent/10"
          >
            <Pencil className="w-4 h-4" />
            Düzenle
          </Button>
        </div>
      </header>

      {/* ── Content Grid ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {/* Card 1: Kimlik & Sorumluluk */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Kimlik & Sorumluluk</h3>
            </div>
            <div className="space-y-3">
              <div><p className={labelClass}>Kategori</p><p className={valueClass}>{project.category || '—'}</p></div>
              <div><p className={labelClass}>Sorumlu Birim</p><p className={valueClass}>{project.department || '—'}</p></div>
              <div><p className={labelClass}>Yönetici</p><p className={valueClass}>{project.manager_name || '—'}</p></div>
              <div><p className={labelClass}>Oluşturulma Tarihi</p><p className={valueClass}>{formatDate(project.created_at)}</p></div>
              <div><p className={labelClass}>Planlanan Tarih</p><p className={valueClass}>{formatDate(project.start_date)}</p></div>
              <div><p className={labelClass}>Bitiş Tarihi</p><p className={valueClass}>{formatDate(project.end_date)}</p></div>
            </div>
          </div>

          {/* Card 2: Finans & İlerleme */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Finans & İlerleme</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className={labelClass}>Bütçe</p>
                <p className="text-xl font-bold text-foreground">{formatBudget(project.budget)}</p>
              </div>
              <div>
                <p className={labelClass}>İlerleme</p>
                <div className="flex items-center gap-3 mt-1">
                  <Progress value={project.progress || 0} className="flex-1 h-2.5" />
                  <span className="text-sm font-bold text-foreground min-w-[40px] text-right">{project.progress || 0}%</span>
                </div>
              </div>
              <div>
                <p className={labelClass}>Mevcut Durum</p>
                <Badge variant="outline" className={cn('text-xs font-semibold border mt-1', statusBadgeClass[project.status])}>
                  {statusLabel[project.status]}
                </Badge>
              </div>
              <div>
                <p className={labelClass}>Etki İstatistiği</p>
                <p className={valueClass}>{project.impact_stat || '—'}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Lokasyon & Adres */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Lokasyon & Adres</h3>
            </div>
            <div className="space-y-3">
              <div><p className={labelClass}>İlçe</p><p className={valueClass}>{project.district || '—'}</p></div>
              <div><p className={labelClass}>Mahalle</p><p className={valueClass}>{project.neighborhood || '—'}</p></div>
              <div>
                <p className={labelClass}>Koordinatlar</p>
                <p className="text-xs font-mono text-foreground/80 mt-0.5">
                  {project.latitude && project.longitude
                    ? `${project.latitude}, ${project.longitude}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className={labelClass}>Açık Adres</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{(project as any).detailed_address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Card 4: Açıklama */}
          <div className={cn(sectionClass, 'md:col-span-2')}>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Açıklama</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {project.description || 'Açıklama girilmemiş.'}
            </p>
          </div>

          {/* Card 5: Ağ Noktaları (sub_locations) */}
          {project.is_umbrella && subLocations && subLocations.length > 0 && (
            <div className={cn(sectionClass, 'xl:col-span-3')}>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Ağ Noktaları ({subLocations.length})
                </h3>
              </div>
              <div className="overflow-auto rounded-lg border border-border/20">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/20 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">#</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Nokta Adı</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Durum</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Enlem</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Boylam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subLocations.map((loc, i) => (
                      <TableRow key={i} className="border-border/10 hover:bg-secondary/20">
                        <TableCell className="text-xs font-mono text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="text-sm text-foreground">{loc.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{loc.status}</TableCell>
                        <TableCell className="text-xs font-mono text-foreground/70">{loc.lat}</TableCell>
                        <TableCell className="text-xs font-mono text-foreground/70">{loc.lng}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* ── Project Gallery ── */}
        <ErrorBoundary>
          <div className="max-w-7xl mx-auto mt-5">
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Proje Galerisi</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMediaUploaderOpen(true)}
                  className="gap-1.5 text-xs border-border/30 h-8"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Görsel Yükle
                </Button>
              </div>
              <MediaGallery projectId={id} />
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Media Uploader (project-context) */}
      <MediaUploader open={mediaUploaderOpen} onOpenChange={setMediaUploaderOpen} projectId={id} />

      {/* ── Edit Sheet (reused pattern) ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] bg-card border-border/30 overflow-y-auto scrollbar-hide p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border/20">
            <SheetTitle className="text-foreground text-lg">Projeyi Düzenle</SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">Proje bilgilerini güncelleyin</SheetDescription>
          </SheetHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Proje Adı *</Label>
              <Input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="ör. Yeni Kütüphane" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Açıklama</Label>
              <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Proje detayları..." rows={3} className="bg-secondary/30 border-border/20 rounded-lg resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Kategori</Label>
                <Select value={form.category} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Durum</Label>
                <Select value={form.status} onValueChange={v => updateField('status', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">
                    <SelectItem value="Planned">Planlandı</SelectItem>
                    <SelectItem value="In Progress">Devam Ediyor</SelectItem>
                    <SelectItem value="Completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Bütçe (₺)</Label>
                <Input value={form.budget} onChange={e => updateField('budget', e.target.value)} type="number" placeholder="500000" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">İlerleme (%)</Label>
                <Input value={form.progress} onChange={e => updateField('progress', e.target.value)} type="number" min="0" max="100" placeholder="0-100" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-border/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Konum & Yönetim</span>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Sorumlu Birim</Label>
                <Select value={form.department} onValueChange={v => updateField('department', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Yönetici Adı</Label>
                <Input value={form.manager_name} onChange={e => updateField('manager_name', e.target.value)} placeholder="ör. Ahmet Yılmaz" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">İlçe</Label>
                <Select value={form.district} onValueChange={v => updateField('district', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mahalle</Label>
                <Input value={form.neighborhood} onChange={e => updateField('neighborhood', e.target.value)} placeholder="ör. Varsak" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Enlem (Lat)</Label>
                <Input value={form.latitude} onChange={e => updateField('latitude', e.target.value)} type="number" step="any" placeholder="36.8841" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Boylam (Lng)</Label>
                <Input value={form.longitude} onChange={e => updateField('longitude', e.target.value)} type="number" step="any" placeholder="30.7133" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Açık Adres</Label>
              <Textarea value={form.detailed_address} onChange={e => updateField('detailed_address', e.target.value)} placeholder="Tam adres bilgisi..." rows={2} className="bg-secondary/30 border-border/20 rounded-lg resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Etki İstatistiği</Label>
              <Input value={form.impact_stat} onChange={e => updateField('impact_stat', e.target.value)} placeholder="ör. Günlük 5000 kişi" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Görsel URL</Label>
              <Input value={form.image_url} onChange={e => updateField('image_url', e.target.value)} type="url" placeholder="https://..." className="bg-secondary/30 border-border/20 rounded-lg h-10" />
            </div>
            <div className="flex items-center gap-3 pt-4 pb-2">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 gap-2 rounded-lg shadow-lg shadow-accent/15"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminProjectDetail;
