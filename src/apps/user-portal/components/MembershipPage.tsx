import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';
import type { SubscriptionPlanDTO } from '@shared/types';
import { AppSubscriptionPlansService } from '@shared/services/api';
import { Check, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MembershipPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlanDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      try {
        const list = await AppSubscriptionPlansService.getPlans();
        if (!cancelled) setPlans(list);
      } catch (e) {
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

  const formatPrice = (n: number | undefined) => {
    if (typeof n !== 'number') return '';
    if (n === 0) return '免费';
    return `¥${Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
  };

  const periodText = (months?: number) => {
    if (!months) return '';
    if (months === 12) return '每年';
    if (months === 1) return '每月';
    return `${months} 个月`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">会员与套餐</h1>
        <p className="text-gray-600 mt-2">选择适合你的学习套餐，解锁更多专属内容</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
              <div className="h-10 bg-gray-200 rounded w-1/2 mb-6" />
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-10 bg-gray-200 rounded mt-8" />
            </Card>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans
            .slice()
            .sort((a, b) => a.level - b.level)
            .map((plan) => (
              <Card key={plan.id} className={cn('relative overflow-hidden', plan.recommended ? 'ring-2 ring-premium-400' : '')}>
                {plan.recommended && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-premium-400 to-premium-500 text-gray-900 text-center py-2 text-sm font-semibold">
                      <Crown className="inline h-4 w-4 mr-1" />
                      推荐套餐
                    </div>
                  </div>
                )}
                <div className={cn('p-8', plan.recommended ? 'pt-12' : '')}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{formatPrice(plan.price)}</span>
                      {typeof plan.originalPrice === 'number' && plan.originalPrice > plan.price && (
                        <span className="text-lg text-warm-gray-500 line-through">{formatPrice(plan.originalPrice)}</span>
                      )}
                      {plan.price > 0 && (
                        <span className="text-gray-500">/{periodText(plan.validityMonths)}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelect(plan)}
                    className={cn(
                      'w-full shadow-md border',
                      'bg-gradient-to-r from-premium-400 to-premium-500 hover:from-premium-500 hover:to-premium-600',
                      'text-gray-900 border-premium-300 focus:ring-2 focus:ring-premium-300/40'
                    )}
                  >
                    选择此套餐
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <div className="text-center text-warm-gray-500">暂无可用套餐</div>
      )}
    </div>
  );
};
