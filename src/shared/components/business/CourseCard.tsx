import React from 'react';
import { Clock, Star, BookOpen, ExternalLink } from 'lucide-react';
import { FrontCourseDTO } from '../../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoursesService } from '../../services/api';

interface CourseCardProps {
  course: FrontCourseDTO;
  onClick?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
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

  const handleCardClick = () => {
    if (onClick) {
      onClick(course.id);
    }
  };

  const handleProjectUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (course.projectUrl) {
      window.open(course.projectUrl, '_blank');
    }
  };

  return (
    <Card hover className="overflow-hidden cursor-pointer" onClick={handleCardClick}>
      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 h-48 flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h4 className="text-lg font-semibold">{course.title}</h4>
        </div>
        <Badge
          variant={getStatusColor(course.status)}
          className="absolute top-3 left-3"
        >
          {getStatusText(course.status)}
        </Badge>
        {course.projectUrl && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={handleProjectUrlClick}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">{course.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">{course.authorName}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{CoursesService.formatReadingTime(course.totalReadingTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.chapterCount}章节</span>
            </div>
          </div>
        </div>

        {/* 技术栈标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {course.techStack?.slice(0, 2).map((tech) => (
            <Badge key={tech} variant="primary" size="sm">
              {tech}
            </Badge>
          ))}
          {course.tags?.slice(0, 1).map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
          {((course.techStack?.length || 0) > 2 || (course.tags?.length || 0) > 1) && (
            <Badge variant="secondary" size="sm">
              +{(course.techStack?.length || 0) + (course.tags?.length || 0) - 3}
            </Badge>
          )}
        </div>

        {/* 价格信息 */}
        {course.price !== undefined && (
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
        )}

        <Button
          className="w-full"
          onClick={handleCardClick}
        >
          开始学习
        </Button>
      </div>
    </Card>
  );
};