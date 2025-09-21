import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ChevronRight, BookOpen, AtSign, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentDTO } from '@shared/types';
import { CommentsService } from '@shared/services/api/comments.service';
import { cn } from '@/lib/utils';

interface RecentCommentsProps {
  comments?: CommentDTO[];
  isLoading?: boolean;
  className?: string;
}

export const RecentComments: React.FC<RecentCommentsProps> = ({
  comments = [],
  isLoading = false,
  className
}) => {
  const navigate = useNavigate();

  const handleCommentClick = (comment: CommentDTO) => {
    // 根据业务类型跳转到对应的内容页面
    if (comment.businessType === 'POST') {
      navigate(`/dashboard/discussions/${comment.businessId}#comment-${comment.id}`);
    } else if (comment.businessType === 'COURSE') {
      navigate(`/dashboard/courses/${comment.businessId}#comment-${comment.id}`);
    }
  };

  const handleViewMore = () => {
    navigate('/dashboard/discussions');
  };

  const formatTime = (timeStr: string) => {
    return CommentsService.formatCommentTime(timeStr);
  };

  const truncateContent = (content: string, maxLength: number = 40) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Inspiration Card Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-16 w-full" />
        </Card>

        {/* Comments List Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Inspiration Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-honey-100 via-honey-50 to-sage-50" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-honey-200/30 to-transparent rounded-full blur-2xl" />

        <div className="relative p-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-honey-500 to-honey-600 rounded-xl shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Quote className="h-4 w-4 text-honey-600" />
                <span className="text-xs text-honey-600 font-medium tracking-wide">每日一言</span>
              </div>
              <p className="text-lg font-bold text-gray-900 leading-relaxed">
                技术需要沉淀
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">最新评论</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewMore}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-purple-100"
                  onClick={() => handleCommentClick(comment)}
                >
                  <div className="space-y-3">
                    {/* Comment Header with Business Type Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={comment.commentUserAvatar || '/api/placeholder/24/24'}
                          alt={comment.commentUserName}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {comment.commentUserName}
                        </span>
                      </div>

                      {/* Business Type Badge - moved to top right */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-2 py-0.5",
                          comment.businessType === 'POST'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        )}
                      >
                        {comment.businessType === 'POST' ? '文章' : '课程'}
                      </Badge>
                    </div>

                    {/* Reply Indicator */}
                    {(comment.parentCommentId || comment.replyUserId) && comment.replyUserName && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 pl-8">
                        <AtSign className="h-3 w-3" />
                        <span>回复 {comment.replyUserName}</span>
                      </div>
                    )}

                    {/* Comment Content */}
                    <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors pl-8">
                      {truncateContent(comment.content)}
                    </p>

                    {/* Comment Meta */}
                    <div className="flex items-center justify-end text-xs pl-8">
                      {/* Time */}
                      <div className="flex items-center space-x-1 text-warm-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(comment.createTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">暂无评论</p>
                <p className="text-xs text-gray-400 mt-1">期待精彩讨论</p>
              </div>
            )}
          </div>

          {/* View More Button */}
          {comments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewMore}
              className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-sm"
            >
              查看更多评论
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};