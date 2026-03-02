import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, HardHat, CheckCircle, AlertTriangle, Wallet } from 'lucide-react';
import { CategoryView } from '@/components/CategoryView';
import { DashboardFilters, SortOption } from '@/components/DashboardFilters';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/externalDb';
import { ProjectCard } from '@/components/ProjectCard';
import { CategoryView } from '@/components/CategoryView';
import { DashboardFilters, SortOption } from '@/components/DashboardFilters';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/externalDb';

type ViewMode = 'projects' | 'categories';
type StatusFilter = '' | 'In Progress' | 'Completed' | 'Planned';

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Ahmet Yılmaz Bilim Merkezi projesini güncelledi', projectId: '1', read: false },
  { id: 2, text: 'Park Projesi tamamlandı olarak işaretlendi', projectId: '2', read: false },
  { id: 3, text: 'Altyapı için yeni bütçe onaylandı', projectId: '3', read: true },
  { id: 4, text: 'Fen İşleri denetimi planlandı', projectId: '4', read: false },
];

const sortProjects = (projects: Project[], sort: SortOption): Project[] => {
  const sorted = [...projects];
  switch (sort) {
    case 'az': return sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    case 'za': return sorted.sort((a, b) => b.title.localeCompare(a.title, 'tr'));
    case 'newest': return sorted.sort((a, b) => {
      const da = a.completion_date || a.created_at || '';
      const db = b.completion_date || b.created_at || '';
      return db.localeCompare(da);
    });
    case 'budget_desc': return sorted.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    case 'budget_asc': return sorted.sort((a, b) => (a.budget || 0) - (b.budget || 0));
    default: return sorted;
  }
};

