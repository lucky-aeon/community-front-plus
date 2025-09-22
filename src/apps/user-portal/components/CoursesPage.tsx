import React, { useState, useEffect, useCallback } from 'react';
import { CoursesService } from '@shared/services/api';
import { FrontCourseDTO, AppCourseQueryRequest } from '@shared/types';

export const CoursesPage: React.FC = () => {
  // 状态管理
  const [courses, setCourses] = useState<FrontCourseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage] = useState(1);
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

  return (
    <div>
      {/* 这里可以重新设计您的课程页面内容 */}
      <h1>课程页面 - 待重新设计</h1>
      <p>课程总数: {totalCount}</p>
      <p>课程数量: {courses.length}</p>
      <p>加载状态: {isLoading ? '加载中...' : '已加载'}</p>
    </div>
  );
};