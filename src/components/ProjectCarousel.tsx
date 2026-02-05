import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/lib/externalDb';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';

interface ProjectCarouselProps {
  projects: Project[];
  title: string;
  status: string;
}

export const ProjectCarousel = ({ projects, title, status }: ProjectCarouselProps) => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (projects.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects</p>
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

      {/* Carousel */}
      <div
        ref={scrollContainer}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
