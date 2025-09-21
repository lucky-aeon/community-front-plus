import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Heart,
  Clock,
  User,
  BookOpen,
  ChevronRight,
  Crown,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  type: 'course' | 'post' | 'discussion';
  title: string;
  excerpt?: string;
  author: {
    name: string;
    avatar: string;
    membershipTier: 'basic' | 'premium' | 'vip';
  };
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  publishTime: string;
  isPremium?: boolean;
  isHot?: boolean;
  category?: string;
  coverImage?: string;
}

interface RecentContentProps {
  className?: string;
  items?: ContentItem[];
}

export const RecentContent: React.FC<RecentContentProps> = ({
  className,
  items = [
    {
      id: '1',
      type: 'course',
      title: 'React 18 新特性深度解析',
      excerpt: '深入了解 React 18 的并发功能和 Suspense 改进，掌握现代 React 开发最佳实践。',
      author: {
        name: '张技术',
        avatar: '/api/placeholder/40/40',
        membershipTier: 'premium'
      },
      stats: { likes: 89, comments: 23, views: 1240 },
      publishTime: '2024-01-15T10:30:00Z',
      isPremium: true,
      category: 'React',
      coverImage: '/api/placeholder/300/200'
    },
    {
      id: '2',
      type: 'post',
      title: 'TypeScript 5.0 新功能实战指南',
      excerpt: '探索 TypeScript 5.0 的装饰器、const 断言和模板字面量类型等新特性。',
      author: {
        name: '李前端',
        avatar: '/api/placeholder/40/40',
        membershipTier: 'vip'
      },
      stats: { likes: 156, comments: 45, views: 2100 },
      publishTime: '2024-01-14T16:20:00Z',
      isHot: true,
      category: 'TypeScript'
    },
    {
      id: '3',
      type: 'discussion',
      title: '如何优化 React 应用的性能？',
      excerpt: '分享一些在大型 React 项目中遇到的性能问题和解决方案，欢迎大家讨论。',
      author: {
        name: '王全栈',
        avatar: '/api/placeholder/40/40',
        membershipTier: 'basic'
      },
      stats: { likes: 34, comments: 67, views: 890 },
      publishTime: '2024-01-14T09:15:00Z',
      category: '性能优化'
    }
  ]
}) => {
  const navigate = useNavigate();

  const getTypeConfig = (type: ContentItem['type']) => {
    switch (type) {
      case 'course':
        return {
          label: '课程',
          icon: BookOpen,
          color: 'bg-blue-100 text-blue-700',
          route: (id: string) => `/dashboard/courses/${id}`
        };
      case 'post':
        return {
          label: '文章',
          icon: MessageSquare,
          color: 'bg-green-100 text-green-700',
          route: (id: string) => `/dashboard/discussions/${id}`
        };
      case 'discussion':
        return {
          label: '讨论',
          icon: MessageSquare,
          color: 'bg-purple-100 text-purple-700',
          route: (id: string) => `/dashboard/discussions/${id}`
        };
    }
  };

  const getMembershipBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      case 'vip': return 'bg-gradient-to-r from-premium-500 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (timeStr: string) => {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    return '刚刚';
  };

  const handleItemClick = (item: ContentItem) => {
    const config = getTypeConfig(item.type);
    navigate(config.route(item.id));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">最新内容</h2>
          <p className="text-warm-gray-600">发现社区最新的优质内容</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/discussions')}
          className="text-honey-600 hover:text-honey-700 hover:bg-honey-50"
        >
          查看全部
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const typeConfig = getTypeConfig(item.type);
          const TypeIcon = typeConfig.icon;

          return (
            <Card
              key={item.id}
              className={cn(
                "p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md",
                "hover:-translate-y-1"
              )}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start gap-4">
                {/* Cover Image */}
                {item.coverImage && item.type === 'course' && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-24 h-16 rounded-lg object-cover"
                    />
                    {item.isPremium && (
                      <div className="absolute -top-2 -right-2">
                        <Crown className="h-4 w-4 text-premium-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-xs", typeConfig.color)}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>

                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}

                      {item.isPremium && (
                        <Badge className="bg-premium-100 text-premium-700 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          会员专享
                        </Badge>
                      )}

                      {item.isHot && (
                        <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          热门
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={cn(
                    "text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug",
                    "group-hover:text-honey-600 transition-colors"
                  )}>
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  {item.excerpt && (
                    <p className="text-warm-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.author.name}
                        </span>
                        <Badge className={cn(
                          "text-xs px-2 py-0.5",
                          getMembershipBadgeColor(item.author.membershipTier)
                        )}>
                          {item.author.membershipTier.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-warm-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(item.publishTime)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-warm-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{item.stats.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{item.stats.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{item.stats.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};