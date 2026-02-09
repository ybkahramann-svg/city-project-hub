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
  LogOut,
  Plus,
  Search,
  Trash2,
  Save,
  CalendarIcon,
  Building2,
  User,
  Target,
  FileText,
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

  // When a project is selected, populate the form
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
        // Extended fields — these aren't in DB yet, so leave empty
        setValue('department', '');
        setValue('manager_name', '');
        setValue('impact_stat', '');
        setStartDate(undefined);
        setEndDate(undefined);
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
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        budget: Number(data.budget),
        progress: Number(data.progress),
        image_url: data.image_url || '',
        district: data.district || '',
        neighborhood: data.neighborhood || '',
      };

      if (isEditMode && selectedId) {
        await updateProject(selectedId, payload);
        toast.success('Project updated successfully!');
      } else {
        await addProject({ ...payload, created_at: new Date().toISOString() });
        toast.success('Project created successfully!');
        handleCreateNew();
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update project.' : 'Failed to create project.');
      console.error(error);
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

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Project Administration</h1>
            <p className="text-xs text-muted-foreground">CRUD Management Dashboard</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2 border-border/50 hover:border-accent/50 hover:text-accent"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </Button>
        </div>
      </header>

      {/* Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Project List */}
        <aside className="w-80 flex-shrink-0 border-r border-border/50 bg-secondary/20 flex flex-col">
          {/* Create New */}
          <div className="p-4 border-b border-border/30">
            <Button
              onClick={handleCreateNew}
              className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="w-4 h-4" />
              Create New Project
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-9 bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No projects found</div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedId(project.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border/20 transition-colors flex items-center gap-3',
                    selectedId === project.id
                      ? 'bg-accent/10 border-l-2 border-l-accent'
                      : 'hover:bg-secondary/40'
                  )}
                >
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0',
                      statusDotColor[project.status] || 'bg-muted-foreground'
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.status}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right Panel — Editor Form */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {/* Form Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {isEditMode ? 'Edit Project' : 'New Project'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEditMode ? `Editing: ${watch('title') || '...'}` : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              {isEditMode && (
                <Badge className="bg-accent/15 text-accent border-accent/20 text-xs">Edit Mode</Badge>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                  Project Title
                </Label>
                <Input
                  {...register('title')}
                  placeholder="e.g., New Public Library"
                  className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                  Description
                </Label>
                <Textarea
                  {...register('description')}
                  placeholder="Detailed description..."
                  rows={3}
                  className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
                {errors.description && (
                  <p className="text-destructive text-xs">{errors.description.message}</p>
                )}
              </div>

              {/* Category & Status */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Category
                  </Label>
                  <Input
                    {...register('category')}
                    placeholder="e.g., Infrastructure"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                  {errors.category && (
                    <p className="text-destructive text-xs">{errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Status
                  </Label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 bg-input/50 border border-border/50 rounded-md text-foreground focus:border-accent outline-none transition-colors text-sm"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors.status && (
                    <p className="text-destructive text-xs">{errors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Budget & Progress */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Budget (₺)
                  </Label>
                  <Input
                    {...register('budget')}
                    type="number"
                    placeholder="e.g., 500000"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                  {errors.budget && (
                    <p className="text-destructive text-xs">{errors.budget.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Progress (%)
                  </Label>
                  <Input
                    {...register('progress')}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                  {errors.progress && (
                    <p className="text-destructive text-xs">{errors.progress.message}</p>
                  )}
                </div>
              </div>

              {/* Divider — Extended Fields */}
              <div className="pt-2 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/70">
                  Management Details
                </p>
                <div className="h-px bg-gradient-to-r from-accent/30 to-transparent mt-2" />
              </div>

              {/* Department & Manager */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-accent" /> Department
                  </Label>
                  <Input
                    {...register('department')}
                    placeholder="e.g., Fen İşleri Daire Başkanlığı"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" /> Manager Name
                  </Label>
                  <Input
                    {...register('manager_name')}
                    placeholder="e.g., Ahmet Yılmaz"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-input/50 border-border/50',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Target End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-input/50 border-border/50',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                <Label className="text-foreground text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent" /> Impact Stat
                </Label>
                <Input
                  {...register('impact_stat')}
                  placeholder="e.g., 5000 People Served Daily"
                  className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                  Image URL
                </Label>
                <Input
                  {...register('image_url')}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
                {errors.image_url && (
                  <p className="text-destructive text-xs">{errors.image_url.message}</p>
                )}
              </div>

              {/* District & Neighborhood */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    District
                  </Label>
                  <Input
                    {...register('district')}
                    placeholder="e.g., Central District"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-widest font-semibold">
                    Neighborhood
                  </Label>
                  <Input
                    {...register('neighborhood')}
                    placeholder="e.g., Riverside"
                    className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-5 gap-2"
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
                        className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive py-5 gap-2"
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
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
