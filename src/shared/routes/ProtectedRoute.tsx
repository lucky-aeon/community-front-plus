import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  // 如果正在加载用户状态，显示加载动画
  if (isInitializing) {
    return <LoadingSpinner text="验证用户身份中..." />;
  }

  // 如果用户未登录，重定向到首页
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isInitializing } = useAuth();

  // 如果正在加载用户状态，显示加载动画
  if (isInitializing) {
    return <LoadingSpinner text="加载中..." />;
  }

  // 如果用户已登录，重定向到Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
