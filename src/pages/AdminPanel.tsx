import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaGallery } from '@/components/MediaGallery';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Save,
  Pencil,
  Building2,
  LayoutDashboard,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  CalendarClock,
  Upload,
  Images,
} from 'lucide-react';
import { addProject, updateProject, deleteProject, Project } from '@/lib/externalDb';
import { useProjects } from '@/hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

// ─── Sort types ───
type SortColumn = 'title' | 'category' | 'neighborhood' | 'budget' | 'status';
type SortDirection = 'asc' | 'desc';

// ─── Form State ───
interface FormState {
  title: string;
  description: string;
  category: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  budget: string;
  progress: string;
  department: string;
  district: string;
  neighborhood: string;
  latitude: string;
  longitude: string;
  detailed_address: string;
  image_url: string;
  manager_name: string;
  impact_stat: string;
}

const emptyForm: FormState = {
  title: '', description: '', category: '', status: 'Planned',
  budget: '', progress: '0', department: '', district: '',
  neighborhood: '', latitude: '', longitude: '', detailed_address: '',
  image_url: '', manager_name: '', impact_stat: '',
};

export const AdminPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects();

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState('all');

  // Sort
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile filter & sort sheets
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  // Media uploader
  const [mediaUploaderOpen, setMediaUploaderOpen] = useState(false);

  const isEditMode = !!editingId;

  // Unique values from data
  const uniqueCategories = useMemo(() => [...new Set(projects.map(p => p.category).filter(Boolean))], [projects]);
  const uniqueDepartments = useMemo(() => [...new Set(projects.map(p => p.department).filter(Boolean))], [projects]);
  const uniqueNeighborhoods = useMemo(() => [...new Set(projects.map(p => p.neighborhood).filter(Boolean))].sort(), [projects]);

  // Apply filters then sort
  const filtered = useMemo(() => {
    let result = projects.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatuses.length > 0 && !filterStatuses.includes(p.status)) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterDepartment !== 'all' && p.department !== filterDepartment) return false;
      if (filterNeighborhood !== 'all' && p.neighborhood !== filterNeighborhood) return false;
      return true;
    });

    if (sortColumn) {
      const dir = sortDirection === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';
        switch (sortColumn) {
          case 'title':
            valA = (a.title || '').toLowerCase();
            valB = (b.title || '').toLowerCase();
            break;
          case 'category':
            valA = (a.category || '').toLowerCase();
            valB = (b.category || '').toLowerCase();
            break;
          case 'neighborhood':
            valA = (a.neighborhood || '').toLowerCase();
            valB = (b.neighborhood || '').toLowerCase();
            break;
          case 'budget':
            valA = a.budget || 0;
            valB = b.budget || 0;
            break;
          case 'status':
            valA = (statusLabel[a.status] || '').toLowerCase();
            valB = (statusLabel[b.status] || '').toLowerCase();
            break;
        }
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    return result;
  }, [projects, search, filterStatuses, filterCategory, filterDepartment, filterNeighborhood, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-accent" />
      : <ChevronDown className="w-3.5 h-3.5 ml-1 text-accent" />;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
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

      if (isEditMode && editingId) {
        await updateProject(editingId, payload as any);
        toast.success('Proje güncellendi!');
      } else {
        await addProject({ ...payload, created_at: new Date().toISOString() } as any);
        toast.success('Proje oluşturuldu!');
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSheetOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteProject(id);
      toast.success(`"${title}" silindi.`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleStatus = (status: string) => {
    setFilterStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return '—';
    if (budget >= 1_000_000) return `₺${(budget / 1_000_000).toFixed(1)}M`;
    if (budget >= 1_000) return `₺${(budget / 1_000).toFixed(0)}K`;
    return `₺${budget}`;
  };

  const headerClass = "text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors select-none";

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* ── Left Sidebar (Filters) ── */}
      <aside className="hidden md:flex w-[280px] flex-shrink-0 border-r border-border/40 bg-card/60 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Yönetim Paneli</h1>
              <p className="text-[10px] text-muted-foreground">{projects.length} proje</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/mayor')}
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-foreground text-xs justify-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panoya Dön
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-5">
          {/* Search */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
              <Search className="w-3 h-3" /> Ara
            </Label>
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Proje adı..."
                className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm pl-3"
              />
            </div>
          </div>

          {/* Status checkboxes */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Durum
            </Label>
            {(['In Progress', 'Completed', 'Planned'] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filterStatuses.includes(s)}
                  onCheckedChange={() => toggleStatus(s)}
                  className="border-border/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {statusLabel[s]}
                </span>
              </label>
            ))}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Kategori</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-[9999]">
                <SelectItem value="all">Tümü</SelectItem>
                {uniqueCategories.map(c => (
                  <SelectItem key={c} value={c!}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Birim</Label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-[9999]">
                <SelectItem value="all">Tümü</SelectItem>
                {uniqueDepartments.map(d => (
                  <SelectItem key={d} value={d!}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mahalle (replaces İlçe) */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mahalle</Label>
            <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
              <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-[9999] max-h-[240px]">
                <SelectItem value="all">Tümü</SelectItem>
                {uniqueNeighborhoods.map(n => (
                  <SelectItem key={n} value={n!}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 p-3 bg-card/40">
          <p className="text-[10px] text-muted-foreground/50 text-center tracking-wider uppercase">
            {filtered.length} / {projects.length} gösteriliyor
          </p>
        </div>
      </aside>

      {/* ── Right Main Area (Data Grid) ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card/40 border-b border-border/30 px-4 md:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground hidden md:block">Projeler</h2>
            <h2 className="text-sm font-semibold text-foreground md:hidden">Projeler <span className="text-muted-foreground font-normal">({filtered.length})</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMediaUploaderOpen(true)}
              className="gap-1.5 text-xs border-border/30 h-9"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Medya Yükle</span>
            </Button>
            <Button
              onClick={openCreate}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-9 text-sm font-semibold shadow-lg shadow-accent/10"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Proje Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </Button>
          </div>
        </header>

        {/* Mobile Filter & Sort Bar */}
        <div className="flex md:hidden gap-2 px-4 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 gap-2 text-xs border-border/30 h-9"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtrele
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileSortOpen(true)}
            className="flex-1 gap-2 text-xs border-border/30 h-9"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sırala
          </Button>
        </div>

        {/* Data Area */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Proje bulunamadı</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/20 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-[50px]">#</TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('title')} className={cn(headerClass, "text-muted-foreground")}>
                          Proje Adı <SortIcon column="title" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('category')} className={cn(headerClass, "text-muted-foreground")}>
                          Kategori & Birim <SortIcon column="category" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('neighborhood')} className={cn(headerClass, "text-muted-foreground")}>
                          Mahalle <SortIcon column="neighborhood" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button onClick={() => handleSort('budget')} className={cn(headerClass, "text-muted-foreground ml-auto")}>
                          Bütçe <SortIcon column="budget" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">
                        <button onClick={() => handleSort('status')} className={cn(headerClass, "text-muted-foreground mx-auto")}>
                          Durum <SortIcon column="status" />
                        </button>
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right">Aksiyonlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((project, i) => (
                      <TableRow key={project.id} className="border-border/10 hover:bg-secondary/20 group">
                        <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {project.image_url ? (
                              <img src={project.image_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-border/20" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-secondary/50 flex-shrink-0 border border-border/20 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-muted-foreground/40" />
                              </div>
                            )}
                            <button
                              onClick={() => navigate(`/admin/project/${project.id}`)}
                              className="text-sm font-medium text-primary truncate max-w-[250px] text-left cursor-pointer hover:underline transition-colors"
                            >
                              {project.title}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-foreground/80">{project.category || '—'}</p>
                          <p className="text-[11px] text-muted-foreground/60">{project.department || '—'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-foreground/80">{project.neighborhood || '—'}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-semibold text-foreground">{formatBudget(project.budget)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn('text-[10px] font-semibold border', statusBadgeClass[project.status])}>
                            {statusLabel[project.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 hover:text-accent" onClick={() => openEdit(project)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Projeyi sil?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    "{project.title}" kalıcı olarak silinecek. Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border/50">İptal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(project.id, project.title)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View (Sahibinden style) */}
              <div className="flex flex-col gap-3 p-4 md:hidden">
                {filtered.map((project) => {
                  const StatusIcon = project.status === 'Completed' ? CheckCircle2
                    : project.status === 'In Progress' ? Clock : CalendarClock;
                  const statusColor = project.status === 'Completed' ? 'text-green-400'
                    : project.status === 'In Progress' ? 'text-accent' : 'text-blue-400';

                  return (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/admin/project/${project.id}`)}
                      className="flex flex-row gap-3 p-3 border border-border/20 rounded-xl bg-card relative text-left active:scale-[0.98] transition-transform"
                    >
                      {project.image_url ? (
                        <img src={project.image_url} alt="" className="w-20 h-20 rounded-md object-cover flex-shrink-0 border border-border/20" />
                      ) : (
                        <div className="w-20 h-20 rounded-md bg-secondary/50 flex-shrink-0 border border-border/20 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="flex flex-col justify-between w-full min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-foreground truncate">{project.title}</h3>
                            <StatusIcon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", statusColor)} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {project.neighborhood || project.category || '—'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold text-primary">{formatBudget(project.budget)}</span>
                          <span className="text-[10px] text-muted-foreground/60">{project.category}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Media Gallery Section */}
        <ErrorBoundary>
          <div className="border-t border-border/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Images className="w-4 h-4 text-accent" />
              Medya Galerisi
            </h3>
            <MediaGallery compact />
          </div>
        </ErrorBoundary>
      </main>

      {/* Media Uploader Dialog */}
      <MediaUploader open={mediaUploaderOpen} onOpenChange={setMediaUploaderOpen} />

      {/* ── Slide-out Sheet (Create / Edit) ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] bg-card border-border/30 overflow-y-auto scrollbar-hide p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border/20">
            <SheetTitle className="text-foreground text-lg">
              {isEditMode ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">
              {isEditMode ? 'Proje bilgilerini güncelleyin' : 'Yeni proje bilgilerini girin'}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-5">
            {/* Proje Adı */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Proje Adı *</Label>
              <Input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="ör. Yeni Kütüphane" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
            </div>

            {/* Açıklama */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Açıklama</Label>
              <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Proje detayları..." rows={3} className="bg-secondary/30 border-border/20 rounded-lg resize-none" />
            </div>

            {/* Kategori & Durum */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Kategori</Label>
                <Select value={form.category} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Durum</Label>
                <Select value={form.status} onValueChange={v => updateField('status', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">
                    <SelectItem value="Planned">Planlandı</SelectItem>
                    <SelectItem value="In Progress">Devam Ediyor</SelectItem>
                    <SelectItem value="Completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bütçe & İlerleme */}
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

            {/* Divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-border/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Konum & Yönetim</span>
              <div className="h-px flex-1 bg-border/30" />
            </div>

            {/* Sorumlu Birim & Yönetici */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Sorumlu Birim</Label>
                <Select value={form.department} onValueChange={v => updateField('department', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Yönetici Adı</Label>
                <Input value={form.manager_name} onChange={e => updateField('manager_name', e.target.value)} placeholder="ör. Ahmet Yılmaz" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
            </div>

            {/* İlçe & Mahalle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">İlçe</Label>
                <Select value={form.district} onValueChange={v => updateField('district', v)}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-10 text-sm">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999]">
                    {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mahalle</Label>
                <Input value={form.neighborhood} onChange={e => updateField('neighborhood', e.target.value)} placeholder="ör. Varsak" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
              </div>
            </div>

            {/* Enlem & Boylam */}
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

            {/* Açık Adres */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Açık Adres</Label>
              <Textarea value={form.detailed_address} onChange={e => updateField('detailed_address', e.target.value)} placeholder="Tam adres bilgisi..." rows={2} className="bg-secondary/30 border-border/20 rounded-lg resize-none" />
            </div>

            {/* Etki İstatistiği */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Etki İstatistiği</Label>
              <Input value={form.impact_stat} onChange={e => updateField('impact_stat', e.target.value)} placeholder="ör. Günlük 5000 kişi" className="bg-secondary/30 border-border/20 rounded-lg h-10" />
            </div>

            {/* Görsel URL */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Görsel URL</Label>
              <Input value={form.image_url} onChange={e => updateField('image_url', e.target.value)} type="url" placeholder="https://..." className="bg-secondary/30 border-border/20 rounded-lg h-10" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 pb-2">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 gap-2 rounded-lg shadow-lg shadow-accent/15"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? (isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...')
                  : (isEditMode ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Mobile Filter Sheet (Left Slide) ── */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="left" className="w-[300px] bg-card border-border/30 overflow-y-auto scrollbar-hide p-0">
          <SheetHeader className="p-4 pb-3 border-b border-border/20">
            <SheetTitle className="text-foreground text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent" />
              Filtreler
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">
              {filtered.length} / {projects.length} gösteriliyor
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-5">
            {/* Panoya Dön */}
            <Button
              onClick={() => { setMobileFilterOpen(false); navigate('/mayor'); }}
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-foreground text-xs justify-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Panoya Dön
            </Button>

            {/* Search */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                <Search className="w-3 h-3" /> Ara
              </Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Proje adı..."
                className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm pl-3"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Durum
              </Label>
              {(['In Progress', 'Completed', 'Planned'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={filterStatuses.includes(s)}
                    onCheckedChange={() => toggleStatus(s)}
                    className="border-border/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {statusLabel[s]}
                  </span>
                </label>
              ))}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Kategori</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-[9999]">
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueCategories.map(c => (
                    <SelectItem key={c} value={c!}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Birim</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-[9999]">
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueDepartments.map(d => (
                    <SelectItem key={d} value={d!}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mahalle */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mahalle</Label>
              <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
                <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-[9999] max-h-[240px]">
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueNeighborhoods.map(n => (
                    <SelectItem key={n} value={n!}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Mobile Sort Sheet ── */}
      <Sheet open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
        <SheetContent side="bottom" className="bg-card border-border/30 rounded-t-2xl">
          <SheetHeader className="pb-3 border-b border-border/20">
            <SheetTitle className="text-foreground text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              Sıralama
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">
              Listeyi sıralamak için bir kriter seçin
            </SheetDescription>
          </SheetHeader>
          <div className="py-3 space-y-1">
            {([
              { col: 'title' as SortColumn, label: 'Proje Adı' },
              { col: 'category' as SortColumn, label: 'Kategori' },
              { col: 'neighborhood' as SortColumn, label: 'Mahalle' },
              { col: 'budget' as SortColumn, label: 'Bütçe' },
              { col: 'status' as SortColumn, label: 'Durum' },
            ]).map(({ col, label }) => (
              <button
                key={col}
                onClick={() => { handleSort(col); setMobileSortOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors",
                  sortColumn === col ? "bg-accent/10 text-accent font-semibold" : "text-foreground hover:bg-secondary/30"
                )}
              >
                {label}
                {sortColumn === col && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPanel;
