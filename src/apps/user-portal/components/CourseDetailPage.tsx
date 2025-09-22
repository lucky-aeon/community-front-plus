import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CoursesService } from '@shared/services/api';
import { FrontCourseDetailDTO } from '@shared/types';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<FrontCourseDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);
        const courseData = await CoursesService.getFrontCourseDetail(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error('获取课程详情失败:', err);
        setError('课程加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  if (!courseId) {
    return (
      <div>
        <h2>课程ID缺失</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <p>正在加载课程详情...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div>
        <h2>{error || '课程未找到'}</h2>
      </div>
    );
  }

  return (
    <div>
      {/* 这里可以重新设计课程详情页面内容 */}
      <h1>课程详情页 - 待重新设计</h1>
      <p>课程ID: {courseId}</p>
      <p>课程标题: {course.title}</p>
      <p>课程描述: {course.description}</p>
      <p>作者: {course.authorName}</p>
      <p>章节数: {course.chapters.length}</p>
      <p>评分: {course.rating}</p>
      <p>状态: {course.status}</p>
    </div>
  );
};
