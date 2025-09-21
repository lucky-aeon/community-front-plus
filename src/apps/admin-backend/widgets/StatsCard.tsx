import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'blue'
}) => {
  const colorVariants = {
    blue: {
      iconBg: 'bg-blue-500',
      trend: 'text-blue-600',
      iconText: 'text-white'
    },
    green: {
      iconBg: 'bg-green-500',
      trend: 'text-green-600',
      iconText: 'text-white'
    },
    yellow: {
      iconBg: 'bg-yellow-500',
      trend: 'text-yellow-600',
      iconText: 'text-white'
    },
    purple: {
      iconBg: 'bg-purple-500',
      trend: 'text-purple-600',
      iconText: 'text-white'
    },
    red: {
      iconBg: 'bg-red-500',
      trend: 'text-red-600',
      iconText: 'text-white'
    },
    indigo: {
      iconBg: 'bg-indigo-500',
      trend: 'text-indigo-600',
      iconText: 'text-white'
    }
  };

  const colors = colorVariants[color];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {trend && (
            <div className="flex items-center">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs 上期</span>
            </div>
          )}
          
          {description && !trend && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        
        <div className={`${colors.iconBg} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${colors.iconText}`} />
        </div>
      </div>
    </Card>
  );
};