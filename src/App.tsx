import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from '@shared/routes/ProtectedRoute';
import { MarketingPage } from '@apps/marketing/components/MarketingPage';
import { LoginPage } from '@apps/marketing/components/LoginPage';
import { Dashboard } from '@apps/user-portal/components/Dashboard';
import { AdminBackend } from '@admin-backend/components/AdminBackend';
import { Toaster } from '@/components/ui/toaster';
import GithubOAuthCallbackPage from '@shared/components/business/GithubOAuthCallbackPage';
import { OAuth2AuthorizePage } from '@shared/components/business/OAuth2AuthorizePage';
import { MenuGuard } from '@shared/routes/MenuGuard';
import { TitleSetter } from '@shared/routes/TitleSetter';

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* GitHub OAuth 回调路由（公开） */}
      <Route
        path="/oauth/github/callback"
        element={<GithubOAuthCallbackPage />}
      />

      {/* OAuth2 授权页面（公开） */}
      <Route
        path="/oauth2/authorize"
        element={<OAuth2AuthorizePage />}
      />

      {/* 公开路由 - 营销首页 */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <MarketingPage />
          </PublicOnlyRoute>
        }
      />

      {/* 公开路由 - 登录页 */}
      <Route
        path="/login"
        element={<LoginPage />}
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

      {/* 受保护路由 - 用户Dashboard（含用户中心）。加入菜单权限守卫 */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <MenuGuard fallback="blocked">
              <Dashboard />
            </MenuGuard>
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
          {/* 根据路由设置默认页面标题，详情页可在页面内覆盖 */}
          <TitleSetter />
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
