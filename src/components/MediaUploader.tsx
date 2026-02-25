import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MediaUploader = ({ open, onOpenChange }: MediaUploaderProps) => {
  const { data: projects = [] } = useProjects();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<'project' | 'general'>('general');
  const [projectId, setProjectId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const accepted = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (accepted.length === 0) { toast.error('Sadece görsel dosyaları yüklenebilir'); return; }

    setFiles(prev => [...prev, ...accepted]);
    accepted.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Lütfen en az bir görsel seçin'); return; }
    if (category === 'project' && !projectId) { toast.error('Lütfen bir proje seçin'); return; }

    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `${category}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(filePath);

        const { error: dbError } = await supabase.from('gallery_images').insert({
          image_url: urlData.publicUrl,
          category,
          project_id: category === 'project' ? projectId : null,
        });
        if (dbError) throw dbError;
      }

      toast.success(`${files.length} görsel başarıyla yüklendi!`);
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      setFiles([]);
      setPreviews([]);
      setCategory('general');
      setProjectId('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setCategory('general');
    setProjectId('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="bg-card border-border/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent" />
            Medya Yükle
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Görselleri sürükleyip bırakın veya seçmek için tıklayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as 'project' | 'general')}>
                <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-[9999]">
                  <SelectItem value="general">Genel Görsel</SelectItem>
                  <SelectItem value="project">Proje Görseli</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {category === 'project' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Proje</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="bg-secondary/30 border-border/20 rounded-lg h-9 text-sm">
                    <SelectValue placeholder="Proje seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-[9999] max-h-[200px]">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              dragOver
                ? "border-accent bg-accent/5 scale-[1.01]"
                : "border-border/30 hover:border-accent/50 hover:bg-secondary/20"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Buraya sürükleyip bırakın veya <span className="text-accent font-medium">seçmek için tıklayın</span>
            </p>
            <p className="text-[11px] text-muted-foreground/50 mt-1">PNG, JPG, WEBP — Maks 10 dosya</p>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/20">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10 gap-2 rounded-lg"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Yükleniyor...' : `${files.length} Görsel Yükle`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
