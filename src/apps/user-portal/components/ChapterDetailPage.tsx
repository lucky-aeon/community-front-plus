import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  Play
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { Comments } from '@/components/ui/comments';
import { CoursesService, ChaptersService } from '@shared/services/api';
import { FrontCourseDetailDTO, FrontChapterDetailDTO } from '@shared/types';
import { useAuth } from '../../../context/AuthContext';

export const ChapterDetailPage: React.FC = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [course, setCourse] = useState<FrontCourseDetailDTO | null>(null);
  const [chapterDetail, setChapterDetail] = useState<FrontChapterDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // 获取当前用户
  const { user } = useAuth();

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

  // 处理章节切换
  const handleChapterChange = (newChapterId: string) => {
    navigate(`/dashboard/courses/${courseId}/chapters/${newChapterId}`);
  };

  // 状态辅助函数
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待更新';
      case 'IN_PROGRESS': return '更新中';
      case 'COMPLETED': return '已完成';
      default: return '未知状态';
    }
  };

  // 错误状态处理
  if (!courseId || !chapterId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">参数缺失</h2>
        <Button onClick={() => navigate('/dashboard/courses')}>返回课程</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || '课程未找到'}</h2>
        <div className="space-x-4">
          <Button onClick={() => window.location.reload()}>重试</Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard/courses')}>返回课程</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回课程</span>
        </Button>

        {/* 面包屑导航 */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{course.title}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {chapterDetail ? chapterDetail.title : '加载中...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧：章节内容 */}
        <div className="col-span-12 lg:col-span-9">
          {isChapterLoading ? (
            <Card className="p-6">
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            </Card>
          ) : chapterError ? (
            <Card className="p-6">
              <div className="text-center text-red-600 h-64 flex items-center justify-center">
                <div>
                  <p className="mb-4">{chapterError}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    重试
                  </Button>
                </div>
              </div>
            </Card>
          ) : chapterDetail ? (
            <Card className="p-0 overflow-hidden">
              <div>
                {/* 章节标题和信息 */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  {/* 面包屑导航 */}
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                      className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                    >
                      {chapterDetail.courseName}
                    </Button>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">章节详情</span>
                  </div>

                  {/* 章节进度 */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      第 {course?.chapters.findIndex(c => c.id === chapterId) + 1} 章 / 共 {course?.chapters.length} 章
                    </Badge>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((course?.chapters.findIndex(c => c.id === chapterId) + 1) / (course?.chapters.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {chapterDetail.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>预计阅读 {ChaptersService.formatReadingTime(chapterDetail.readingTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅 更新于 {new Date(chapterDetail.updateTime).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>

                {/* Markdown 内容 */}
                <div className="p-6">
                  <div className="prose-content">
                    <MarkdownEditor
                      value={chapterDetail.content}
                      onChange={() => {}} // 只读模式，不需要处理变更
                      previewOnly={true}
                      height="auto"
                      toolbar={false}
                      className="!border-none !shadow-none !bg-transparent"
                      enableFullscreen={false}
                      enableToc={false}
                    />
                  </div>

                  {/* 章节导航 */}
                  <div className="flex items-center justify-between py-6 mt-8 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      {(() => {
                        const currentIndex = course?.chapters.findIndex(c => c.id === chapterId) || 0;
                        const prevChapter = currentIndex > 0 ? course?.chapters[currentIndex - 1] : null;

                        return (
                          <>
                            {prevChapter && (
                              <Button
                                variant="outline"
                                onClick={() => handleChapterChange(prevChapter.id)}
                                className="flex items-center space-x-2"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                <span>上一章</span>
                              </Button>
                            )}

                          </>
                        );
                      })()}
                    </div>

                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                章节内容加载失败
              </div>
            </Card>
          )}

          {/* Comments Section (shadcn) */}
          {chapterDetail && course && !chapterError && (
            <div className="mt-6">
              <Comments businessId={chapterId!} businessType="COURSE" authorId={course.authorId} />
            </div>
          )}
        </div>

        {/* 右侧：章节列表 */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="p-4 sticky top-6">
            {/* 课程信息 */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant={getStatusColor(course.status)} size="sm">
                  {getStatusText(course.status)}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                {course.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{CoursesService.formatReadingTime(course.totalReadingTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{course.chapters.length} 章节</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4">课程章节</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.chapters
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-50
                    ${chapter.id === chapterId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleChapterChange(chapter.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5
                      ${chapter.id === chapterId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {chapter.id === chapterId ? (
                        <Play className="h-2.5 w-2.5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5 mb-1">
                        {chapter.title}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{CoursesService.formatReadingTime(chapter.readingTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 章节进度总览 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">学习进度</div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="font-medium text-blue-600">
                    {course.chapters.findIndex(c => c.id === chapterId) + 1}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{course.chapters.length}</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${((course.chapters.findIndex(c => c.id === chapterId) + 1) / course.chapters.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
