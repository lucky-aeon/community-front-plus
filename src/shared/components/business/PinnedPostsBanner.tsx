import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, ChevronLeft, ChevronRight, Eye, Heart, MessageSquare, User } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { PostsService } from '@shared/services/api/posts.service';
import type { FrontPostDTO } from '@shared/types';

interface PinnedPostsBannerProps {
  className?: string;
  maxItems?: number;
}

export const PinnedPostsBanner: React.FC<PinnedPostsBannerProps> = ({
  className,
  maxItems = 3
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedPosts, setPinnedPosts] = useState<FrontPostDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchPinnedPosts = async () => {
      try {
        setIsLoading(true);
        // 获取置顶文章
        const response = await PostsService.getPublicPosts({
          pageNum: 1,
          pageSize: 10,
          isTop: true
        });
        if (!cancelled) setPinnedPosts(response.records);
      } catch (e) {
        console.error('获取置顶文章失败:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchPinnedPosts();
    return () => { cancelled = true; };
  }, []);

  // 自动轮播
  useEffect(() => {
    if (pinnedPosts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % pinnedPosts.length);
    }, 5000); // 5秒切换
    return () => clearInterval(timer);
  }, [pinnedPosts.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + pinnedPosts.length) % pinnedPosts.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % pinnedPosts.length);
  };

  const handleViewPost = (postId: string) => {
    navigate(`/dashboard/discussions/${postId}`);
  };

  // 加载状态
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Pin className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid md:grid-cols-[2fr_3fr] gap-6">
            <Skeleton className="w-full h-48 rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 没有置顶文章
  if (pinnedPosts.length === 0) {
    return null;
  }

  const currentPost = pinnedPosts[currentIndex];

  return (
    <Card
      className={cn(
        "overflow-hidden relative group",
        "bg-gradient-to-br from-honey-50 via-white to-honey-50/30",
        "border-honey-200 shadow-md hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      {/* 置顶标识 */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-honey-100 text-honey-700 border-honey-300 shadow-sm"
        >
          <Pin className="h-3 w-3 mr-1" />
          置顶推荐
        </Badge>
      </div>

      {/* 轮播指示器和控制 */}
      {pinnedPosts.length > 1 && (
        <>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
              {currentIndex + 1} / {pinnedPosts.length}
            </span>
          </div>

          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </>
      )}

      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-[2fr_3fr] gap-6 items-stretch">
          {/* 左侧封面图 */}
          <div
            className="relative h-48 md:h-full min-h-[200px] rounded-lg overflow-hidden cursor-pointer group/img"
            onClick={() => handleViewPost(currentPost.id)}
          >
            {currentPost.coverImage ? (
              <img
                src={currentPost.coverImage}
                alt={currentPost.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-honey-100 to-honey-200 flex items-center justify-center">
                <Pin className="h-16 w-16 text-honey-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
          </div>

          {/* 右侧内容 */}
          <div className="flex flex-col justify-between gap-4">
            {/* 分类标签 */}
            {currentPost.categoryName && (
              <Badge variant="outline" className="w-fit bg-green-100 text-green-700 border-transparent">
                {currentPost.categoryName}
              </Badge>
            )}

            {/* 标题 */}
            <h3
              className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-honey-600 transition-colors leading-tight"
              onClick={() => handleViewPost(currentPost.id)}
            >
              {currentPost.title}
            </h3>

            {/* 摘要 */}
            {currentPost.summary && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {currentPost.summary}
              </p>
            )}

            {/* 底部元信息和按钮 */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-honey-100">
              {/* 作者和统计 */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">{currentPost.authorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{currentPost.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    <span>{currentPost.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{currentPost.commentCount}</span>
                  </div>
                </div>
              </div>

              {/* 查看详情按钮 */}
              <Button
                variant="honeySoft"
                size="sm"
                onClick={() => handleViewPost(currentPost.id)}
                className="whitespace-nowrap"
              >
                查看详情 →
              </Button>
            </div>
          </div>
        </div>

        {/* 底部轮播指示点 */}
        {pinnedPosts.length > 1 && (
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-honey-100">
            {pinnedPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-honey-500"
                    : "w-2 bg-honey-200 hover:bg-honey-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
