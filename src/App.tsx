import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from '@shared/routes/ProtectedRoute';
import { MarketingPage } from '@apps/marketing/components/MarketingPage';
import { Dashboard } from '@apps/user-portal/components/Dashboard';
import { AdminBackend } from '@admin-backend/components/AdminBackend';
import { Toaster } from '@/components/ui/toaster';

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* 公开路由 - 营销首页 */}
      <Route 
        path="/" 
        element={
          <PublicOnlyRoute>
            <MarketingPage />
          </PublicOnlyRoute>
        } 
      />
      
      {/* 受保护路由 - 管理员后台 */}
      <Route 
        path="/dashboard/admin/*" 
        element={
          <ProtectedRoute>
            <AdminBackend />
          </ProtectedRoute>
        } 
      />

      {/* 受保护路由 - 用户Dashboard */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* 默认重定向 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;