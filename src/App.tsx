import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProfileSelection from "./pages/ProfileSelection";
import MayorDashboard from "./pages/MayorDashboard";
import MapPage from "./pages/MapPage";
import ProjectListPage from "./pages/ProjectListPage";
import AdminPanel from "./pages/AdminPanel";
import AdminProjectDetail from "./pages/AdminProjectDetail";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profiles" element={<ProfileSelection />} />
          <Route path="/mayor" element={<MayorDashboard />} />
          <Route path="/harita" element={<MapPage />} />
          <Route path="/projeler" element={<ProjectListPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/project/:id" element={<AdminProjectDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
