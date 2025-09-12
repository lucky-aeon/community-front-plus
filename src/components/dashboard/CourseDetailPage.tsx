import React, { useState } from 'react';
import { ArrowLeft, Play, Clock, Users, Star, CheckCircle, Lock, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { courses } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface CourseDetailPageProps {
  courseId: string;
  onBack: () => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId, onBack }) => {
  const { user } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">课程未找到</h2>
        <Button onClick={onBack}>返回</Button>
      </div>
    );
  }

  const canAccess = () => {
    if (!user || user.membershipTier === 'guest') return false;
    
    const tierHierarchy = { basic: 1, premium: 2, vip: 3 };
    return tierHierarchy[user.membershipTier] >= tierHierarchy[course.requiredTier];
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'text-blue-600 bg-blue-100';
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'vip': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'secondary';
    }
  };

  const totalDuration = course.chapters.reduce((total, chapter) => {
    const minutes = parseInt(chapter.duration.replace('分钟', ''));
    return total + minutes;
  }, 0);

  const completedChapters = course.chapters.filter(c => c.isCompleted).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
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
                  <Badge variant={getLevelColor(course.level)} size="sm">
                    {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
                  </Badge>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getTierColor(course.requiredTier)}`}>
                    <span>{course.requiredTier.toUpperCase()}</span>
                  </div>
                  {course.isNew && (
                    <Badge variant="success" size="sm">
                      新课程
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(totalDuration / 60)}小时{totalDuration % 60}分钟</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.studentCount.toLocaleString()} 学员</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{course.rating} 评分</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.chapters.length} 章节</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">¥{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">
                        ¥{course.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">讲师：{course.instructor}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {course.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {canAccess() && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">学习进度</h3>
                    <p className="text-sm text-green-600">
                      已完成 {completedChapters} / {course.chapters.length} 章节
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((completedChapters / course.chapters.length) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedChapters / course.chapters.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {!canAccess() && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">需要升级会员</h3>
                    <p className="text-sm text-orange-600">
                      此课程需要 {course.requiredTier.toUpperCase()} 会员权限才能观看
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Chapters List */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">课程章节</h2>
            <div className="space-y-3">
              {course.chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                    ${selectedChapter === chapter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${!canAccess() ? 'opacity-60' : ''}
                  `}
                  onClick={() => canAccess() && setSelectedChapter(chapter.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                        ${chapter.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : selectedChapter === chapter.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {chapter.isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : canAccess() ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          第{index + 1}章：{chapter.title}
                        </h3>
                        <p className="text-sm text-gray-600">{chapter.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{chapter.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Actions */}
          <Card className="p-6">
            <div className="space-y-4">
              {canAccess() ? (
                <>
                  <Button className="w-full flex items-center justify-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>继续学习</span>
                  </Button>
                  <Button variant="outline" className="w-full">
                    下载资料
                  </Button>
                </>
              ) : (
                <Button className="w-full" disabled>
                  需要升级会员
                </Button>
              )}
            </div>
          </Card>

          {/* Course Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">课程统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">总时长</span>
                <span className="font-medium">{Math.floor(totalDuration / 60)}小时{totalDuration % 60}分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">章节数</span>
                <span className="font-medium">{course.chapters.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">学员数</span>
                <span className="font-medium">{course.studentCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">评分</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{course.rating}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Instructor Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">讲师信息</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {course.instructor.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{course.instructor}</h4>
                <p className="text-sm text-gray-600">资深讲师</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              查看讲师主页
            </Button>
          </Card>

          {/* Related Courses */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">相关课程</h3>
            <div className="space-y-4">
              {courses.filter(c => c.id !== courseId && c.tags.some(tag => course.tags.includes(tag))).slice(0, 2).map((relatedCourse) => (
                <div key={relatedCourse.id} className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                  <div className="flex space-x-3">
                    <img
                      src={relatedCourse.thumbnail}
                      alt={relatedCourse.title}
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {relatedCourse.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{relatedCourse.instructor}</span>
                        <span>¥{relatedCourse.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};