import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMenuCodeByPathname } from '@shared/constants/menu-codes';
import { useUserMenuCodes } from '@/hooks/useUserMenuCodes';

interface MenuGuardProps {
  children: React.ReactNode;
  // 可选：显式指定菜单码；不指定则按路由匹配
  requiredCode?: string | null;
  // fallback 策略：redirect（默认重定向首页）或 blocked（渲染无权限提示）
  fallback?: 'redirect' | 'blocked';
}

export const MenuGuard: React.FC<MenuGuardProps> = ({ children, requiredCode, fallback = 'redirect' }) => {
  const location = useLocation();
  const { isAllowed, isLoading } = useUserMenuCodes();

  // 仅作用于用户前台（/dashboard/**），不影响 /dashboard/admin/** 在 App.tsx 已单独路由
  const code = requiredCode ?? getMenuCodeByPathname(location.pathname);
  if (!code) return <>{children}</>;
  if (isLoading) return <>{children}</>; // 加载中先放行，避免闪烁
  if (isAllowed(code)) return <>{children}</>;

  if (fallback === 'blocked') {
    return <NoAccess />;
  }
  return <Navigate to="/dashboard/home" replace />;
};

const NoAccess: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-center">
    <div className="text-6xl mb-4">🚫</div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-2">无权限访问</h2>
    <p className="text-gray-600 mb-6">当前账户的套餐未包含该功能入口，请联系管理员或升级套餐。</p>
    <a href="/dashboard/home" className="inline-flex items-center px-4 py-2 rounded-md bg-honey-500 hover:bg-honey-600 text-white">返回首页</a>
  </div>
);

