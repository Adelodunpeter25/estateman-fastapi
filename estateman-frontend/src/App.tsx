
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import SaasManagement from "./pages/SaasManagement";
import Analytics from "./pages/Analytics";
import Realtors from "./pages/Realtors";
import RealtorDetail from "./pages/RealtorDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Properties from "./pages/Properties";
import SalesForce from "./pages/SalesForce";
import Commissions from "./pages/Commissions";
import Leads from "./pages/Leads";
import Referrals from "./pages/Referrals";
import Payments from "./pages/Payments";
import Marketing from "./pages/Marketing";
import Tasks from "./pages/Tasks";
import Events from "./pages/Events";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Accounting from "./pages/Accounting";
import Loyalty from "./pages/Loyalty";
import Newsletters from "./pages/Newsletters";
import Settings from "./pages/Settings";
import ClientPortal from "./pages/ClientPortal";
import RealtorPortal from "./pages/RealtorPortal";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/saas-management" element={<SaasManagement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/realtors" element={<Realtors />} />
          <Route path="/realtors/:id" element={<RealtorDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/sales-force" element={<SalesForce />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/events" element={<Events />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/newsletters" element={<Newsletters />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/realtor-portal" element={<RealtorPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
