
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import SupplierLayout from "./components/layouts/SupplierLayout";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import LogisticsShipping from "./pages/LogisticsShipping";
import ProductManagement from "./pages/ProductManagement";
import SourcingPricing from "./pages/SourcingPricing";
import InventoryManagement from "./pages/InventoryManagement";
import RefundsDisputes from "./pages/RefundsDisputes";
import PaymentsBilling from "./pages/PaymentsBilling";
import ComplianceDocs from "./pages/ComplianceDocs";
import AnalyticsReports from "./pages/AnalyticsReports";
import SettingsAPI from "./pages/SettingsAPI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={
              <ProtectedRoute>
                <SupplierLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="logistics" element={<LogisticsShipping />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="sourcing" element={<SourcingPricing />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="refunds" element={<RefundsDisputes />} />
              <Route path="payments" element={<PaymentsBilling />} />
              <Route path="compliance" element={<ComplianceDocs />} />
              <Route path="analytics" element={<AnalyticsReports />} />
              <Route path="settings" element={<SettingsAPI />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
