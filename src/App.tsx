import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import VehiclesPage from "./pages/VehiclesPage";
import ProblemsPage from "./pages/ProblemsPage";
import SymptomsPage from "./pages/SymptomsPage";
import DTCCodesPage from "./pages/DTCCodesPage";
import SensorsPage from "./pages/SensorsPage";
import ActuatorsPage from "./pages/ActuatorsPage";
import PartsPage from "./pages/PartsPage";
import SolutionsPage from "./pages/SolutionsPage";
import TheoryPage from "./pages/TheoryPage";
import SafetyPage from "./pages/SafetyPage";
import CostsPage from "./pages/CostsPage";
import ToolsPage from "./pages/ToolsPage";
import RelationsPage from "./pages/RelationsPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/symptoms" element={<SymptomsPage />} />
              <Route path="/dtc-codes" element={<DTCCodesPage />} />
              <Route path="/sensors" element={<SensorsPage />} />
              <Route path="/actuators" element={<ActuatorsPage />} />
              <Route path="/parts" element={<PartsPage />} />
              <Route path="/solutions" element={<SolutionsPage />} />
              <Route path="/theory" element={<TheoryPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/relations" element={<RelationsPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/costs" element={<CostsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
