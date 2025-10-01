import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageContainer } from '@shared/components/layout/PageContainer';
import { DashboardOverview } from '@shared/components/business/DashboardOverview';
import { AiDailyHero } from '@shared/components/business/AiDailyHero';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@shared/routes/routes';
import { useNavigate } from 'react-router-dom';
import { RedeemCDKDialog } from '@shared/components/business/RedeemCDKDialog';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

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
      {/* 顶部：AI 日报横幅摘要 */}
      <AiDailyHero />

      {/* 套餐即将到期提示（<=7天） */}
      {(() => {
        if (!user?.currentSubscriptionEndTime) return null;
        const end = new Date(user.currentSubscriptionEndTime as any).getTime();
        if (isNaN(end)) return null;
        const days = Math.floor((end - Date.now()) / 86400000);
        if (days < 0 || days > 7) return null;
        return (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-orange-700">
                您的套餐{user.currentSubscriptionPlanName ? `「${user.currentSubscriptionPlanName}」` : ''}将于
                <span className="mx-1 font-medium">{new Date(user.currentSubscriptionEndTime as any).toLocaleString('zh-CN')}</span>
                到期（剩余 {Math.max(0, days)} 天）。
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="honeySoft" onClick={() => navigate(ROUTES.MEMBERSHIP)}>续费 / 升级</Button>
                <Button size="sm" variant="honeySoft" onClick={() => setIsRedeemOpen(true)}>兑换码兑换</Button>
              </div>
            </div>
          </Card>
        );
      })()}
      {/* Dashboard Overview - 三栏布局 */}
      <DashboardOverview />
      <RedeemCDKDialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />
    </PageContainer>
  );
};
