import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from '@shared/routes/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { MenuGuard } from '@shared/routes/MenuGuard';
import { TitleSetter } from '@shared/routes/TitleSetter';
import { LoadingPage } from '@shared/components/common/LoadingPage';

const MarketingPage = lazy(() => import('@apps/marketing/components/MarketingPage').then((module) => ({ default: module.MarketingPage })));
const AboutPage = lazy(() => import('@apps/marketing/components/AboutPage').then((module) => ({ default: module.AboutPage })));
const MobileDownloadPage = lazy(() => import('@apps/marketing/components/MobileDownloadPage').then((module) => ({ default: module.MobileDownloadPage })));
const LoginPage = lazy(() => import('@apps/marketing/components/LoginPage').then((module) => ({ default: module.LoginPage })));
const Dashboard = lazy(() => import('@apps/user-portal/components/Dashboard').then((module) => ({ default: module.Dashboard })));
const AdminBackend = lazy(() => import('@admin-backend/components/AdminBackend').then((module) => ({ default: module.AdminBackend })));
const GithubOAuthCallbackPage = lazy(() => import('@shared/components/business/GithubOAuthCallbackPage'));
const OAuth2AuthorizePage = lazy(() => import('@shared/components/business/OAuth2AuthorizePage').then((module) => ({ default: module.OAuth2AuthorizePage })));

const AppContent: React.FC = () => {
  return (
    <Suspense fallback={<LoadingPage text="页面加载中..." />}>
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

      <Route
        path="/about"
        element={<AboutPage />}
      />

      <Route
        path="/mobile"
        element={<MobileDownloadPage />}
      />

      <Route
        path="/download"
        element={<Navigate to="/mobile" replace />}
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
    </Suspense>
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
