import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/lib/externalDb';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';

interface ProjectCarouselProps {
  projects: Project[];
  title: string;
  status: string;
}

const STATUS_TR: Record<string, string> = {
  'In Progress': 'Devam Ediyor',
  'Completed': 'Tamamlandı',
  'Planned': 'Planlanıyor',
};

export const ProjectCarousel = ({ projects, title, status }: ProjectCarouselProps) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0, hasMoved: false });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainer.current) return;
    setIsDragging(true);
    dragState.current = {
      startX: e.pageX - scrollContainer.current.offsetLeft,
      scrollLeft: scrollContainer.current.scrollLeft,
      hasMoved: false,
    };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainer.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    if (Math.abs(walk) > 3) dragState.current.hasMoved = true;
    scrollContainer.current.scrollLeft = dragState.current.scrollLeft - walk;
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragState.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  if (projects.length === 0) return null;

  const displayTitle = STATUS_TR[title] || title;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{displayTitle}</h2>
          <span className="text-sm text-muted-foreground font-medium">({projects.length} proje)</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="bg-secondary/60 border-border/50 hover:bg-secondary/80 hover:border-accent/50 hover:text-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="bg-secondary/60 border-border/50 hover:bg-secondary/80 hover:border-accent/50 hover:text-accent"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainer}
        className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
