import React, { useEffect, useMemo, useState } from 'react';
import { PricingCard } from './PricingCard';
import { PublicSubscriptionPlansService } from '@shared/services/api/public-subscription-plans.service';
import { MembershipPlan, SubscriptionPlanDTO, IndependentServiceDTO } from '@shared/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@shared/utils/cn';
import { IndependentServicesService } from '@shared/services/api';
import { IndependentServiceCard } from './IndependentServiceCard';

interface PricingSectionProps {
  onPlanSelect: () => void;
  onServiceCtaClick: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onPlanSelect, onServiceCtaClick }) => {
  const [plans, setPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [services, setServices] = useState<IndependentServiceDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setPlanError(null);

      const [planResult, serviceResult] = await Promise.allSettled([
        PublicSubscriptionPlansService.getPlans(),
        IndependentServicesService.getPublicServices()
      ]);

      if (cancelled) {
        return;
      }

      if (planResult.status === 'fulfilled') {
        setPlans(planResult.value || []);
      } else {
        console.error('加载套餐失败', planResult.reason);
        setPlans([]);
        setPlanError('会员套餐暂时加载失败，独立服务仍可正常查看');
      }

      if (serviceResult.status === 'fulfilled') {
        setServices(serviceResult.value.filter((service) => service.visibleInHome !== false));
      } else {
        console.error('加载独立服务失败', serviceResult.reason);
        setServices([]);
      }

      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
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

  const visibleServices = services.filter((service) => service.visibleInHome !== false);

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700">
            会员与服务
          </div>
          <p className="text-lg leading-8 text-gray-600">
            会员权益继续围绕课程与内容，独立服务则提供按需支持。
          </p>
        </div>

        {loading ? (
          <div className="space-y-12">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Card key={idx} className="p-8">
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="space-y-3 pt-2">
                        {Array.from({ length: 4 }).map((__, i) => (
                          <Skeleton key={i} className="h-4 w-full" />
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-14">
            <div>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">会员方案</h3>
              </div>
                {planError && <div className="text-sm text-amber-700">{planError}</div>}
              </div>

              {mappedPlans.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500">
                  暂无可用套餐
                </div>
              ) : mappedPlans.length === 1 ? (
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="md:col-start-2">
                    <PricingCard plan={mappedPlans[0]} onSelect={onPlanSelect} buttonLabel="立即订阅" />
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'grid gap-8 items-stretch',
                    mappedPlans.length === 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  )}
                >
                  {mappedPlans.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} onSelect={onPlanSelect} buttonLabel="立即订阅" />
                  ))}
                </div>
              )}
            </div>

            {visibleServices.length > 0 && (
              <div>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">独立服务</h3>
                  <p className="mt-1 text-sm text-gray-500">查看当前可用的独立服务</p>
                </div>
                </div>

                {visibleServices.length === 1 ? (
                  <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-start-2">
                      <IndependentServiceCard service={visibleServices[0]} onCtaClick={onServiceCtaClick} />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'grid gap-8 items-stretch',
                      visibleServices.length === 2
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    )}
                  >
                    {visibleServices.map((service) => (
                      <IndependentServiceCard
                        key={service.serviceCode}
                        service={service}
                        onCtaClick={onServiceCtaClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
