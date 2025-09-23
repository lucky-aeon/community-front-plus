import React from 'react';
import { Crown, Star, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MembershipTier = 'guest' | 'basic' | 'premium' | 'vip';

interface MembershipBadgeProps {
  tier: MembershipTier;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
  // 可选：自定义展示文本（用于显示后端套餐名称）
  text?: string;
  // 可选：基于套餐 level（1/2/3）定制样式，优先级高于 tier
  level?: 1 | 2 | 3;
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({
  tier,
  className,
  size = 'md',
  showIcon = true,
  animated = false,
  text,
  level
}) => {
  if (tier === 'guest') return null;

  const getTierConfig = (tier: MembershipTier) => {
    switch (tier) {
      case 'basic':
        return {
          label: 'BASIC',
          icon: Shield,
          className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-200',
          glowClass: 'shadow-blue-500/25'
        };
      case 'premium':
        return {
          label: 'PREMIUM',
          icon: Star,
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-200',
          glowClass: 'shadow-purple-500/25'
        };
      case 'vip':
        return {
          label: 'VIP',
          icon: Crown,
          className: 'bg-gradient-to-r from-premium-500 via-yellow-400 to-orange-500 text-white border-premium-200',
          glowClass: 'shadow-premium-500/40'
        };
      default:
        return null;
    }
  };

  // level 优先映射样式
  const getLevelConfig = (lvl: 1 | 2 | 3) => {
    switch (lvl) {
      case 1:
        return {
          label: 'Lv.1',
          icon: Shield,
          className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-200',
          glowClass: 'shadow-blue-500/25'
        };
      case 2:
        return {
          label: 'Lv.2',
          icon: Star,
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-200',
          glowClass: 'shadow-purple-500/25'
        };
      case 3:
        return {
          label: 'Lv.3',
          icon: Crown,
          className: 'bg-gradient-to-r from-premium-500 via-yellow-400 to-orange-500 text-white border-premium-200',
          glowClass: 'shadow-premium-500/40'
        };
    }
  };

  const config = level ? getLevelConfig(level) : getTierConfig(tier);
  if (!config) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold shadow-lg transition-all duration-300',
        config.className,
        config.glowClass,
        sizeClasses[size],
        animated && 'animate-pulse-gentle hover:scale-105',
        className
      )}
    >
      {showIcon && <IconComponent className="h-3 w-3 mr-1.5" />}
      <span className="font-bold tracking-wider">{text ?? config.label}</span>
      {tier === 'vip' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
};
