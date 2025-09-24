import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageContainer } from '@shared/components/layout/PageContainer';
import { DashboardOverview } from '@shared/components/business/DashboardOverview';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

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
    <PageContainer className="space-y-8">
      {/* Dashboard Overview - 三栏布局 */}
      <DashboardOverview />
    </PageContainer>
  );
};
