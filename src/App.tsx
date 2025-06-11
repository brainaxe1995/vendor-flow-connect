
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
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
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={
              <ProtectedRoute>
                <SupplierLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="logistics" element={<LogisticsShipping />} />
              <Route path="products" element={
                <ProtectedRoute requiredRole="admin">
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="sourcing" element={
                <ProtectedRoute requiredRole="admin">
                  <SourcingPricing />
                </ProtectedRoute>
              } />
              <Route path="inventory" element={
                <ProtectedRoute requiredRole="admin">
                  <InventoryManagement />
                </ProtectedRoute>
              } />
              <Route path="refunds" element={<RefundsDisputes />} />
              <Route path="payments" element={
                <ProtectedRoute requiredRole="admin">
                  <PaymentsBilling />
                </ProtectedRoute>
              } />
              <Route path="compliance" element={<ComplianceDocs />} />
              <Route path="analytics" element={<AnalyticsReports />} />
              <Route path="settings" element={
                <ProtectedRoute requiredRole="admin">
                  <SettingsAPI />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
