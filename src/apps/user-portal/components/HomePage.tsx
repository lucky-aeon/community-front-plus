import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageContainer } from '@shared/components/layout/PageContainer';
import { HomePortalDashboard } from '@shared/components/business/HomePortalDashboard';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  // 页面标题
  useDocumentTitle('社区首页');

  if (!user) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-warm-gray-600">登录后查看个性化的社区内容</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HomePortalDashboard userName={user.name} />
    </PageContainer>
  );
};
