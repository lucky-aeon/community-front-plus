import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FrontCourseDTO, LatestChapterDTO } from '@shared/types';
import { cn } from '@shared/utils/cn';

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

  const handleChapterClick = (courseId: string, chapterId: string) => {
    // 跳转到课程下的章节详情页
    navigate(`/dashboard/courses/${courseId}/chapters/${chapterId}`);
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
                className="group p-3 rounded-lg cursor-pointer border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                onClick={() => {
                  if (isChapterMode) {
                    const chapter = item as LatestChapterDTO;
                    handleChapterClick(chapter.courseId, chapter.id);
                  } else {
                    const course = item as FrontCourseDTO;
                    handleCourseClick(course.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    {/* 标题：章节或课程名称 */}
                    <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600">
                      {item.title}
                    </h4>

                    {/* 元信息行：章节模式仅显示课程名；课程模式显示时间 */}
                    <div className="flex items-center gap-2 text-xs text-warm-gray-500">
                      {isChapterMode && 'courseName' in item && (
                        <button
                          className="inline-flex items-center gap-1 text-warm-gray-700 hover:text-blue-600 truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            if ('courseId' in item) handleCourseClick(item.courseId);
                          }}
                          title={item.courseName}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span className="truncate">{item.courseName}</span>
                        </button>
                      )}
                      {!isChapterMode && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-warm-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
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
