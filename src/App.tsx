import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalHeader } from "@/components/GlobalHeader";
import Uygulama from "./pages/Uygulama";
import MarketingHome from "./pages/marketing/HomePage";
import BizKimizPage from "./pages/marketing/BizKimizPage";
import HizmetlerMarketingPage from "./pages/marketing/HizmetlerPage";
import IletisimPage from "./pages/marketing/IletisimPage";
import ProfileSelection from "./pages/ProfileSelection";
import MayorDashboard from "./pages/MayorDashboard";
import MapPage from "./pages/MapPage";
import ProjectsPage from "./pages/ProjectsPage";
import HaberlerPage from "./pages/HaberlerPage";
import HizmetlerPage from "./pages/HizmetlerPage";
import ProfilPage from "./pages/ProfilPage";
import AdminPanel from "./pages/AdminPanel";
import AdminProjectDetail from "./pages/AdminProjectDetail";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectDetail from "./pages/ProjectDetail";
import IhalelerPage from "./pages/IhalelerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalHeader />
        <Routes>
          {/* Marketing site (own header, no top padding wrapper) */}
          <Route path="/" element={<MarketingHome />} />
          <Route path="/biz-kimiz" element={<BizKimizPage />} />
          <Route path="/hizmetler" element={<HizmetlerMarketingPage />} />
          <Route path="/iletisim" element={<IletisimPage />} />

          {/* Application (uses GlobalHeader with pt-14) */}
          <Route
            path="/*"
            element={
              <div className="pt-14">
                <Routes>
                  <Route path="/uygulama" element={<Uygulama />} />
                  <Route path="/profiles" element={<ProfileSelection />} />
                  <Route path="/mayor" element={<MayorDashboard />} />
                  <Route path="/harita" element={<MapPage />} />
                  <Route path="/projeler" element={<ProjectsPage />} />
                  <Route path="/kategoriler" element={<ProjectsPage />} />
                  <Route path="/haberler" element={<HaberlerPage />} />
                  <Route path="/ihaleler" element={<IhalelerPage />} />
                  <Route path="/vatandas-hizmetleri" element={<HizmetlerPage />} />
                  <Route path="/profil" element={<ProfilPage />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="/admin/project/:id" element={<ProtectedRoute><AdminProjectDetail /></ProtectedRoute>} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
