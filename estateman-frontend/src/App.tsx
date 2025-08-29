
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionManager } from "@/components/auth/SessionManager";
import { AppStoreProvider } from "@/store/app-store";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import SaasManagement from "./pages/SaasManagement";

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
    <AuthProvider>
      <SessionManager />
      <AppStoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/saas-management" element={<ProtectedRoute><SaasManagement /></ProtectedRoute>} />

              <Route path="/realtors" element={<ProtectedRoute><Realtors /></ProtectedRoute>} />
              <Route path="/realtors/:id" element={<ProtectedRoute><RealtorDetail /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
              <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
              <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
              <Route path="/sales-force" element={<ProtectedRoute><SalesForce /></ProtectedRoute>} />
              <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
              <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
              <Route path="/newsletters" element={<ProtectedRoute><Newsletters /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/client-portal" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
              <Route path="/realtor-portal" element={<ProtectedRoute><RealtorPortal /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppStoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
