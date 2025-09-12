import React, { useState } from 'react';
import { BookOpen, Search, Filter, Play, Clock, Star, Users, Crown, Lock } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { courses } from '@shared/constants/mockData';

interface CoursesPageProps {
  onCourseClick: (courseId: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onCourseClick }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const canAccess = (course: any) => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">课程中心</h1>
        <p className="text-gray-600">探索专业课程，提升技能水平</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索课程、讲师或技能..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{courses.length}</p>
              <p className="text-sm text-gray-600">总课程数</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">
                {courses.filter(c => canAccess(c)).length}
              </p>
              <p className="text-sm text-gray-600">可学习课程</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">平均评分</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">15.2K</p>
              <p className="text-sm text-gray-600">学习人数</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} hover className="overflow-hidden cursor-pointer" onClick={() => onCourseClick(course.id)}>
            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              {course.isNew && (
                <Badge 
                  variant="success" 
                  className="absolute top-3 left-3"
                >
                  新课程
                </Badge>
              )}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getTierColor(course.requiredTier)}`}>
                {course.requiredTier === 'vip' && <Crown className="h-3 w-3" />}
                <span>{course.requiredTier.toUpperCase()}</span>
              </div>
              {!canAccess(course) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <Lock className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{course.duration}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={getLevelColor(course.level)} size="sm">
                  {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
                </Badge>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <p className="font-medium">讲师：{course.instructor}</p>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.studentCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xl font-bold text-gray-900">¥{course.price}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ¥{course.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                className="w-full"
                disabled={!canAccess(course)}
                onClick={(e) => {
                  e.stopPropagation();
                  onCourseClick(course.id);
                }}
              >
                {canAccess(course) 
                  ? '开始学习' 
                  : '需要升级会员'
                }
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关课程</h3>
          <p className="text-gray-600">尝试调整搜索条件或筛选选项</p>
        </div>
      )}
    </div>
  );
};