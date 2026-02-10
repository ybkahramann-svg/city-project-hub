import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Save,
  CalendarIcon,
  Building2,
  User,
  Target,
  FileText,
  MapPin,
} from 'lucide-react';
import { addProject, updateProject, deleteProject, Project } from '@/lib/externalDb';
import { useProjects } from '@/hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().min(1, 'Please select a category').max(100),
  status: z.enum(['In Progress', 'Completed', 'Planned']),
  budget: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Budget must be a valid number',
  }),
  progress: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, 'Progress must be between 0 and 100'),
  image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  district: z.string().max(100).optional().or(z.literal('')),
  neighborhood: z.string().max(100).optional().or(z.literal('')),
  department: z.string().max(200).optional().or(z.literal('')),
  manager_name: z.string().max(100).optional().or(z.literal('')),
  impact_stat: z.string().max(200).optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const statusDotColor: Record<string, string> = {
  'In Progress': 'bg-accent',
  Completed: 'bg-green-400',
  Planned: 'bg-blue-400',
};

const PremiumInput = ({
  className,
  ...props
}: React.ComponentProps<typeof Input>) => (
  <Input
    className={cn(
      'bg-secondary/40 border-border/30 text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:bg-secondary/60 rounded-xl h-11 px-4 transition-all duration-200',
      className
    )}
    {...props}
  />
);

