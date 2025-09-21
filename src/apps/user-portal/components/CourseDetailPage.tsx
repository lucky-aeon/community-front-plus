import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Star, BookOpen, Github } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { SubscribeButton } from '@/components/ui/subscribe-button';
import { Comments } from '@/components/ui/comments';
import { CoursesService } from '@shared/services/api';
import { FrontCourseDetailDTO } from '@shared/types';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
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
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">课程ID缺失</h2>
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

  const formattedDuration = CoursesService.formatReadingTime(course.totalReadingTime);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回课程</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="lg:col-span-2">
          <Card className="p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant={getStatusColor(course.status)} size="sm">
                    {getStatusText(course.status)}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{course.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formattedDuration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.chapters.length} 章节</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{course.rating.toFixed(1)} 评分</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {course.price !== undefined && (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">¥{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-500 line-through ml-2">
                          ¥{course.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-gray-600">作者：{course.authorName}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {/* 技术栈标签 */}
              {course.techStack.map((tech) => (
                <Badge key={tech} variant="primary" size="sm">
                  {tech}
                </Badge>
              ))}
              {/* 普通标签 */}
              {course.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Chapters List */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">课程章节</h2>
            <div className="space-y-3">
              {course.chapters
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => navigate(`/dashboard/courses/${courseId}/chapters/${chapter.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-gray-200 text-gray-600">
                        <Play className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          第{index + 1}章：{chapter.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{CoursesService.formatReadingTime(chapter.readingTime)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Comments: 课程评论 */}
          <div className="mt-6">
            <Comments businessId={courseId!} businessType="COURSE" authorId={course.authorId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Actions */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* 课程订阅 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">课程订阅</h3>
                <SubscribeButton
                  targetId={courseId!}
                  targetType="COURSE"
                  size="default"
                  showText
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  订阅课程，第一时间获取更新通知
                </p>
              </div>

              {/* 项目源码 */}
              {course.projectUrl && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">项目源码</h3>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => window.open(course.projectUrl, '_blank')}
                  >
                    <Github className="h-4 w-4" />
                    <span>查看源码</span>
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    查看课程相关的项目源码
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
