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
  ChevronLeft,
  ChevronRight,
  Phone,
  Building2,
  User,
  CalendarDays,
  Hourglass,
  Users,
  ShieldCheck,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

type Tab = 'overview' | 'map' | 'gallery' | 'notes';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Location Map', icon: Map },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'notes', label: "Mayor's Notes", icon: FileText },
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

  // Fetch notes from Supabase
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

    // Realtime subscription
    const channel = supabase
      .channel(`notes-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_notes', filter: `project_id=eq.${id}` },
        () => { fetchNotes(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Fetch gallery images
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
          <h2 className="text-xl font-bold text-foreground">Project not found</h2>
          <Button onClick={() => navigate('/mayor')} variant="outline" className="gap-2 border-border/50 hover:border-accent/50 hover:text-accent">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusColor =
    project.status === 'Completed' ? 'text-green-400' : project.status === 'In Progress' ? 'text-accent' : 'text-blue-400';

  // Compute dynamic data
  const hasResponsibility = !!(project.department || project.manager_name);
  const hasTimeline = !!(project.start_date || project.end_date);
  const hasImpact = !!project.impact_stat;

  let daysRemaining: number | null = null;
  if (project.end_date) {
    try {
      daysRemaining = differenceInDays(parseISO(project.end_date), new Date());
    } catch { /* ignore parse errors */ }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try { return format(parseISO(dateStr), 'dd.MM.yyyy'); } catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: project.image_url ? `url('${project.image_url}')` : undefined,
          filter: 'blur(40px) brightness(0.3)',
        }}
      />
      <div className="absolute inset-0 bg-background/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-md border-b border-border/30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Button onClick={() => navigate('/mayor')} variant="ghost" className="gap-2 text-muted-foreground hover:text-accent">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Button>
            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">{project.status}</Badge>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto w-full px-6 pt-8 pb-4">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
            <div className="rounded-2xl overflow-hidden border border-border/30 bg-secondary/20 aspect-[4/3]">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"><span class="text-6xl">🏗️</span></div>'; }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-6xl">🏗️</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {project.category && <Badge className="bg-accent/20 text-accent border-accent/30">{project.category}</Badge>}
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">{project.title}</h1>
              {(project.district || project.neighborhood) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{[project.district, project.neighborhood].filter(Boolean).join(' / ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Command Center Strip — only show cards that have data */}
        {(hasResponsibility || hasTimeline || hasImpact) && (
          <div className="max-w-7xl mx-auto w-full px-6 py-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Responsibility Card */}
              {hasResponsibility && (
                <div className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-xl p-4 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sorumlu Birim</p>
                  {project.department && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{project.department}</p>
                    </div>
                  )}
                  {project.manager_name && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{project.manager_name}</span>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center hover:bg-accent/20 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-accent" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline Card */}
              {hasTimeline && (
                <div className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-xl p-4 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Proje Takvimi</p>
                  <div className="flex items-center gap-6">
                    {project.start_date && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Başlangıç</p>
                        <p className="text-sm font-semibold text-foreground">{formatDate(project.start_date)}</p>
                      </div>
                    )}
                    <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-accent/10 relative">
                      <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-accent" />
                      <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-border" />
                    </div>
                    {project.end_date && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Hedef Bitiş</p>
                        <p className="text-sm font-semibold text-foreground">{formatDate(project.end_date)}</p>
                      </div>
                    )}
                  </div>
                  {daysRemaining !== null && (
                    <div className="flex items-center gap-2">
                      <Hourglass className="w-3.5 h-3.5 text-accent" />
                      <Badge className="bg-accent/15 text-accent border-accent/20 text-xs font-bold">
                        {daysRemaining > 0 ? `${daysRemaining} Gün Kaldı` : daysRemaining === 0 ? 'Bugün!' : `${Math.abs(daysRemaining)} Gün Gecikme`}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Impact Card */}
              {hasImpact && (
                <div className="sm:col-span-2 lg:col-span-1 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-secondary/30 to-accent/5 backdrop-blur-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/70">Sosyal Etki</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{project.impact_stat}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Glass Tabs */}
        <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2">
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
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
          <div className="rounded-2xl border border-border/30 bg-secondary/20 backdrop-blur-xl p-6 lg:p-8 min-h-[400px]">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Budget</p>
                    <p className="text-4xl font-bold text-accent">₺{Number(project.budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <p className={`text-xl font-semibold ${statusColor}`}>{project.status}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground uppercase tracking-widest text-[11px] font-semibold">Progress</span>
                      <span className="text-accent font-bold text-lg">{project.progress ?? 0}%</span>
                    </div>
                    <Progress value={project.progress ?? 0} className="h-3" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Description</p>
                  <p className="text-foreground/80 leading-relaxed text-lg">{project.description || 'No description provided.'}</p>
                </div>
              </div>
            )}

            {/* LOCATION MAP */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Project Location</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {[project.district, project.neighborhood].filter(Boolean).join(', ') || 'Location not specified'}
                    </p>
                  </div>
                  <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Navigation className="w-4 h-4" /> Get Directions
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
                      {project.district || 'District'}, {project.neighborhood || 'Neighborhood'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground">Project Gallery</h3>
                {galleryImages.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground space-y-3">
                    <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                    <p className="text-sm">No gallery images yet. Upload from the Admin panel.</p>
                  </div>
                ) : (
                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="break-inside-avoid rounded-xl border border-border/30 overflow-hidden bg-background/40">
                        <img
                          src={img.image_url}
                          alt={img.caption || 'Gallery image'}
                          className="w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        {img.caption && (
                          <p className="p-2 text-xs text-muted-foreground">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MAYOR'S NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-8">
                {/* New Note Input */}
                <div className="max-w-2xl space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Direktif & Talimatlar</h3>
                    <p className="text-muted-foreground text-sm mt-1">Daire başkanlarına proje hakkında talimat gönderin.</p>
                  </div>
                  <div className="rounded-xl border border-accent/20 bg-background/40 p-1">
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Talimatınızı buraya yazın..."
                      className="min-h-[120px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/50 resize-none text-base"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Şifreli • Sadece yetkili personel görebilir
                    </p>
                    <Button
                      onClick={handleSendNote}
                      className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-6"
                      disabled={!noteText.trim() || isSendingNote}
                    >
                      <Send className="w-4 h-4" /> {isSendingNote ? 'Gönderiliyor...' : 'Emir Gönder'}
                    </Button>
                  </div>
                </div>

                {/* Historical Log */}
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Geçmiş Kayıtlar</p>
                  </div>
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 py-4">Henüz kayıt bulunmuyor.</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-border/30 space-y-6">
                      {notes.map((note) => (
                        <div key={note.id} className="relative">
                          <div className="absolute -left-[calc(1.5rem+5px)] w-2.5 h-2.5 rounded-full bg-accent/60 border-2 border-background" />
                          <div className="rounded-xl border border-border/20 bg-background/30 backdrop-blur-sm p-4 space-y-2 hover:border-accent/20 transition-colors">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] border-accent/20 text-accent font-mono">
                                {format(new Date(note.created_at), 'dd.MM.yyyy HH:mm')}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> {note.author}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{note.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
