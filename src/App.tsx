
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import LogisticsShipping from './pages/LogisticsShipping';
import InventoryManagement from './pages/InventoryManagement';
import RefundsDisputes from './pages/RefundsDisputes';
import SourcingPricing from './pages/SourcingPricing';
import PaymentsBilling from './pages/PaymentsBilling';
import ComplianceDocs from './pages/ComplianceDocs';
import SettingsAPI from './pages/SettingsAPI';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                } 
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="logistics" element={<LogisticsShipping />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="refunds" element={<RefundsDisputes />} />
                <Route path="sourcing" element={<SourcingPricing />} />
                <Route path="payments" element={<PaymentsBilling />} />
                <Route path="compliance" element={<ComplianceDocs />} />
                <Route path="settings" element={<SettingsAPI />} />
              </Route>
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
