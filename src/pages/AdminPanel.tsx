import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { LogOut, Plus } from 'lucide-react';
import { externalDb } from '@/lib/externalDb';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  status: z.enum(['In Progress', 'Completed', 'Planned']),
  budget: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Budget must be a valid number',
  }),
  progress: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, 'Progress must be between 0 and 100'),
  image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const AdminPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const statusValue = watch('status');
  const budgetValue = watch('budget');
  const progressValue = watch('progress');

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await externalDb.addProject({
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        budget: Number(data.budget),
        progress: Number(data.progress),
        image_url: data.image_url || '',
        created_at: new Date().toISOString(),
      });

      toast.success('Project added successfully!');
      reset();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast.error('Failed to add project. Please try again.');
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Project Administration</h1>
            <p className="text-sm text-muted-foreground">Add and manage municipal projects</p>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-secondary/30 backdrop-blur-sm border-border/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Project Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., New Public Library"
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
              />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed description of the project..."
                rows={4}
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g., Urban Planning, Infrastructure, Social"
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
              />
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">
                Status
              </Label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-input/50 border border-border/50 rounded-md text-foreground focus:border-accent outline-none transition-colors"
              >
                <option value="">Select status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
              </select>
              {errors.status && <p className="text-destructive text-sm">{errors.status.message}</p>}
            </div>

            {/* Budget & Progress Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-foreground">
                  Budget ($)
                </Label>
                <Input
                  id="budget"
                  {...register('budget')}
                  type="number"
                  placeholder="e.g., 500000"
                  className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
                {errors.budget && <p className="text-destructive text-sm">{errors.budget.message}</p>}
                {budgetValue && (
                  <p className="text-xs text-accent">
                    ${Number(budgetValue).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Label htmlFor="progress" className="text-foreground">
                  Progress (%)
                </Label>
                <Input
                  id="progress"
                  {...register('progress')}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
                {errors.progress && (
                  <p className="text-destructive text-sm">{errors.progress.message}</p>
                )}
                {progressValue && (
                  <p className="text-xs text-accent">{progressValue}% complete</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-foreground">
                Image URL (Optional)
              </Label>
              <Input
                id="image_url"
                {...register('image_url')}
                type="url"
                placeholder="https://example.com/image.jpg"
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
              />
              {errors.image_url && (
                <p className="text-destructive text-sm">{errors.image_url.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 gap-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Adding Project...' : 'Add Project'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
