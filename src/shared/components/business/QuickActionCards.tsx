import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  MessageSquare,
  Search,
  TrendingUp,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  badge?: string;
  disabled?: boolean;
}

interface QuickActionCardsProps {
  className?: string;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = ({ className }) => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'create-post',
      title: '发布文章',
      description: '分享你的技术见解和经验',
      icon: Plus,
      action: () => navigate('/dashboard/create-post'),
      color: 'from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700',
      badge: '创作'
    },
    {
      id: 'browse-courses',
      title: '浏览课程',
      description: '发现新的学习内容',
      icon: BookOpen,
      action: () => navigate('/dashboard/courses'),
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      badge: '学习'
    },
    {
      id: 'join-discussions',
      title: '参与讨论',
      description: '与社区成员交流互动',
      icon: MessageSquare,
      action: () => navigate('/dashboard/discussions'),
      color: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      badge: '交流'
    },
    {
      id: 'explore-trending',
      title: '热门内容',
      description: '查看社区热门话题',
      icon: TrendingUp,
      action: () => navigate('/dashboard/trending'),
      color: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      badge: '发现'
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {quickActions.map((action, index) => {
        const IconComponent = action.icon;

        return (
          <Card
            key={action.id}
            className={cn(
              "relative overflow-hidden border-0 shadow-lg hover:shadow-xl",
              "transition-all duration-300 transform hover:-translate-y-1",
              "bg-gradient-to-br", action.color,
              "group cursor-pointer",
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={!action.disabled ? action.action : undefined}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8" />

            <div className="relative p-6 text-white">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <IconComponent className="h-6 w-6" />
                </div>
                {action.badge && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold group-hover:scale-105 transition-transform origin-left">
                  {action.title}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="flex justify-end mt-4">
                <div className="p-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </Card>
        );
      })}
    </div>
  );
};