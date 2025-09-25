import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@shared/utils/toast';
import type { SubscriptionPlanDTO, MembershipPlan } from '@shared/types';
import { AppSubscriptionPlansService } from '@shared/services/api';
import { PricingCard } from '@shared/components/business/PricingCard';
import { PaymentModal } from '@shared/components/business/PaymentModal';
import { cn } from '@shared/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { MembershipBadge, type MembershipTier } from '@shared/components/ui/MembershipBadge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@shared/routes/routes';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const MembershipPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlanDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      try {
        const list = await AppSubscriptionPlansService.getPlans();
        if (!cancelled) setPlans(list);
      } catch {
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPlans();
    return () => { cancelled = true; };
  }, []);

  const handleSelect = (plan: SubscriptionPlanDTO) => {
    showToast.success(`演示：选择了套餐「${plan.name}」，后续接入支付流程`);
  };

  // 映射为首页相同的 MembershipPlan 结构，以复用 PricingCard UI
  const mappedPlans: MembershipPlan[] = useMemo(() => {
    if (!plans) return [];
    const toTier = (level: number): 'basic' | 'premium' | 'vip' => {
      if (level >= 3) return 'vip';
      if (level === 2) return 'premium';
      return 'basic';
    };
    const toDuration = (months: number): string => (months === 12 ? 'per year' : 'per month');
    return plans
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((p) => ({
        id: p.id,
        name: p.name,
        tier: toTier(p.level),
        price: p.price,
        originalPrice: p.originalPrice,
        duration: toDuration(p.validityMonths),
        features: p.benefits,
        isPopular: Boolean(p.recommended),
        color: ''
      }));
  }, [plans]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">会员与套餐</h1>
        <p className="text-gray-600 mt-2">选择适合你的学习套餐，解锁更多专属内容</p>
      </div>

      {/* 当前套餐概览 */}
      {user?.currentSubscriptionPlanName && (
        <Card className="p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback>{(user.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">当前套餐</span>
                  <MembershipBadge
                    tier={(user.membershipTier || 'basic') as MembershipTier}
                    size="sm"
                    text={user.currentSubscriptionPlanName || undefined}
                    level={user.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  生效：{user.currentSubscriptionStartTime ? new Date(user.currentSubscriptionStartTime as any).toLocaleString('zh-CN') : '-'}
                  <span className="mx-2">|</span>
                  到期：{user.currentSubscriptionEndTime ? new Date(user.currentSubscriptionEndTime as any).toLocaleString('zh-CN') : '-'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => navigate(ROUTES.USER_BACKEND_PROFILE)}>管理套餐</Button>
              <Button size="sm" variant="honeySoft" onClick={() => navigate(ROUTES.REDEEM_CDK)}>兑换码兑换</Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="p-8">
              <div className="text-center mb-8">
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <div className="flex items-baseline justify-center space-x-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((__, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : !mappedPlans || mappedPlans.length === 0 ? (
        <div className="text-center text-gray-500">暂无可用套餐</div>
      ) : mappedPlans.length === 1 ? (
        <div className={cn('grid gap-8 max-w-5xl mx-auto grid-cols-1 md:grid-cols-3')}>
          <div className="md:col-start-2">
            <PricingCard
              plan={mappedPlans[0]}
              onSelect={() => setIsPaymentOpen(true)}
              buttonLabel="立即订阅"
            />
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-8 max-w-5xl mx-auto',
            mappedPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
          )}
        >
          {mappedPlans.map((mp) => (
            <PricingCard
              key={mp.id}
              plan={mp}
              onSelect={() => setIsPaymentOpen(true)}
              buttonLabel="立即订阅"
            />
          ))}
        </div>
      )}
      <PaymentModal open={isPaymentOpen} onOpenChange={setIsPaymentOpen} />
    </div>
  );
};
