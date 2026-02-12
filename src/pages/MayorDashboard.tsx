import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { ProjectHero } from '@/components/ProjectHero';
import { ProjectCarousel } from '@/components/ProjectCarousel';
import { CategoryView } from '@/components/CategoryView';
import { DashboardFilters } from '@/components/DashboardFilters';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { useProjects } from '@/hooks/useProjects';

type Tab = 'projects' | 'categories';

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Ahmet Yılmaz updated Science Center', projectId: '1', read: false },
  { id: 2, text: 'Park Project marked as completed', projectId: '2', read: false },
  { id: 3, text: 'New budget approved for Altyapı', projectId: '3', read: true },
  { id: 4, text: 'Fen İşleri inspection scheduled', projectId: '4', read: false },
];

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [tab, setTab] = useState<Tab>('projects');
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
    if (district) result = result.filter((p) => p.district === district);
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    return result;
  }, [projects, search, district, neighborhood]);

  const featured = filtered.find((p) => p.status === 'In Progress' && p.progress > 0) || filtered[0];
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
              {(['projects', 'categories'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
                    tab === t
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
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

              {/* User Avatar */}
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

          {/* Filters toolbar */}
          <div className="mt-3">
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <ExecutiveSummary projects={filtered} />
        {tab === 'projects' ? (
          <>
            {featured && (
              <section>
                <ProjectHero project={featured} />
              </section>
            )}
            <section className="space-y-12">
              {inProgress.length > 0 && (
                <ProjectCarousel projects={inProgress} title="In Progress" status="In Progress" />
              )}
              {completed.length > 0 && (
                <ProjectCarousel projects={completed} title="Completed" status="Completed" />
              )}
              {planned.length > 0 && (
                <ProjectCarousel projects={planned} title="Planned" status="Planned" />
              )}
            </section>
            {filtered.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <p className="text-3xl">📋</p>
                <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        ) : (
          <CategoryView projects={filtered} />
        )}
      </main>
    </div>
  );
};

export default MayorDashboard;
