import React from 'react';
import { Check, Crown, Star } from 'lucide-react';
import { MembershipPlan } from '@shared/types';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingCardProps {
  plan: MembershipPlan;
  onSelect: () => void;
  buttonLabel?: string; // 可选自定义按钮文案（默认依据用户状态）
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect, buttonLabel }) => {
  const { user } = useAuth();
  const isCurrentPlan = user?.membershipTier === plan.tier;

  return (
    <Card className={`relative overflow-hidden ${plan.isPopular ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
      {plan.isPopular && (
        <div className="absolute top-0 left-0 right-0">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
            <Star className="inline h-4 w-4 mr-1" />
            最受欢迎
          </div>
        </div>
      )}

      <div className={`p-8 ${plan.isPopular ? 'pt-12' : ''}`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {plan.tier === 'vip' && <Crown className="h-6 w-6 text-yellow-500" />}
            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
          </div>
          
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-4xl font-bold text-gray-900">¥{plan.price}</span>
            {plan.originalPrice !== undefined && plan.originalPrice > plan.price && (
              <span className="text-xl text-gray-500 line-through">
                ¥{plan.originalPrice}
              </span>
            )}
            <span className="text-gray-500">/{
              plan.duration.includes('year') ? '年' : plan.duration.includes('month') ? '月' : plan.duration
            }</span>
          </div>
          
          {plan.originalPrice !== undefined && plan.originalPrice > plan.price && (
            <Badge variant="success" className="mt-2">
              立省 ¥{plan.originalPrice - plan.price}
            </Badge>
          )}
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSelect}
          className={`w-full ${
            plan.tier === 'vip' 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600' 
              : plan.isPopular 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                : ''
          }`}
          disabled={isCurrentPlan}
        >
          {buttonLabel ?? (
            isCurrentPlan
              ? '当前套餐'
              : user?.membershipTier === 'guest'
                ? '立即开始'
                : '立即订阅'
          )}
        </Button>
      </div>
    </Card>
  );
};
