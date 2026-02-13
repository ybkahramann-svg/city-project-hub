import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProjectImage } from './ProjectImage';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
}

export const GalleryLightbox = ({ images }: GalleryLightboxProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <>
      {/* Horizontal scrolling thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => openLightbox(i)}
            className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-border/30 hover:border-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/10 group relative"
          >
            <ProjectImage src={img.image_url} alt={img.caption || 'Galeri'} />
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent p-2">
                <p className="text-[10px] text-foreground/80 truncate">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-2xl border-border/20 overflow-hidden [&>button]:hidden">
          {lightboxIndex !== null && (
            <div className="relative flex items-center justify-center w-full h-[85vh]">
              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 bg-background/40 hover:bg-background/60 text-foreground rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Prev */}
              {images.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prev}
                  className="absolute left-4 z-50 bg-background/40 hover:bg-background/60 text-foreground rounded-full w-10 h-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {/* Image */}
              <img
                src={images[lightboxIndex].image_url}
                alt={images[lightboxIndex].caption || 'Galeri'}
                className="max-w-full max-h-full object-contain"
              />

              {/* Next */}
              {images.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={next}
                  className="absolute right-4 z-50 bg-background/40 hover:bg-background/60 text-foreground rounded-full w-10 h-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}

              {/* Caption + Counter */}
              <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-1">
                {images[lightboxIndex].caption && (
                  <p className="text-sm text-foreground/80 bg-background/50 backdrop-blur-sm px-4 py-1.5 rounded-full">{images[lightboxIndex].caption}</p>
                )}
                <p className="text-xs text-muted-foreground">{lightboxIndex + 1} / {images.length}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