const formatBudget = (total: number): string => {
  if (total >= 1_000_000_000) return `₺${(total / 1_000_000_000).toFixed(1)}B`;
  if (total >= 1_000_000) return `₺${(total / 1_000_000).toFixed(0)}M`;
  if (total >= 1_000) return `₺${(total / 1_000).toFixed(0)}K`;
  return `₺${total.toFixed(0)}`;
};

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (notif: typeof MOCK_NOTIFICATIONS[0]) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    setNotifOpen(false);
    navigate(`/project/${notif.projectId}`);
  };

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (category) result = result.filter((p) => p.category === category);
    if (district) result = result.filter((p) => p.district === district);
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    return sortProjects(result, sort);
  }, [projects, search, statusFilter, category, district, neighborhood, sort]);

  const inProgress = filtered.filter((p) => p.status === 'In Progress');
  const completed = filtered.filter((p) => p.status === 'Completed');
  const planned = filtered.filter((p) => p.status === 'Planned');

  // KPI data
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const atRisk = projects.filter((p) => p.status === 'In Progress' && (p.progress || 0) < 30).length;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Projeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const KPI_CARDS = [
    { label: 'Aktif Projeler', value: inProgress.length.toString(), icon: HardHat, gradient: 'from-yellow-500/20 to-yellow-600/5', iconColor: 'text-yellow-500' },
    { label: 'Tamamlananlar', value: completed.length.toString(), icon: CheckCircle, gradient: 'from-green-500/20 to-green-600/5', iconColor: 'text-green-500' },
    { label: 'Riskli / Geciken', value: atRisk.toString(), icon: AlertTriangle, gradient: 'from-red-500/20 to-red-600/5', iconColor: 'text-red-400' },
    { label: 'Toplam Bütçe', value: formatBudget(totalBudget), icon: Wallet, gradient: 'from-accent/20 to-accent/5', iconColor: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Tier 1: Nav + User */}
      <header className="sticky top-0 z-[9998] bg-background border-b border-border/50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Desktop: clean status tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {([
                { label: 'Tüm Projeler', status: '' as StatusFilter, mode: 'projects' as ViewMode },
                { label: 'Devam Edenler', status: 'In Progress' as StatusFilter, mode: 'projects' as ViewMode },
                { label: 'Tamamlananlar', status: 'Completed' as StatusFilter, mode: 'projects' as ViewMode },
                { label: 'Planlananlar', status: 'Planned' as StatusFilter, mode: 'projects' as ViewMode },
                { label: 'Kategoriler', status: '' as StatusFilter, mode: 'categories' as ViewMode },
              ]).map((item) => {
                const isActive = viewMode === item.mode && statusFilter === item.status && !(item.mode === 'projects' && item.status === '' && viewMode === 'categories');
                const isActiveCategory = item.mode === 'categories' && viewMode === 'categories';
                return (
                  <button
                    key={item.label}
                    onClick={() => { setViewMode(item.mode); setStatusFilter(item.status); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                      isActive || isActiveCategory ? 'text-accent' : 'text-muted-foreground hover:text-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-popover shadow-xl z-50">
                    <div className="p-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">Bildirimler</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-secondary/60 transition-colors border-b border-border/30 last:border-0 ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}
                        >
                          <div className="flex items-start gap-2">
                            {!n.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
                            <span className={!n.read ? '' : 'ml-3.5'}>{n.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-accent/50 transition-all"
                >
                  KB
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-popover shadow-xl z-50">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors rounded-t-lg">Profil</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors rounded-b-lg flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile nav ribbon */}
          <nav className="flex md:hidden items-center gap-3 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 pr-8">
            {([
              { label: 'Tüm Projeler', status: '' as StatusFilter, mode: 'projects' as ViewMode },
              { label: 'Devam Edenler', status: 'In Progress' as StatusFilter, mode: 'projects' as ViewMode },
              { label: 'Tamamlananlar', status: 'Completed' as StatusFilter, mode: 'projects' as ViewMode },
              { label: 'Planlananlar', status: 'Planned' as StatusFilter, mode: 'projects' as ViewMode },
              { label: 'Kategoriler', status: '' as StatusFilter, mode: 'categories' as ViewMode },
            ]).map((item) => {
              const isActive = viewMode === item.mode && statusFilter === item.status && !(item.mode === 'projects' && item.status === '' && viewMode === 'categories');
              const isActiveCategory = item.mode === 'categories' && viewMode === 'categories';
              return (
                <button
                  key={item.label}
                  onClick={() => { setViewMode(item.mode); setStatusFilter(item.status); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive || isActiveCategory ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Tier 2: Filters */}
      <div className="sticky top-[44px] z-[9997] bg-background border-b border-border/50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-2">
          <DashboardFilters
            projects={projects}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            district={district}
            onDistrictChange={setDistrict}
            neighborhood={neighborhood}
            onNeighborhoodChange={setNeighborhood}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-8">
        {/* Executive KPI Hero */}
        <section>
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-4">İlçe Yönetim Özeti</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KPI_CARDS.map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-xl border border-border/40 bg-gradient-to-br ${kpi.gradient} p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-foreground">{kpi.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Project Feed */}
        {viewMode === 'projects' ? (
          <section className="space-y-8">
            {/* Status-grouped sections with vertical grid */}
            {([
              { items: inProgress, title: 'Devam Ediyor', status: 'In Progress' },
              { items: completed, title: 'Tamamlandı', status: 'Completed' },
              { items: planned, title: 'Planlanıyor', status: 'Planned' },
            ] as const).map(({ items, title }) =>
              items.length > 0 ? (
                <div key={title} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                    <span className="text-sm text-muted-foreground font-medium">({items.length} proje)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {items.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
            {filtered.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <p className="text-3xl">📋</p>
                <h3 className="text-xl font-semibold text-foreground">Proje bulunamadı</h3>
                <p className="text-muted-foreground">Arama veya filtreleri değiştirmeyi deneyin</p>
              </div>
            )}
          </section>
        ) : (
          <CategoryView projects={filtered} />
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MayorDashboard;
