import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ChevronRight, BookOpen, AtSign, Quote, FileText, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentDTO, LatestCommentDTO } from '@shared/types';
import { CommentsService } from '@shared/services/api/comments.service';
import { ChaptersService } from '@shared/services/api';
import { cn } from '@shared/utils/cn';
import { Comments } from '@shared/components/ui/Comments';

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

  const handleCommentClick = async (comment: LatestCommentDTO) => {
    // 根据业务类型跳转到对应的内容页面
    if (comment.businessType === 'POST') {
      navigate(`/dashboard/discussions/${comment.businessId}#comment-${comment.id}`);
    } else if (comment.businessType === 'COURSE') {
      navigate(`/dashboard/courses/${comment.businessId}#comment-${comment.id}`);
    } else if (comment.businessType === 'CHAPTER') {
      try {
        const detail = await ChaptersService.getFrontChapterDetail(comment.businessId);
        navigate(`/dashboard/courses/${detail.courseId}/chapters/${comment.businessId}#comment-${comment.id}`);
      } catch (e) {
        // 回退到旧路径以保证可达
        navigate(`/dashboard/chapters/${comment.businessId}#comment-${comment.id}`);
      }
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

      {/* Comments List（统一复用 Comments 组件 latest 模式） */}
      <Comments mode="latest" businessId="" businessType={"POST" as const} />
    </div>
  );
};
