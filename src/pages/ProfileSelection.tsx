import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Briefcase } from 'lucide-react';

export const ProfileSelection = () => {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const selectRole = (role: string) => {
    localStorage.setItem('userRole', role);
    navigate(role === 'mayor' ? '/mayor' : '/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-12 max-w-4xl px-4">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            City Mayor Project Archive
          </h1>
          <p className="text-xl text-muted-foreground">Who is watching?</p>
        </div>

        {/* Profile Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {/* Mayor Card */}
          <button
            onMouseEnter={() => setHoveredRole('mayor')}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => selectRole('mayor')}
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
              hoveredRole === 'mayor'
                ? 'border-accent/80 bg-secondary/60 scale-105 shadow-2xl shadow-accent/30'
                : 'border-border/50 bg-secondary/30 hover:border-accent/50 hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 group-hover:from-primary/20 transition-all duration-300" />
            <div className="relative p-12 space-y-6">
              <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Crown className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">The Mayor</h2>
                <p className="text-muted-foreground text-sm">View and track all municipal projects</p>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Enter as Mayor
              </Button>
            </div>
          </button>

          {/* Staff Admin Card */}
          <button
            onMouseEnter={() => setHoveredRole('admin')}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => selectRole('admin')}
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
              hoveredRole === 'admin'
                ? 'border-accent/80 bg-secondary/60 scale-105 shadow-2xl shadow-accent/30'
                : 'border-border/50 bg-secondary/30 hover:border-accent/50 hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 group-hover:from-primary/20 transition-all duration-300" />
            <div className="relative p-12 space-y-6">
              <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Briefcase className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Staff Admin</h2>
                <p className="text-muted-foreground text-sm">Add and manage projects in the system</p>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Enter as Admin
              </Button>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground pt-8">
          Powered by Lovable Cloud
        </p>
      </div>
    </div>
  );
};

export default ProfileSelection;
