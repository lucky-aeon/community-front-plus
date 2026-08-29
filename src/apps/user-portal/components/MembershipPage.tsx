import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MembershipBadge, type MembershipTier } from '@shared/components/ui/MembershipBadge';
import { RedeemCDKDialog } from '@shared/components/business/RedeemCDKDialog';
import { ROUTES } from '@shared/routes/routes';

const formatDate = (value?: string | Date) => {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
};

export const MembershipPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  const endTime = user?.currentSubscriptionEndTime
    ? new Date(user.currentSubscriptionEndTime as string | Date)
    : null;
  const isActive = Boolean(endTime && !Number.isNaN(endTime.getTime()) && endTime.getTime() > Date.now());

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">会员信息</h1>
        <p className="mt-2 text-gray-600">查看当前账户已有的会员权益和有效期</p>
      </div>

      {user?.currentSubscriptionPlanName ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback>{(user.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <MembershipBadge
                    tier={(user.membershipTier || 'basic') as MembershipTier}
                    size="sm"
                    text={user.currentSubscriptionPlanName}
                    level={user.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                  />
                  <Badge variant={isActive ? 'success' : 'secondary'}>
                    {isActive ? '有效' : '已过期'}
                  </Badge>
                </div>
                <div className="mt-2 text-sm leading-6 text-gray-600">
                  <div>生效时间：{formatDate(user.currentSubscriptionStartTime as string | Date | undefined)}</div>
                  <div>到期时间：{formatDate(user.currentSubscriptionEndTime as string | Date | undefined)}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(ROUTES.USER_BACKEND_PROFILE)}>
                查看个人资料
              </Button>
              <Button variant="honeySoft" onClick={() => setIsRedeemOpen(true)}>
                激活兑换码
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="px-6 py-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">暂无会员信息</h2>
          <p className="mt-2 text-sm text-gray-600">当前账户没有可用的会员权益。</p>
          <Button className="mt-5" variant="honeySoft" onClick={() => setIsRedeemOpen(true)}>
            激活兑换码
          </Button>
        </Card>
      )}

      <RedeemCDKDialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />
    </div>
  );
};
