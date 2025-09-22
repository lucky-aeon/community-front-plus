import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ChevronRight, BookOpen, AtSign, Quote, FileText, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentDTO, LatestCommentDTO } from '@shared/types';
import { CommentsService } from '@shared/services/api/comments.service';
import { cn } from '@/lib/utils';

interface RecentCommentsProps {
  comments?: LatestCommentDTO[];
  isLoading?: boolean;
  className?: string;
}

export const RecentComments: React.FC<RecentCommentsProps> = ({
  comments = [],
  isLoading = false,
  className
}) => {
  const navigate = useNavigate();

  const handleCommentClick = (comment: LatestCommentDTO) => {
    // 根据业务类型跳转到对应的内容页面
    if (comment.businessType === 'POST') {
      navigate(`/dashboard/discussions/${comment.businessId}#comment-${comment.id}`);
    } else if (comment.businessType === 'COURSE') {
      navigate(`/dashboard/courses/${comment.businessId}#comment-${comment.id}`);
    } else if (comment.businessType === 'CHAPTER') {
      navigate(`/dashboard/chapters/${comment.businessId}#comment-${comment.id}`);
    }
  };

  const handleViewMore = () => {
    navigate('/dashboard/discussions');
  };

  const formatTime = (timeStr: string) => {
    return CommentsService.formatCommentTime(timeStr);
  };

  // 获取业务类型的显示信息
  const getBusinessTypeInfo = (businessType: BusinessType) => {
    switch (businessType) {
      case 'POST':
        return {
          label: '文章',
          icon: FileText,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          actionText: '评论文章'
        };
      case 'COURSE':
        return {
          label: '课程',
          icon: BookOpen,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          actionText: '评论课程'
        };
      case 'CHAPTER':
        return {
          label: '章节',
          icon: Book,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          actionText: '评论章节'
        };
      default:
        return {
          label: '内容',
          icon: FileText,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          actionText: '评论内容'
        };
    }
  };

  const truncateContent = (content: string | null | undefined, maxLength: number = 40) => {
    if (!content) return '';
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
              comments.map((comment) => {
                const businessInfo = getBusinessTypeInfo(comment.businessType);
                const BusinessIcon = businessInfo.icon;

                return (
                  <div
                    key={comment.id}
                    className="group p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-purple-100"
                    onClick={() => handleCommentClick(comment)}
                  >
                    <div className="space-y-2.5">
                      {/* Comment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <img
                            src={comment.commentUserAvatar || '/api/placeholder/24/24'}
                            alt={comment.commentUserName}
                            className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            {/* 用户名 */}
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {comment.commentUserName}
                              </span>
                            </div>
                            {/* 时间 - 独立行显示 */}
                            <div className="flex items-center space-x-1 text-xs text-warm-gray-500">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="flex-shrink-0">{formatTime(comment.createTime)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Business Type Badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-0.5 flex-shrink-0 mt-0.5",
                            businessInfo.bgColor,
                            businessInfo.textColor,
                            businessInfo.borderColor
                          )}
                        >
                          {businessInfo.label}
                        </Badge>
                      </div>

                      {/* Business Name - 显示评论的内容来源 */}
                      {comment.businessName && (
                        <div className="flex items-center space-x-2 pl-8">
                          <div className="flex items-center space-x-1 text-xs">
                            <BusinessIcon className={cn("h-3 w-3", businessInfo.iconColor)} />
                            <span className="text-warm-gray-600">
                              {businessInfo.actionText}:
                            </span>
                            <span className="text-gray-900 font-medium line-clamp-1">
                              {truncateContent(comment.businessName, 30)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reply Indicator - 显示回复关系 */}
                      {comment.replyUserId && comment.replyUserName && (
                        <div className="flex items-center space-x-2 pl-8">
                          <div className="flex items-center space-x-1 text-xs">
                            <AtSign className="h-3 w-3 text-amber-600" />
                            <span className="text-warm-gray-600">回复</span>
                            <span
                              className="text-amber-600 font-medium hover:text-amber-700 cursor-pointer transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: 导航到用户资料页面
                                console.log('Navigate to user profile:', comment.replyUserId);
                              }}
                            >
                              {comment.replyUserName}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Comment Content */}
                      <div className="pl-8">
                        <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                          {truncateContent(comment.content, 50)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
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