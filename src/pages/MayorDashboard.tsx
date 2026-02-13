import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { ProjectCarousel } from '@/components/ProjectCarousel';
import { CategoryView } from '@/components/CategoryView';
import { DashboardFilters } from '@/components/DashboardFilters';
import { CommandCenterMap } from '@/components/CommandCenterMap';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { useProjects } from '@/hooks/useProjects';

type ViewMode = 'projects' | 'categories';
type StatusFilter = '' | 'In Progress' | 'Completed' | 'Planned';

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Ahmet Yılmaz updated Science Center', projectId: '1', read: false },
  { id: 2, text: 'Park Project marked as completed', projectId: '2', read: false },
  { id: 3, text: 'New budget approved for Altyapı', projectId: '3', read: true },
  { id: 4, text: 'Fen İşleri inspection scheduled', projectId: '4', read: false },
];

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const [search, setSearch] = useState('');
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
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (district) result = result.filter((p) => p.district === district);
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    return result;
  }, [projects, search, statusFilter, district, neighborhood]);

  const inProgress = filtered.filter((p) => p.status === 'In Progress');
  const completed = filtered.filter((p) => p.status === 'Completed');
  const planned = filtered.filter((p) => p.status === 'Planned');

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
       {/* Tier 1: Brand + Nav + User */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <h1 className="text-base font-black uppercase tracking-[0.15em] text-accent flex-shrink-0">KEPEZ BELEDİYESİ</h1>

            {/* Center Nav Links */}
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
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                      isActive || isActiveCategory
                        ? 'text-accent'
                        : 'text-muted-foreground hover:text-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2">
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-popover shadow-xl z-50">
                    <div className="p-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-secondary/60 transition-colors border-b border-border/30 last:border-0 ${
                            n.read ? 'text-muted-foreground' : 'text-foreground'
                          }`}
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
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors rounded-t-lg">
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors rounded-b-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tier 2: Filters */}
      <div className="sticky top-[52px] z-40 bg-background/60 backdrop-blur-md border-b border-border/30">
        <div className="max-w-[1440px] mx-auto px-4 py-2">
          <DashboardFilters
            projects={projects}
            search={search}
            onSearchChange={setSearch}
            district={district}
            onDistrictChange={setDistrict}
            neighborhood={neighborhood}
            onNeighborhoodChange={setNeighborhood}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-10">
        {/* Command Center Hero: Map + Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:h-[420px]">
          <div className="h-[350px] lg:h-full">
            <CommandCenterMap projects={filtered} />
          </div>
          <div className="h-auto lg:h-full">
            <AnalyticsPanel projects={filtered} />
          </div>
        </section>

        {viewMode === 'projects' ? (
          <section className="space-y-10">
            {inProgress.length > 0 && (
              <ProjectCarousel projects={inProgress} title="In Progress" status="In Progress" />
            )}
            {completed.length > 0 && (
              <ProjectCarousel projects={completed} title="Completed" status="Completed" />
            )}
            {planned.length > 0 && (
              <ProjectCarousel projects={planned} title="Planned" status="Planned" />
            )}
            {filtered.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <p className="text-3xl">📋</p>
                <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </section>
        ) : (
          <CategoryView projects={filtered} />
        )}
      </main>
    </div>
  );
};

export default MayorDashboard;
