import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@shared/components/business/AuthModal';
import { ROUTES } from '@shared/routes/routes';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

/**
 * 登录页面组件
 *
 * 功能：
 * 1. 如果用户已登录，重定向到 dashboard
 * 2. 如果用户未登录，自动打开登录弹窗
 * 3. 登录成功后重定向到 dashboard
 * 4. 关闭弹窗后返回首页
 */
export const LoginPage: React.FC = () => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 页面标题
  useDocumentTitle('登录');

  useEffect(() => {
    // 等待认证初始化完成
    if (isInitializing) return;

    if (user) {
      // 已登录，重定向到 dashboard
      navigate(ROUTES.DASHBOARD_HOME, { replace: true });
    } else {
      // 未登录，打开登录弹窗
      setIsAuthModalOpen(true);
    }
  }, [user, isInitializing, navigate]);

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
    // 关闭弹窗后返回首页
    navigate(ROUTES.HOME, { replace: true });
  };

  // 在初始化或已登录时显示空白页（避免闪烁）
  if (isInitializing || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
