import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { CourseCard } from '@shared/components/business/CourseCard';
import { CoursesService } from '@shared/services/api';
import { FrontCourseDTO, AppCourseQueryRequest } from '@shared/types';
import { routeUtils } from '@shared/routes/routes';

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [courses, setCourses] = useState<FrontCourseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  // 加载课程列表
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AppCourseQueryRequest = {
        pageNum: currentPage,
        pageSize
      };

      const response = await CoursesService.getFrontCoursesList(params);
      setCourses(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载课程列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // 初始化加载
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // 处理课程点击
  const handleCourseClick = (courseId: string) => {
    navigate(routeUtils.getCourseDetailRoute(courseId));
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">课程中心</h1>
        <p className="text-gray-600">探索专业课程，提升技能水平</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={handleCourseClick}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无课程</h3>
          <p className="text-gray-600">课程正在筹备中，敬请期待</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            上一页
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + Math.max(1, currentPage - 2);
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 text-sm rounded-md ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};