export const AdminPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const isEditMode = !!selectedId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'Planned',
      progress: '0',
    },
  });

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedId) {
      const project = projects.find((p) => p.id === selectedId);
      if (project) {
        setValue('title', project.title);
        setValue('description', project.description || '');
        setValue('category', project.category || '');
        setValue('status', project.status);
        setValue('budget', String(project.budget || ''));
        setValue('progress', String(project.progress || 0));
        setValue('image_url', project.image_url || '');
        setValue('district', project.district || '');
        setValue('neighborhood', project.neighborhood || '');
        setValue('department', project.department || '');
        setValue('manager_name', project.manager_name || '');
        setValue('impact_stat', project.impact_stat || '');
        setStartDate(project.start_date ? new Date(project.start_date) : undefined);
        setEndDate(project.end_date ? new Date(project.end_date) : undefined);
      }
    }
  }, [selectedId, projects, setValue]);

  const handleCreateNew = () => {
    setSelectedId(null);
    reset({
      title: '',
      description: '',
      category: '',
      status: 'Planned',
      budget: '',
      progress: '0',
      image_url: '',
      district: '',
      neighborhood: '',
      department: '',
      manager_name: '',
      impact_stat: '',
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        budget: Number(data.budget),
        progress: Number(data.progress),
        image_url: data.image_url || null,
        district: data.district || null,
        neighborhood: data.neighborhood || null,
        department: data.department || null,
        manager_name: data.manager_name || null,
        impact_stat: data.impact_stat || null,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      };

      if (isEditMode && selectedId) {
        await updateProject(selectedId, payload as any);
        toast.success('Project updated successfully!');
      } else {
        await addProject({ ...payload, created_at: new Date().toISOString() } as any);
        toast.success('Project created successfully!');
        handleCreateNew();
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error: any) {
      const msg = error?.message || (isEditMode ? 'Failed to update project.' : 'Failed to create project.');
      toast.error(msg);
      console.error('Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      await deleteProject(selectedId);
      toast.success('Project deleted.');
      handleCreateNew();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast.error('Failed to delete project.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* ── Left Sidebar (30%) ── */}
      <aside className="w-[30%] min-w-[280px] max-w-[400px] flex-shrink-0 border-r border-border/40 bg-card/40 backdrop-blur-xl flex flex-col">
        {/* Sidebar Header */}
        <div className="sticky top-0 z-10 bg-card/60 backdrop-blur-xl border-b border-border/30 p-4 space-y-3">
          {/* Create New Button */}
          <Button
            onClick={handleCreateNew}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11 font-semibold shadow-lg shadow-accent/10"
          >
            <Plus className="w-4 h-4" />
            Create New
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 rounded-xl h-10 focus:border-accent/40"
            />
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No projects found</div>
          ) : (
            filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                className={cn(
                  'w-full text-left px-4 py-3.5 border-b border-border/10 transition-all duration-200 group',
                  selectedId === project.id
                    ? 'bg-accent/10 border-l-[3px] border-l-accent'
                    : 'hover:bg-secondary/30 border-l-[3px] border-l-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ring-2 ring-offset-1 ring-offset-background',
                      statusDotColor[project.status] || 'bg-muted-foreground',
                      selectedId === project.id ? 'ring-accent/30' : 'ring-transparent'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-medium truncate transition-colors',
                      selectedId === project.id ? 'text-accent' : 'text-foreground group-hover:text-foreground/90'
                    )}>
                      {project.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {project.district && (
                        <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.district}
                        </span>
                      )}
                      {!project.district && (
                        <span className="text-[11px] text-muted-foreground/50">{project.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border/30 p-3 bg-card/40">
          <p className="text-[10px] text-muted-foreground/50 text-center tracking-wider uppercase">
            {filteredProjects.length} Projects
          </p>
        </div>
      </aside>

      {/* ── Right Panel (70%) ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-xl border-b border-border/30 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isEditMode ? 'Edit Project' : 'New Project'}
              </h2>
              <p className="text-[11px] text-muted-foreground/70">
                {isEditMode ? watch('title') || '...' : 'Fill in the details to create'}
              </p>
            </div>
            {isEditMode && (
              <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] ml-2">
                EDITING
              </Badge>
            )}
          </div>

          <Button
            onClick={() => navigate('/mayor')}
            variant="ghost"
            size="sm"
            className="gap-2 bg-secondary/30 backdrop-blur-md border border-border/30 hover:bg-secondary/50 hover:border-accent/30 text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </header>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                  Project Title
                </Label>
                <PremiumInput {...register('title')} placeholder="e.g., New Public Library" />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                  Description
                </Label>
                <Textarea
                  {...register('description')}
                  placeholder="Detailed description..."
                  rows={3}
                  className="bg-secondary/40 border-border/30 text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:bg-secondary/60 rounded-xl px-4 py-3 transition-all duration-200 resize-none"
                />
                {errors.description && (
                  <p className="text-destructive text-xs">{errors.description.message}</p>
                )}
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Category
                  </Label>
                  <PremiumInput {...register('category')} placeholder="e.g., Infrastructure" />
                  {errors.category && (
                    <p className="text-destructive text-xs">{errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Status
                  </Label>
                  <select
                    {...register('status')}
                    className="w-full h-11 px-4 bg-secondary/40 border border-border/30 rounded-xl text-foreground focus:border-accent/60 focus:bg-secondary/60 outline-none transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Budget & Progress */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Budget (₺)
                  </Label>
                  <PremiumInput {...register('budget')} type="number" placeholder="e.g., 500000" />
                  {errors.budget && (
                    <p className="text-destructive text-xs">{errors.budget.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Progress (%)
                  </Label>
                  <PremiumInput {...register('progress')} type="number" min="0" max="100" placeholder="0-100" />
                  {errors.progress && (
                    <p className="text-destructive text-xs">{errors.progress.message}</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="pt-3 pb-1">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60">
                    Management Details
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
                </div>
              </div>

              {/* Department & Manager */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-accent/70" /> Department
                  </Label>
                  <PremiumInput {...register('department')} placeholder="e.g., Fen İşleri Daire Başkanlığı" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center gap-1.5">
                    <User className="w-3 h-3 text-accent/70" /> Manager Name
                  </Label>
                  <PremiumInput {...register('manager_name')} placeholder="e.g., Ahmet Yılmaz" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-secondary/40 border-border/30 rounded-xl h-11 hover:bg-secondary/60 hover:border-accent/40 transition-all duration-200',
                          !startDate && 'text-muted-foreground/60'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-accent/60" />
                        {startDate ? format(startDate, 'dd.MM.yyyy') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Target End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-secondary/40 border-border/30 rounded-xl h-11 hover:bg-secondary/60 hover:border-accent/40 transition-all duration-200',
                          !endDate && 'text-muted-foreground/60'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-accent/60" />
                        {endDate ? format(endDate, 'dd.MM.yyyy') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Impact Stat */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-accent/70" /> Impact Stat
                </Label>
                <PremiumInput {...register('impact_stat')} placeholder="e.g., 5000 People Served Daily" />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                  Image URL
                </Label>
                <PremiumInput {...register('image_url')} type="url" placeholder="https://example.com/image.jpg" />
                {errors.image_url && (
                  <p className="text-destructive text-xs">{errors.image_url.message}</p>
                )}
              </div>

              {/* District & Neighborhood */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    District
                  </Label>
                  <PremiumInput {...register('district')} placeholder="e.g., Central District" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
                    Neighborhood
                  </Label>
                  <PremiumInput {...register('neighborhood')} placeholder="e.g., Riverside" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-6 pb-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 gap-2 rounded-xl shadow-lg shadow-accent/15 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                      ? 'Update Project'
                      : 'Create Project'}
                </Button>

                {isEditMode && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 h-12 gap-2 rounded-xl transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Delete this project?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This action cannot be undone. The project "{watch('title')}" will be
                          permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
