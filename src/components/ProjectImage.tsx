import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const ProjectImage = ({ src, alt = 'Proje', className }: ProjectImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn('w-full h-full bg-gradient-to-br from-secondary via-card to-secondary/80 flex flex-col items-center justify-center gap-2', className)}>
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-accent/60" />
        </div>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">Kepez Belediyesi</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
};
