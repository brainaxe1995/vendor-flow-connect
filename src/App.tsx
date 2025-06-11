
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SupplierLayout from "./components/layouts/SupplierLayout";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<SupplierLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrderManagement />} />
            {/* Placeholder routes for other modules */}
            <Route path="logistics" element={<div className="p-6">Logistics & Shipping (Coming Soon)</div>} />
            <Route path="products" element={<div className="p-6">Product Management (Coming Soon)</div>} />
            <Route path="sourcing" element={<div className="p-6">Sourcing & Pricing (Coming Soon)</div>} />
            <Route path="inventory" element={<div className="p-6">Inventory Management (Coming Soon)</div>} />
            <Route path="refunds" element={<div className="p-6">Refunds & Disputes (Coming Soon)</div>} />
            <Route path="payments" element={<div className="p-6">Payments & Billing (Coming Soon)</div>} />
            <Route path="communication" element={<div className="p-6">Communication Center (Coming Soon)</div>} />
            <Route path="compliance" element={<div className="p-6">Compliance & Docs (Coming Soon)</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics & Reports (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-6">Settings & API Integration (Coming Soon)</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
