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
import { FrontPostDTO, PageResponse } from '@shared/types';

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
  posts?: FrontPostDTO[];
  pageData?: PageResponse<FrontPostDTO> | null;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showHeader?: boolean;
  compact?: boolean;
  showPagination?: boolean;
}

export const RecentContent: React.FC<RecentContentProps> = ({
  className,
  showHeader = true,
  items = [],
  posts = [],
  pageData = null,
  currentPage = 1,
  onPageChange,
  showPagination = false
}) => {
  const navigate = useNavigate();

  // 转换 FrontPostDTO 为 ContentItem 格式
  const transformPostsToContentItems = (posts: FrontPostDTO[]): ContentItem[] => {
    return posts.map(post => ({
      id: post.id,
      type: 'post' as const,
      title: post.title,
      excerpt: post.summary,
      author: {
        name: post.authorName,
        avatar: post.authorAvatar || '/api/placeholder/40/40',
        membershipTier: 'basic' as const
      },
      stats: {
        likes: post.likeCount,
        comments: post.commentCount,
        views: post.viewCount
      },
      publishTime: post.publishTime,
      category: post.categoryName,
      coverImage: post.coverImage,
      isHot: post.isTop
    }));
  };

  // 确定使用的数据源
  const contentItems = posts.length > 0 ? transformPostsToContentItems(posts) : items;

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
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">最新文章</h2>
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
      )}

      {/* Content List */}
      <div className="space-y-4">
        {contentItems.length > 0 ? (
          contentItems.map((item) => {
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
                <div className={cn("grid gap-4 items-stretch", item.coverImage ? "sm:grid-cols-[1fr_192px]" : "")}> 
                  {/* Main Content */}
                  <div className="min-w-0">
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

                    {/* Footer moved to meta row below */}
                  </div>

                  {/* Cover Image on the right (fills card height) */}
                  {item.coverImage && (
                    <div className="relative hidden sm:block overflow-hidden rounded-lg h-full self-stretch">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/api/placeholder/192/144';
                        }}
                        className="w-full h-full object-cover"
                      />
                      {item.isPremium && (
                        <div className="absolute top-2 right-2">
                          <Crown className="h-5 w-5 text-premium-500 drop-shadow" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meta Row: author + stats */}
                  <div className="sm:col-span-2 flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
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
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无内容</h3>
            <p className="text-warm-gray-600">社区内容正在加载中...</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && pageData && pageData.pages > 1 && onPageChange && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一页
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            第 {currentPage} 页，共 {pageData.pages} 页
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pageData.pages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};
