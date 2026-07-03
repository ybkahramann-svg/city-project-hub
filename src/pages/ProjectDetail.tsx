import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowLeft,
  MapPin,
  LayoutDashboard,
  Map,
  FileText,
  Navigation,
  Send,
  DollarSign,
  Building2,
  User,
  CalendarDays,
  Users,
  ShieldCheck,
  MessageSquare,
  ImageIcon,
  TrendingUp,
  Phone,
  Mail,
  MessageCircle,
  Network,
  CheckCircle2,
} from 'lucide-react';
import { format, differenceInDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { toast } from 'sonner';
import { ProjectImage } from '@/components/ProjectImage';
import { GalleryLightbox } from '@/components/GalleryLightbox';
import L from 'leaflet';

type Tab = 'overview' | 'map' | 'gallery';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'map', label: 'Konum', icon: Map },
  { id: 'gallery', label: 'Galeri', icon: ImageIcon },
];

interface ProjectNote {
  id: string;
  project_id: string;
  text: string;
  author: string;
  created_at: string;
}

interface GalleryImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const project = projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  // Fetch notes
  useEffect(() => {
    if (!id) return;
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (!error && data) setNotes(data);
    };
    fetchNotes();
    const channel = supabase
      .channel(`notes-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_notes', filter: `project_id=eq.${id}` }, () => { fetchNotes(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Fetch gallery
  useEffect(() => {
    if (!id) return;
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('project_gallery')
        .select('*')
        .eq('project_id', id)
        .order('sort_order', { ascending: true });
      if (!error && data) setGalleryImages(data);
    };
    fetchGallery();
  }, [id]);

  const handleSendNote = async () => {
    if (!noteText.trim() || !id) return;
    setIsSendingNote(true);
    try {
      const { error } = await supabase
        .from('project_notes')
        .insert({ project_id: id, text: noteText.trim(), author: 'Başkan' });
      if (error) throw error;
      setNoteText('');
      toast.success('Talimat gönderildi.');
    } catch (err) {
      console.error('Note save error:', err);
      toast.error('Talimat gönderilemedi.');
    } finally {
      setIsSendingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-3xl">🚫</p>
          <h2 className="text-xl font-bold text-foreground">Proje bulunamadı</h2>
          <Button onClick={() => navigate('/mayor')} variant="outline" className="gap-2 border-border/50 hover:border-accent/50 hover:text-accent">
            <ArrowLeft className="w-4 h-4" /> Panele Dön
          </Button>
        </div>
      </div>
    );
  }

  // Computed values
  const statusColorMap: Record<string, string> = {
    'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
    'In Progress': 'bg-accent/20 text-accent border-accent/30',
    'Planned': 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  };
  const statusPulseMap: Record<string, string> = {
    'In Progress': 'bg-accent',
    'Completed': 'bg-green-400',
    'Planned': 'bg-blue-400',
  };

  let daysRemaining: number | null = null;
  let timelineProgress = 0;
  if (project.start_date && project.end_date) {
    try {
      const start = parseISO(project.start_date);
      const end = parseISO(project.end_date);
      const now = new Date();
      const totalDays = differenceInCalendarDays(end, start);
      const elapsed = differenceInCalendarDays(now, start);
      daysRemaining = differenceInDays(end, now);
      timelineProgress = totalDays > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100))) : 0;
    } catch { /* ignore */ }
  } else if (project.end_date) {
    try { daysRemaining = differenceInDays(parseISO(project.end_date), new Date()); } catch { /* ignore */ }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try { return format(parseISO(dateStr), 'dd.MM.yyyy'); } catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Cinematic blurred background */}
      {project.image_url && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${project.image_url}')`, filter: 'blur(60px) brightness(0.2) saturate(1.4)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </>
      )}

      <div className="relative z-10 min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/20">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <Button onClick={() => navigate('/mayor')} variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-accent">
              <ArrowLeft className="w-4 h-4" /> Panele Dön
            </Button>
            <div className="flex items-center gap-3">
              {project.status === 'Completed' ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {project.completion_date ? (() => {
                      try {
                        const d = new Date(project.completion_date);
                        const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
                        return `${months[d.getMonth()]} ${d.getFullYear()}`;
                      } catch { return 'Tamamlandı'; }
                    })() : 'Tamamlandı'}
                  </span>
                </div>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full ${statusPulseMap[project.status] || 'bg-muted-foreground'} animate-pulse`} />
                  <Badge className={`text-xs font-semibold ${statusColorMap[project.status] || 'bg-muted/20 text-muted-foreground border-muted/30'}`}>
                    {project.status === 'In Progress' ? 'Devam Ediyor' : project.status === 'Planned' ? 'Planlanıyor' : project.status}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ═══ CINEMATIC HERO with KPI overlay ═══ */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-6">
          {/* Hero Image with Title Overlay */}
          <div className="relative rounded-2xl overflow-hidden border border-border/20 aspect-[21/9] bg-secondary/30 group">
            <ProjectImage
              src={project.image_url}
              alt={project.title}
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className="absolute bottom-0 inset-x-0 p-6 lg:p-8 space-y-2">
              <div className="flex items-center gap-3 mb-1">
                {project.category && (
                  <Badge className="bg-accent/15 text-accent border-accent/20 text-xs tracking-wider uppercase backdrop-blur-sm">
                    {project.category}
                  </Badge>
                )}
                {project.status === 'Completed' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/40 backdrop-blur-sm border border-border/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {project.completion_date ? (() => {
                        try {
                          const d = new Date(project.completion_date);
                          const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
                          return `${months[d.getMonth()]} ${d.getFullYear()}`;
                        } catch { return 'Tamamlandı'; }
                      })() : 'Tamamlandı'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/40 backdrop-blur-sm border border-border/20">
                    <div className={`w-2 h-2 rounded-full ${statusPulseMap[project.status] || 'bg-muted-foreground'} animate-pulse`} style={{ boxShadow: project.status === 'In Progress' ? '0 0 8px hsl(var(--accent))' : undefined }} />
                    <span className="text-[10px] font-semibold text-foreground tracking-wide">{project.status === 'In Progress' ? 'DEVAM EDİYOR' : 'PLANLANMIŞ'}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight tracking-tight drop-shadow-lg">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-sm drop-shadow-md">{[project.district, project.neighborhood].filter(Boolean).join(' • ') || 'Konum belirtilmemiş'}</span>
              </div>
            </div>
          </div>

          {/* ═══ KPI CARDS (glassmorphism, overlapping hero) ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-6 relative z-10 px-2 lg:px-4">
            {/* Timeline */}
            <div className="rounded-xl border border-border/30 bg-card/70 backdrop-blur-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Zaman Çizelgesi</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatDate(project.start_date)}</span>
                  <span>{formatDate(project.end_date)}</span>
                </div>
                <div className="relative">
                  <Progress value={timelineProgress} className="h-1.5" />
                  {timelineProgress > 0 && timelineProgress < 100 && (
                    <div className="absolute top-0 h-1.5 flex items-center" style={{ left: `${timelineProgress}%` }}>
                      <div className="w-1.5 h-3 rounded-full bg-accent -translate-x-1/2 shadow-lg shadow-accent/30" />
                    </div>
                  )}
                </div>
                {daysRemaining !== null && (
                  <p className="text-xs font-semibold">
                    {daysRemaining > 0 ? (
                      <span className="text-accent">{daysRemaining} gün kaldı</span>
                    ) : daysRemaining === 0 ? (
                      <span className="text-accent">Bugün bitiyor!</span>
                    ) : (
                      <span className="text-destructive">{Math.abs(daysRemaining)} gün gecikme</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Finance */}
            <div className="rounded-xl border border-border/30 bg-card/70 backdrop-blur-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Bütçe</p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {project.budget ? `₺${Number(project.budget).toLocaleString('tr-TR')}` : '—'}
              </p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span className="text-[10px] text-muted-foreground">Toplam bütçe</span>
              </div>
            </div>

            {/* Team with Contact Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="rounded-xl border border-border/30 bg-card/70 backdrop-blur-xl p-4 space-y-2.5 shadow-lg cursor-pointer hover:border-accent/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Building2 className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Sorumlu Birim</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{project.department || 'Belirtilmemiş'}</p>
                  {project.manager_name && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-accent" />
                      </div>
                      <span className="text-xs text-accent underline underline-offset-2">{project.manager_name}</span>
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-card/95 backdrop-blur-xl border-border/40" align="center">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground px-2 py-1.5">{project.manager_name || 'Yönetici'}</p>
                  <a href="tel:+905555555555" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-accent/10 transition-colors">
                    <Phone className="w-4 h-4 text-accent" /> Ara
                  </a>
                  <a href="https://wa.me/905555555555" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-accent/10 transition-colors">
                    <MessageCircle className="w-4 h-4 text-accent" /> WhatsApp
                  </a>
                  <a href="mailto:info@belediye.bel.tr" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-accent/10 transition-colors">
                    <Mail className="w-4 h-4 text-accent" /> E-posta
                  </a>
                </div>
              </PopoverContent>
            </Popover>

            {/* Impact */}
            <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-card/70 backdrop-blur-xl p-4 space-y-2.5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Sosyal Etki</p>
              </div>
              <p className="text-xl font-bold text-accent relative z-10">{project.impact_stat || '—'}</p>
              <p className="text-[10px] text-muted-foreground relative z-10">Etkilenen vatandaş</p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4 px-2 lg:px-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground font-medium text-xs">Genel İlerleme</span>
              <span className="text-accent font-bold">{project.progress ?? 0}%</span>
            </div>
            <Progress value={project.progress ?? 0} className="h-2" />
          </div>
        </section>

        {/* ═══ LOWER SECTION: Tabs + Decision Log ═══ */}
        <section className="max-w-7xl mx-auto px-6 pt-4 pb-2">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-secondary/40 backdrop-blur-xl border border-border/30">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 lg:p-8 min-h-[300px]">
            {/* OVERVIEW - Full Description */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">Proje Açıklaması</h3>
                <p className="text-foreground/80 leading-relaxed text-base max-w-3xl">
                  {project.description || 'Açıklama bulunmuyor.'}
                </p>

                {/* Umbrella Project: Status Summary + Sub-Locations */}
                {project.is_umbrella && Array.isArray(project.sub_locations) && (project.sub_locations as any[]).length > 0 && (() => {
                  const subs = project.sub_locations as unknown as { name: string; status: string; lat: number; lng: number }[];
                  const completed = subs.filter(s => s.status === 'Completed').length;
                  const inProgress = subs.filter(s => s.status === 'In Progress').length;
                  const planned = subs.filter(s => s.status === 'Planned').length;
                  return (
                    <>
                      {/* Status Summary Bar */}
                      <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-accent" />
                          <span className="text-sm font-bold text-foreground">Toplam: {subs.length} Nokta</span>
                        </div>
                        <div className="h-4 w-px bg-border/40" />
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs text-muted-foreground">{completed} Tamamlandı</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-xs text-muted-foreground">{inProgress} Devam Ediyor</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs text-muted-foreground">{planned} Planlanmış</span>
                        </div>
                      </div>

                      {/* Sub-Locations Grid */}
                      <div className="space-y-3">
                        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Network className="w-4 h-4 text-accent" /> Proje Ağ Noktaları
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subs.map((sub, i) => {
                            const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
                              'Completed': { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400', label: 'Tamamlandı' },
                              'In Progress': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Devam Ediyor' },
                              'Planned': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Planlanmış' },
                            };
                            const cfg = statusConfig[sub.status] || statusConfig['Planned'];
                            return (
                              <div key={i} className="rounded-lg border border-border/30 bg-card/50 backdrop-blur-sm p-3 flex items-center gap-3 hover:border-accent/30 transition-colors">
                                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                                  <MapPin className={`w-4 h-4 ${cfg.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* MAP */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Proje Konumu</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {[project.district, project.neighborhood].filter(Boolean).join(', ') || 'Konum belirtilmemiş'}
                    </p>
                  </div>
                  <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
                    <Navigation className="w-4 h-4" /> Yol Tarifi
                  </Button>
                </div>
                <DetailMap project={project} />
              </div>
            )}

            {/* GALLERY - combines project_gallery table + gallery_images column */}
            {activeTab === 'gallery' && (() => {
              const allImages: string[] = [
                ...galleryImages.map(g => g.image_url),
                ...(((project as any).gallery_images as string[] | null | undefined) || []),
              ];
              if (allImages.length === 0) return (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                  <p className="text-sm">Henüz galeri görseli eklenmemiş.</p>
                </div>
              );
              return <GalleryInline images={allImages} />;
            })()}
          </div>
        </section>

        {/* ═══ PRESIDENT'S DECISION LOG ═══ */}
        <section className="max-w-7xl mx-auto px-6 pt-4 pb-16">
          <div className="rounded-2xl border border-accent/20 bg-card/40 backdrop-blur-xl overflow-hidden">
            <div className="px-6 lg:px-8 py-5 border-b border-border/20 bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Başkanlık Karar Defteri</h2>
                  <p className="text-xs text-muted-foreground">Talimat ve direktif geçmişi</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="text-xs border-accent/20 text-accent">{notes.length} kayıt</Badge>
                </div>
              </div>
            </div>

            <div className="px-6 lg:px-8 py-5 border-b border-border/20">
              <div className="space-y-3">
                <div className="rounded-xl border border-border/30 bg-background/40 p-1">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Yeni talimat veya direktif yazın..."
                    className="min-h-[100px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/50 resize-none text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Şifreli kayıt • Sadece yetkili personel görür
                  </p>
                  <Button
                    onClick={handleSendNote}
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-5"
                    size="sm"
                    disabled={!noteText.trim() || isSendingNote}
                  >
                    <Send className="w-3.5 h-3.5" /> {isSendingNote ? 'Gönderiliyor...' : 'Talimat Gönder'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 lg:px-8 py-6">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-8 text-center">Henüz talimat kaydı bulunmuyor.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-accent/20 space-y-5">
                  {notes.map((note) => {
                    const noteDate = new Date(note.created_at);
                    return (
                      <div key={note.id} className="relative group">
                        <div className="absolute -left-[calc(1.5rem+5px)] w-2.5 h-2.5 rounded-full bg-accent/60 border-2 border-card group-hover:bg-accent transition-colors" />
                        <div className="rounded-xl border border-border/20 bg-background/30 backdrop-blur-sm p-4 space-y-2 hover:border-accent/20 transition-colors">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="text-[10px] border-accent/20 text-accent font-mono px-2 py-0.5">
                              {format(noteDate, 'dd MMM yyyy')}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground/60">{format(noteDate, 'HH:mm')}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> {note.author}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{note.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

/* Detail Map component - renders real Leaflet map with sub-location pins for umbrella projects */
const DetailMap = ({ project }: { project: any }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isUmbrella = project.is_umbrella && project.sub_locations && project.sub_locations.length > 0;
    const subs: { name: string; status: string; lat: number; lng: number }[] = isUmbrella ? project.sub_locations : [];

    const map = L.map(mapContainerRef.current, {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    const statusColors: Record<string, string> = {
      'Completed': '#34d399',
      'In Progress': '#fbbf24',
      'Planned': '#60a5fa',
    };

    const createPin = (lat: number, lng: number, color: string, label: string) => {
      const icon = L.divIcon({
        className: 'custom-detail-pin',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${color}80;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      return L.marker([lat, lng], { icon }).bindPopup(`<b style="color:#fff">${label}</b>`, {
        className: 'dark-popup',
      });
    };

    if (isUmbrella) {
      const bounds: [number, number][] = [];
      subs.forEach(sub => {
        if (!sub.lat || !sub.lng) return;
        const color = statusColors[sub.status] || '#60a5fa';
        createPin(sub.lat, sub.lng, color, sub.name).addTo(map);
        bounds.push([sub.lat, sub.lng]);
      });
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else {
        map.setView([36.95, 30.65], 13);
      }
    } else {
      const lat = project.latitude || 36.95;
      const lng = project.longitude || 30.65;
      const color = statusColors[project.status] || '#fbbf24';
      createPin(lat, lng, color, project.title).addTo(map);
      map.setView([lat, lng], 15);
    }

    return () => { map.remove(); };
  }, [project]);

  return (
    <div
      ref={mapContainerRef}
      className="rounded-xl border border-border/30 bg-background/60 h-[350px] overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
};

/* Inline gallery component using gallery_images string array */
const GalleryInline = ({ images }: { images: string[] }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === 'Escape') setLightboxIndex(null);
    if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
    if (e.key === 'ArrowRight') setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-foreground">Proje Galerisi</h3>
        <span className="text-xs text-muted-foreground">({images.length} görsel)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/30 hover:border-accent/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/10 group"
          >
            <ProjectImage src={url} alt={`Galeri ${i + 1}`} />
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-card/60 border border-border/30 flex items-center justify-center text-foreground hover:bg-accent/20 transition-colors z-10">
            <span className="text-lg">✕</span>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
                className="absolute left-6 w-10 h-10 rounded-full bg-card/60 border border-border/30 flex items-center justify-center text-foreground hover:bg-accent/20 transition-colors z-10"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
                className="absolute right-6 w-10 h-10 rounded-full bg-card/60 border border-border/30 flex items-center justify-center text-foreground hover:bg-accent/20 transition-colors z-10"
              >
                ›
              </button>
            </>
          )}

          <img
            src={images[lightboxIndex]}
            alt={`Galeri ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-6 text-xs text-muted-foreground">{lightboxIndex + 1} / {images.length}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
