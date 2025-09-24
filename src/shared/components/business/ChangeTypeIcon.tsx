import React from 'react';
import { Sparkles, Wrench, Bug, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface ChangeTypeIconProps {
  type: 'feature' | 'improvement' | 'bugfix' | 'breaking' | 'security';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChangeTypeIcon: React.FC<ChangeTypeIconProps> = ({
  type,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  const iconConfig = {
    feature: {
      icon: Sparkles,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    improvement: {
      icon: Wrench,
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100'
    },
    bugfix: {
      icon: Bug,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100' 
    },
    breaking: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    security: {
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full p-1',
        config.bgColor,
        className
      )}
    >
      <Icon className={cn(sizeClasses[size], config.color)} />
    </div>
  );
};

export const getChangeTypeLabel = (type: 'feature' | 'improvement' | 'bugfix' | 'breaking' | 'security'): string => {
  const labels = {
    feature: '新功能',
    improvement: '优化改进',
    bugfix: '问题修复',
    breaking: '重要变更',
    security: '安全更新'
  };
  return labels[type];
};
