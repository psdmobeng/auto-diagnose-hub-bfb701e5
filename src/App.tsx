import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
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
              <Route path="/search" element={<Dashboard />} />
              <Route path="/vehicles" element={<Dashboard />} />
              <Route path="/problems" element={<Dashboard />} />
              <Route path="/symptoms" element={<Dashboard />} />
              <Route path="/dtc-codes" element={<Dashboard />} />
              <Route path="/sensors" element={<Dashboard />} />
              <Route path="/actuators" element={<Dashboard />} />
              <Route path="/parts" element={<Dashboard />} />
              <Route path="/solutions" element={<Dashboard />} />
              <Route path="/theory" element={<Dashboard />} />
              <Route path="/tools" element={<Dashboard />} />
              <Route path="/relations" element={<Dashboard />} />
              <Route path="/safety" element={<Dashboard />} />
              <Route path="/costs" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
