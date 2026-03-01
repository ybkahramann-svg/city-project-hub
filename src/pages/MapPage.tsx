import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { CommandCenterMap } from '@/components/CommandCenterMap';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, FolderKanban, Activity } from 'lucide-react';

type StatusFilter = '' | 'In Progress' | 'Completed' | 'Planned';

const MapPage = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [neighborhood, setNeighborhood] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');

  const neighborhoods = useMemo(
    () => [...new Set(projects.map((p) => p.neighborhood).filter(Boolean))].sort(),
    [projects]
  );
  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    let result = projects;
    if (neighborhood) result = result.filter((p) => p.neighborhood === neighborhood);
    if (category) result = result.filter((p) => p.category === category);
    if (status) result = result.filter((p) => p.status === status);
    return result;
  }, [projects, neighborhood, category, status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-0">
        <div className="w-10 h-10 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="relative h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)]">
        {/* Full-screen map */}
        <CommandCenterMap projects={filtered} />

        {/* Floating filter bar */}
        <div className="absolute top-3 left-3 right-3 z-40 bg-background/90 backdrop-blur-md shadow-lg rounded-xl p-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {/* Mahalle */}
          <Select value={neighborhood || '__all__'} onValueChange={(v) => setNeighborhood(v === '__all__' ? '' : v)}>
            <SelectTrigger className="min-w-[130px] bg-card/80 border-border/50 text-sm h-9">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Mahalle" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-[9999]">
              <SelectItem value="__all__">Tüm Mahalleler</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n!}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Kategori */}
          <Select value={category || '__all__'} onValueChange={(v) => setCategory(v === '__all__' ? '' : v)}>
            <SelectTrigger className="min-w-[130px] bg-card/80 border-border/50 text-sm h-9">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Kategori" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-[9999]">
              <SelectItem value="__all__">Tüm Kategoriler</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Durum */}
          <Select value={status || '__all__'} onValueChange={(v) => setStatus((v === '__all__' ? '' : v) as StatusFilter)}>
            <SelectTrigger className="min-w-[120px] bg-card/80 border-border/50 text-sm h-9">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Durum" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-[9999]">
              <SelectItem value="__all__">Tüm Durumlar</SelectItem>
              <SelectItem value="In Progress">Devam Eden</SelectItem>
              <SelectItem value="Completed">Tamamlanan</SelectItem>
              <SelectItem value="Planned">Planlanan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MapPage;
