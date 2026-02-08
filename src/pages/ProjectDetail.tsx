import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
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
} from 'lucide-react';

type Tab = 'overview' | 'map' | 'monitor' | 'notes';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Location Map', icon: Map },
  { id: 'monitor', label: 'Site Monitor', icon: Camera },
  { id: 'notes', label: "Mayor's Notes", icon: FileText },
];

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const project = projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [noteText, setNoteText] = useState('');

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

  const placeholderDates = ['Feb 08', 'Feb 05', 'Feb 01', 'Jan 28', 'Jan 22', 'Jan 15', 'Jan 10', 'Jan 03'];

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
            {/* Image */}
            <div className="rounded-2xl overflow-hidden border border-border/30 bg-secondary/20 aspect-[4/3]">
              {project.image_url ? (
                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-6xl">🏗️</span>
                </div>
              )}
            </div>
            {/* Title Block */}
            <div className="space-y-3">
              <Badge className="bg-accent/20 text-accent border-accent/30">{project.category}</Badge>
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
                    <p className="text-4xl font-bold text-accent">₺{Number(project.budget).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <p className={`text-xl font-semibold ${statusColor}`}>{project.status}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground uppercase tracking-widest text-[11px] font-semibold">Progress</span>
                      <span className="text-accent font-bold text-lg">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Description</p>
                  <p className="text-foreground/80 leading-relaxed text-lg">{project.description}</p>
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
                {/* Map Placeholder */}
                <div className="rounded-xl border border-border/30 bg-background/60 h-[350px] flex items-center justify-center relative overflow-hidden">
                  {/* Fake map grid */}
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`h${i}`} className="absolute w-full border-t border-accent/30" style={{ top: `${(i + 1) * 8}%` }} />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`v${i}`} className="absolute h-full border-l border-accent/30" style={{ left: `${(i + 1) * 8}%` }} />
                    ))}
                  </div>
                  {/* Pin */}
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

            {/* SITE MONITOR */}
            {activeTab === 'monitor' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground">Construction Snapshots</h3>
                {/* Featured Photo */}
                <div className="rounded-xl border border-border/30 bg-background/40 overflow-hidden aspect-video flex items-center justify-center">
                  {project.image_url ? (
                    <img src={project.image_url} alt="Latest site photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground space-y-2">
                      <Camera className="w-12 h-12 mx-auto opacity-40" />
                      <p className="text-sm">No site photos available</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Time-Lapse Timeline</p>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Timeline Strip */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {placeholderDates.map((date, i) => (
                    <button
                      key={date}
                      className={`flex-shrink-0 w-24 rounded-xl border p-3 text-center transition-all ${
                        i === 0
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border/30 bg-secondary/30 text-muted-foreground hover:border-accent/40'
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs font-medium">{date}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MAYOR'S NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Directives & Orders</h3>
                  <p className="text-muted-foreground text-sm mt-1">Send instructions to department heads regarding this project.</p>
                </div>
                <div className="rounded-xl border border-accent/20 bg-background/40 p-1">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Type your directive here..."
                    className="min-h-[180px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/50 resize-none text-base"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">🔒 Encrypted • Visible only to authorized personnel</p>
                  <Button
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-6"
                    disabled={!noteText.trim()}
                  >
                    <Send className="w-4 h-4" /> Send Order
                  </Button>
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
