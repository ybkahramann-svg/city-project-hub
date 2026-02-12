import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  MapPin,
  LayoutDashboard,
  Map,
  Camera,
  FileText,
  Navigation,
  Send,
  Clock,
  DollarSign,
  Building2,
  User,
  CalendarDays,
  Hourglass,
  Users,
  ShieldCheck,
  MessageSquare,
  ImageIcon,
  TrendingUp,
} from 'lucide-react';
import { format, differenceInDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { toast } from 'sonner';

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
              <div className={`w-2 h-2 rounded-full ${statusPulseMap[project.status] || 'bg-muted-foreground'} animate-pulse`} />
              <Badge className={`text-xs font-semibold ${statusColorMap[project.status] || 'bg-muted/20 text-muted-foreground border-muted/30'}`}>
                {project.status}
              </Badge>
            </div>
          </div>
        </header>

        {/* ═══ CINEMATIC HERO ═══ */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-6">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden border border-border/20 aspect-video bg-secondary/30 relative group">
              {project.image_url ? (
                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/5 to-secondary/40 flex items-center justify-center">
                  <span className="text-7xl opacity-30">🏗️</span>
                </div>
              )}
              {/* Progress overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground font-medium">İlerleme</span>
                  <span className="text-accent font-bold text-lg">{project.progress ?? 0}%</span>
                </div>
                <Progress value={project.progress ?? 0} className="h-2" />
              </div>
            </div>

            {/* Title & Context */}
            <div className="space-y-5 lg:pt-2">
              {project.category && (
                <Badge className="bg-accent/15 text-accent border-accent/20 text-xs tracking-wider uppercase">
                  {project.category}
                </Badge>
              )}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight tracking-tight">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm">{[project.district, project.neighborhood].filter(Boolean).join(' • ') || 'Konum belirtilmemiş'}</span>
                </div>
              </div>

              {/* Live Status Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusPulseMap[project.status] || 'bg-muted-foreground'} animate-pulse shadow-lg`} style={{ boxShadow: project.status === 'In Progress' ? '0 0 8px hsl(var(--accent))' : undefined }} />
                  <span className="text-xs font-semibold text-foreground tracking-wide">{project.status === 'In Progress' ? 'DEVAM EDİYOR' : project.status === 'Completed' ? 'TAMAMLANDI' : 'PLANLANMIŞ'}</span>
                </div>
              </div>

              {project.description && (
                <p className="text-muted-foreground leading-relaxed line-clamp-4 text-sm">{project.description}</p>
              )}
            </div>
          </div>
        </section>

        {/* ═══ KPI DASHBOARD GRID ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Timeline */}
            <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Zaman Çizelgesi</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDate(project.start_date)}</span>
                  <span>{formatDate(project.end_date)}</span>
                </div>
                <div className="relative">
                  <Progress value={timelineProgress} className="h-2" />
                  {timelineProgress > 0 && timelineProgress < 100 && (
                    <div className="absolute top-0 h-2 flex items-center" style={{ left: `${timelineProgress}%` }}>
                      <div className="w-1.5 h-3 rounded-full bg-accent -translate-x-1/2 shadow-lg shadow-accent/30" />
                    </div>
                  )}
                </div>
                {daysRemaining !== null && (
                  <p className="text-xs font-semibold pt-1">
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

            {/* KPI 2: Finance */}
            <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Bütçe</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {project.budget ? `₺${Number(project.budget).toLocaleString('tr-TR')}` : '—'}
              </p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-muted-foreground">Toplam bütçe</span>
              </div>
            </div>

            {/* KPI 3: Team */}
            <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Sorumlu Birim</p>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">{project.department || 'Belirtilmemiş'}</p>
              {project.manager_name && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">{project.manager_name}</span>
                </div>
              )}
            </div>

            {/* KPI 4: Impact */}
            <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-card/60 backdrop-blur-xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Sosyal Etki</p>
              </div>
              <p className="text-2xl font-bold text-accent relative z-10">{project.impact_stat || '—'}</p>
              <p className="text-xs text-muted-foreground relative z-10">Etkilenen vatandaş</p>
            </div>
          </div>
        </section>

        {/* ═══ TABS (Overview, Map, Gallery) ═══ */}
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

        {/* Tab Content */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 lg:p-8 min-h-[300px]">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">Proje Açıklaması</h3>
                <p className="text-foreground/80 leading-relaxed text-base max-w-3xl">
                  {project.description || 'Açıklama bulunmuyor.'}
                </p>
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
                <div className="rounded-xl border border-border/30 bg-background/60 h-[350px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`h${i}`} className="absolute w-full border-t border-accent/30" style={{ top: `${(i + 1) * 8}%` }} />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`v${i}`} className="absolute h-full border-l border-accent/30" style={{ left: `${(i + 1) * 8}%` }} />
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center animate-pulse">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium bg-background/80 px-3 py-1 rounded-full">
                      {project.district || 'İlçe'}, {project.neighborhood || 'Mahalle'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">Proje Galerisi</h3>
                {galleryImages.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground space-y-3">
                    <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                    <p className="text-sm">Henüz galeri görseli eklenmemiş.</p>
                  </div>
                ) : (
                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="break-inside-avoid rounded-xl border border-border/30 overflow-hidden bg-background/40">
                        <img src={img.image_url} alt={img.caption || 'Galeri'} className="w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        {img.caption && <p className="p-2 text-xs text-muted-foreground">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ═══ PRESIDENT'S DECISION LOG ═══ */}
        <section className="max-w-7xl mx-auto px-6 pt-4 pb-16">
          <div className="rounded-2xl border border-accent/20 bg-card/40 backdrop-blur-xl overflow-hidden">
            {/* Log Header */}
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

            {/* New Instruction Input */}
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

            {/* Chronological Log */}
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

export default ProjectDetail;
