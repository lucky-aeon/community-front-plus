import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FrontCourseDTO, LatestChapterDTO } from '@shared/types';
import { cn } from '@/lib/utils';

interface RecentCourseChaptersProps {
  courses?: FrontCourseDTO[];
  chapters?: LatestChapterDTO[];
  isLoading?: boolean;
  className?: string;
}

export const RecentCourseChapters: React.FC<RecentCourseChaptersProps> = ({
  courses = [],
  chapters = [],
  isLoading = false,
  className
}) => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/courses/${courseId}`);
  };

  const handleChapterClick = (chapterId: string) => {
    navigate(`/dashboard/chapters/${chapterId}`);
  };

  const handleViewMore = () => {
    navigate('/dashboard/courses');
  };

  // 决定显示的数据：优先显示章节，如果没有章节则显示课程
  const displayItems = chapters.length > 0 ? chapters : courses;
  const isChapterMode = chapters.length > 0;

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {isChapterMode ? '最新章节' : '最新课程'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMore}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Course/Chapter List */}
        <div className="space-y-3">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                onClick={() => isChapterMode
                  ? handleChapterClick(item.id)
                  : handleCourseClick(item.id)
                }
              >
                <div className="space-y-2">
                  {/* Title */}
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h4>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs">
                    {/* Course name for chapters */}
                    {isChapterMode && 'courseName' in item && (
                      <div className="text-warm-gray-600 truncate">
                        {item.courseName}
                      </div>
                    )}

                    {/* Create Time */}
                    <div className="flex items-center space-x-1 text-warm-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(item.createTime).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {isChapterMode ? '暂无章节' : '暂无课程'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isChapterMode ? '期待精彩章节上线' : '期待精彩课程上线'}
              </p>
            </div>
          )}
        </div>

        {/* View More Button */}
        {displayItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMore}
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
          >
            {isChapterMode ? '查看更多课程' : '查看更多课程'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
};
