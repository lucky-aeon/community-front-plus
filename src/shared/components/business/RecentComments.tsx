import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@shared/utils/cn';
import { Comments } from '@shared/components/ui/Comments';
import { BookOpen, Quote } from 'lucide-react';

interface RecentCommentsProps {
  comments?: LatestCommentDTO[];
  isLoading?: boolean;
  className?: string;
}

export const RecentComments: React.FC<RecentCommentsProps> = ({ isLoading = false, className }) => {

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
