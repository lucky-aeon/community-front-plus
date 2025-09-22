import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CoursesService, ChaptersService } from '@shared/services/api';
import { FrontCourseDetailDTO, FrontChapterDetailDTO } from '@shared/types';

export const ChapterDetailPage: React.FC = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();

  // 状态管理
  const [course, setCourse] = useState<FrontCourseDetailDTO | null>(null);
  const [chapterDetail, setChapterDetail] = useState<FrontChapterDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // 获取课程信息
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

  // 获取章节详情
  useEffect(() => {
    const fetchChapterDetail = async () => {
      if (!chapterId) return;

      try {
        setIsChapterLoading(true);
        setChapterError(null);
        const chapterData = await ChaptersService.getFrontChapterDetail(chapterId);
        setChapterDetail(chapterData);
      } catch (err) {
        console.error('获取章节详情失败:', err);
        setChapterError('章节加载失败');
      } finally {
        setIsChapterLoading(false);
      }
    };

    fetchChapterDetail();
  }, [chapterId]);

  // 错误状态处理
  if (!courseId || !chapterId) {
    return (
      <div>
        <h2>参数缺失</h2>
        <p>课程ID: {courseId || '缺失'}</p>
        <p>章节ID: {chapterId || '缺失'}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <p>正在加载课程信息...</p>
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
      {/* 这里可以重新设计章节详情页面内容 */}
      <h1>章节详情页 - 待重新设计</h1>
      <p>课程ID: {courseId}</p>
      <p>章节ID: {chapterId}</p>
      <p>课程标题: {course.title}</p>
      <p>章节加载状态: {isChapterLoading ? '加载中...' : '已加载'}</p>

      {chapterError && <p style={{ color: 'red' }}>章节错误: {chapterError}</p>}

      {chapterDetail && (
        <div>
          <p>章节标题: {chapterDetail.title}</p>
          <p>章节内容长度: {chapterDetail.content.length} 字符</p>
          <p>预计阅读时间: {chapterDetail.readingTime} 分钟</p>
          <p>更新时间: {chapterDetail.updateTime}</p>
        </div>
      )}

      <p>课程总章节数: {course.chapters.length}</p>
      <p>当前章节索引: {course.chapters.findIndex(c => c.id === chapterId) + 1}</p>
    </div>
  );
};
