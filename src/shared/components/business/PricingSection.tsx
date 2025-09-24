import React, { useEffect, useMemo, useState } from 'react';
import { PricingCard } from './PricingCard';
import { PublicSubscriptionPlansService } from '@shared/services/api/public-subscription-plans.service';
import { MembershipPlan, SubscriptionPlanDTO } from '@shared/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@shared/utils/cn';

interface PricingSectionProps {
  onPlanSelect: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onPlanSelect }) => {
  const [plans, setPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PublicSubscriptionPlansService.getPlans();
        setPlans(data || []);
      } catch (e) {
        console.error('加载套餐失败', e);
        setError('加载套餐失败，请稍后重试');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 将后端套餐DTO映射为前端组件所需结构（保持UI不变）
  const mappedPlans: MembershipPlan[] = useMemo(() => {
    const toTier = (level: number): 'basic' | 'premium' | 'vip' => {
      if (level >= 3) return 'vip';
      if (level === 2) return 'premium';
      return 'basic';
    };

    const toDuration = (months: number): string => {
      // 如果是12个月则显示为年；否则按月
      return months === 12 ? 'per year' : 'per month';
    };

    return plans.map((p) => ({
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
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            选择您的学习之旅
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            通过我们灵活的会员计划释放您的潜力。
            今天开始学习，明天推进您的职业发展。
          </p>
        </div>

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
        ) : error ? (
          <div className="text-center text-gray-500">{error}</div>
        ) : mappedPlans.length === 0 ? (
          <div className="text-center text-gray-500">暂无可用套餐</div>
        ) : mappedPlans.length === 1 ? (
          <div className={cn('grid gap-8 max-w-5xl mx-auto grid-cols-1 md:grid-cols-3')}>
            <div className="md:col-start-2">
              <PricingCard plan={mappedPlans[0]} onSelect={onPlanSelect} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-8 max-w-5xl mx-auto',
              mappedPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
            )}
          >
            {mappedPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onSelect={onPlanSelect} buttonLabel="立即订阅" />
            ))}
          </div>
        )}

        {/* 删除底部提示文案与勾选项 */}
      </div>
    </section>
  );
};
