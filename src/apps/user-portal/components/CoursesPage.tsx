import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoursesService } from '@shared/services/api';
import { routeUtils } from '@shared/routes/routes';
import { FrontCourseDTO, AppCourseQueryRequest } from '@shared/types';
import { CourseCard } from '@shared/components/business/CourseCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// 无排序需求

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();

  // 查询与分页状态
  // 简化：列表页不提供搜索/筛选，仅分页展示
  
  const [courses, setCourses] = useState<FrontCourseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // 无搜索/筛选

  // 载入课程
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: AppCourseQueryRequest = {
        pageNum: currentPage,
        pageSize,
      };
      const response = await CoursesService.getFrontCoursesList(params);
      setCourses(response.records);
      setTotalPages(response.pages);
      // totalCount 未在 UI 使用，避免未使用状态
    } catch (err) {
      console.error('加载课程列表失败:', err);
      setError('课程列表加载失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const sortedCourses = courses; // 简化：不做客户端排序

  // 无搜索/筛选

  const handleCardClick = (courseId: string) => {
    navigate(routeUtils.getCourseDetailRoute(courseId));
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  return (
    <div className="relative">
      {/* 顶部 Hero */}
      <div className="bg-gradient-to-br from-honey-50 via-white to-honey-50/60 border-b border-honey-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">课程广场</h1>
            <p className="text-warm-gray-600 text-sm sm:text-base">精选高质量实战课程，聚焦工程化与真实业务场景</p>
          </div>
        </div>
      </div>

      {/* 已按需求移除统计卡片，直接展示课程列表 */}

      {/* 错误提示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Alert variant="destructive">
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 课程网格 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : sortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {sortedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={handleCardClick}
                showAuthor={false}
                hideContent
                hideHeroTitle
                hidePrice
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-warm-gray-600">暂无课程</p>
          </Card>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                  />
                </PaginationItem>
                {pageNumbers.map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === currentPage}
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p); }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};
