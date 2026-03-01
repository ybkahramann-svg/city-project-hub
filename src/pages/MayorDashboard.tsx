import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Bell, AlertTriangle, Map, List, CheckCircle2, HardHat, TrendingUp, Smile } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/externalDb';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Ahmet Yılmaz Bilim Merkezi projesini güncelledi', projectId: '1', read: false },
  { id: 2, text: 'Park Projesi tamamlandı olarak işaretlendi', projectId: '2', read: false },
  { id: 3, text: 'Altyapı için yeni bütçe onaylandı', projectId: '3', read: true },
  { id: 4, text: 'Fen İşleri denetimi planlandı', projectId: '4', read: false },
];

const MOCK_ALERTS = [
  { id: 1, type: 'delay', text: 'Kepez Spor Kompleksi: İnşaat 2 hafta gecikiyor', time: '2 saat önce' },
  { id: 2, type: 'budget', text: 'Altyapı Yenileme: Bütçe %15 aşıldı', time: '5 saat önce' },
  { id: 3, type: 'update', text: 'Yeşil Park Projesi: Peyzaj tamamlandı', time: '1 gün önce' },
  { id: 4, type: 'delay', text: 'Okul Onarımları: Malzeme tedarikinde gecikme', time: '1 gün önce' },
  { id: 5, type: 'update', text: 'Yol Genişletme: Asfalt dökümü başladı', time: '2 gün önce' },
];

const CATEGORY_COLORS = [
  'hsl(45, 85%, 55%)',   // accent gold
  'hsl(160, 60%, 45%)',  // teal
  'hsl(220, 60%, 55%)',  // blue
  'hsl(0, 70%, 55%)',    // red
  'hsl(280, 50%, 55%)',  // purple
  'hsl(30, 80%, 55%)',   // orange
  'hsl(190, 70%, 45%)',  // cyan
];

const formatBudget = (total: number): string => {
  if (total >= 1_000_000_000) return `₺${(total / 1_000_000_000).toFixed(1)}B`;
  if (total >= 1_000_000) return `₺${(total / 1_000_000).toFixed(0)}M`;
  if (total >= 1_000) return `₺${(total / 1_000).toFixed(0)}K`;
  return `₺${total.toFixed(0)}`;
};

export const MayorDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
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

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // KPI data
  const totalActive = projects.filter(p => p.status === 'In Progress').length;
  const totalCompleted = projects.filter(p => p.status === 'Completed').length;
  const totalPlanned = projects.filter(p => p.status === 'Planned').length;
  const riskCount = 3; // mocked
  const satisfactionScore = 78; // mocked percentage

  // Category distribution for donut
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach(p => {
      const cat = p.category || 'Diğer';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  const kpis = [
    { label: 'Toplam Aktif Proje', value: totalActive.toString(), icon: HardHat, color: 'text-yellow-500' },
    { label: 'Tamamlanan', value: totalCompleted.toString(), icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Riskli / Geciken', value: riskCount.toString(), icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Genel Memnuniyet', value: `%${satisfactionScore}`, icon: Smile, color: 'text-accent' },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-[9999] bg-background border-b border-border/50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/mayor')}
              className="text-base font-black uppercase tracking-[0.15em] text-accent flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              KEPEZ BELEDİYESİ
            </button>

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
                      <h4 className="text-sm font-semibold text-foreground">Bildirimler</h4>
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
                      Profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors rounded-b-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-6">
        {/* KPI Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="relative overflow-hidden rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-4 md:p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{kpi.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                {kpi.label}
              </p>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.03] to-transparent" />
            </div>
          ))}
        </section>

        {/* Middle: Alerts + Chart/Nav */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Alerts */}
          <div className="md:col-span-2 rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Kritik Uyarılar ve Son Gelişmeler
              </h3>
            </div>
            <div className="divide-y divide-border/20">
              {MOCK_ALERTS.map((alert) => (
                <div key={alert.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.type === 'delay' ? 'bg-destructive' :
                    alert.type === 'budget' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{alert.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chart + Nav */}
          <div className="md:col-span-1 space-y-4">
            {/* Donut Chart */}
            <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Proje Dağılımı
              </h3>
              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(220 20% 12%)',
                        border: '1px solid hsl(220 20% 20%)',
                        borderRadius: '8px',
                        color: '#f2f2f2',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-2">
              <Link
                to="/harita"
                className="flex items-center gap-3 w-full rounded-xl border border-border/30 bg-card/60 hover:bg-secondary/40 backdrop-blur-xl p-4 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Map className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">🗺️ Haritayı Aç</p>
                  <p className="text-[11px] text-muted-foreground">Kuşbakışı görünüm</p>
                </div>
              </Link>
              <Link
                to="/projeler"
                className="flex items-center gap-3 w-full rounded-xl border border-border/30 bg-card/60 hover:bg-secondary/40 backdrop-blur-xl p-4 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <List className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">📋 Proje Listesi</p>
                  <p className="text-[11px] text-muted-foreground">Detaylı kategori görünümü</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MayorDashboard;
