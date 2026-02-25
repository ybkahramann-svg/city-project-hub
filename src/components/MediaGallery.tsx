import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/hooks/useProjects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImagePlus } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  category: string;
  project_id: string | null;
  created_at: string;
}

const useGalleryImages = (projectId?: string) => {
  return useQuery({
    queryKey: ['gallery-images', projectId || 'all'],
    queryFn: async () => {
      try {
        let query = supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Gallery fetch error:', error);
          return [];
        }
        return (data ?? []) as GalleryImage[];
      } catch (err) {
        console.error('Unexpected gallery error:', err);
        return [];
      }
    },
  });
};

interface MediaGalleryProps {
  compact?: boolean;
  /** If provided, shows only this project's images without tabs */
  projectId?: string;
}

export const MediaGallery = ({ compact = false, projectId }: MediaGalleryProps) => {
  const { data: images = [], isLoading } = useGalleryImages(projectId);
  const { data: projects = [] } = useProjects();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const projectImages = (images ?? []).filter(img => img.category === 'project');
  const generalImages = (images ?? []).filter(img => img.category === 'general');

  const getProjectName = (pid: string | null) => {
    if (!pid) return null;
    return projects.find(p => p.id === pid)?.title || null;
  };

  const ImageGrid = ({ items }: { items: GalleryImage[] }) => {
    const safeItems = items ?? [];
    if (safeItems.length === 0) {
      return (
        <div className="py-12 text-center">
          <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Henüz görsel yüklenmedi</p>
        </div>
      );
    }

    return (
      <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} gap-3`}>
        {safeItems.map((img) => {
          const projectName = getProjectName(img.project_id);
          return (
            <button
              key={img.id}
              onClick={() => setSelectedImage(selectedImage === img.id ? null : img.id)}
              className="relative group aspect-square rounded-xl overflow-hidden border border-border/20 bg-secondary/20 hover:border-accent/30 transition-all"
            >
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {projectName && !projectId && (
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/60 backdrop-blur-sm">
                  <p className="text-[11px] text-white truncate font-medium">{projectName}</p>
                </div>
              )}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  {new Date(img.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground text-sm">Galeri yükleniyor...</div>;
  }

  // Project-specific mode: no tabs, just the grid
  if (projectId) {
    return <ImageGrid items={images ?? []} />;
  }

  return (
    <div>
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="bg-secondary/30 border border-border/20 mb-4">
          <TabsTrigger value="project" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Proje Görselleri ({projectImages.length})
          </TabsTrigger>
          <TabsTrigger value="general" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Genel Görseller ({generalImages.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="project">
          <ImageGrid items={projectImages} />
        </TabsContent>
        <TabsContent value="general">
          <ImageGrid items={generalImages} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
