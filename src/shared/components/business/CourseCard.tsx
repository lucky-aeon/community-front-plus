import React from 'react';
import { Clock, Star, BookOpen, ExternalLink, Award } from 'lucide-react';
import { FrontCourseDTO } from '@shared/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoursesService } from '@shared/services/api';
import { cn } from '@shared/utils/cn';

interface CourseCardProps {
  course: FrontCourseDTO;
  onClick?: (courseId: string) => void;
  showAuthor?: boolean; // 是否显示作者，默认显示
  hideContent?: boolean; // 列表页不展示简介/标签
  hideHero?: boolean; // 是否隐藏顶部封面/渐变区
  hideStatus?: boolean; // 是否隐藏状态徽章
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, showAuthor = true, hideContent = false, hideHero = false, hideStatus = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-honey-100 text-honey-800 border-honey-200';
      case 'COMPLETED': return 'bg-sage-100 text-sage-800 border-sage-200';
      default: return 'bg-warm-gray-100 text-warm-gray-800 border-warm-gray-200';
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

  const hasCover = Boolean(course.coverImage);

  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer",
        "transform transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-honey-200/30",
        "bg-white border border-honey-100 rounded-2xl"
      )}
      onClick={handleCardClick}
    >
      {/* 可选 Hero：未登录公开页禁用，避免任何“封面”感 */}
      {!hideHero && (
        <div className={cn(
          "relative h-48 overflow-hidden",
          hasCover ? "bg-black/5" : "bg-gradient-to-br from-honey-400/90 via-honey-500 to-premium-600"
        )}>
          {hasCover && (
            <img
              src={course.coverImage}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/api/placeholder/600/320';
              }}
            />
          )}
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-8 left-8 w-12 h-12 bg-white/5 rounded-full blur-xl animate-float animation-delay-2000" />
          <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
            {!hasCover && (
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-3 transform group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-12 w-12 text-white drop-shadow-sm" />
              </div>
            )}
            <h4 className="text-lg font-bold text-center leading-tight drop-shadow-sm line-clamp-2">
              {course.title}
            </h4>
          </div>
          {!hideStatus && (
            <div className="absolute top-4 left-4">
              <Badge className={cn("border text-xs font-semibold shadow-sm","bg-white/90 backdrop-blur-sm", getStatusColor(course.status))}>
                {getStatusText(course.status)}
              </Badge>
            </div>
          )}
          {course.projectUrl && (
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "absolute top-4 right-4 h-8 w-8 p-0",
                "bg-white/20 hover:bg-white/30 text-white border-white/30",
                "backdrop-blur-sm transition-all duration-200",
                "hover:scale-110 shadow-lg"
              )}
              onClick={handleProjectUrlClick}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={cn("p-6 space-y-4")}> 
        {/* 当隐藏Hero时，单独展示状态徽章 */}
        {hideHero && !hideStatus && (
          <div className="flex items-center justify-between">
            <Badge className={cn("border text-xs font-semibold", getStatusColor(course.status))}>
              {getStatusText(course.status)}
            </Badge>
          </div>
        )}
        {/* Rating 和（可选）作者 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
            </div>
            <div className="w-1 h-1 bg-warm-gray-300 rounded-full" />
            <Award className="h-4 w-4 text-honey-500" />
          </div>
          {showAuthor && course.authorName && (
            <span className="text-sm font-medium text-warm-gray-600">{course.authorName}</span>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-honey-700 transition-colors">
            {course.title}
          </h3>
          {!hideContent && (
            <p className="text-warm-gray-600 text-sm leading-relaxed line-clamp-2">
              {course.description}
            </p>
          )}
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-warm-gray-500">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{CoursesService.formatReadingTime(course.totalReadingTime)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">{course.chapterCount}章节</span>
            </div>
          </div>
        </div>

        {/* Technology Stack Tags */}
        {!hideContent && (
          <div className="flex flex-wrap gap-2">
            {course.techStack?.slice(0, 2).map((tech) => (
              <Badge
                key={tech}
                className="bg-honey-50 text-honey-700 border-honey-200 hover:bg-honey-100 transition-colors text-xs font-medium"
              >
                {tech}
              </Badge>
            ))}
            {course.tags?.slice(0, 1).map((tag) => (
              <Badge
                key={tag}
                className="bg-sage-50 text-sage-700 border-sage-200 hover:bg-sage-100 transition-colors text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
            {((course.techStack?.length || 0) > 2 || (course.tags?.length || 0) > 1) && (
              <Badge className="bg-warm-gray-50 text-warm-gray-600 border-warm-gray-200 text-xs font-medium">
                +{(course.techStack?.length || 0) + (course.tags?.length || 0) - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className={cn("space-y-3", hideHero ? "pt-0" : "pt-2 border-t border-warm-gray-100")}> 
          {course.price !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-baseline space-x-2">
                {course.price === 0 ? (
                  <span className="text-2xl font-bold text-emerald-600">免费</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">¥{course.price}</span>
                )}
                {course.price !== 0 && course.originalPrice !== undefined && course.originalPrice > (course.price ?? 0) && (
                  <span className="text-sm text-warm-gray-500 line-through">
                    ¥{course.originalPrice}
                  </span>
                )}
              </div>
              {course.price !== 0 && course.originalPrice !== undefined && course.originalPrice > (course.price ?? 0) && (
                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs font-semibold">
                  限时优惠
                </Badge>
              )}
            </div>
          )}

          <Button
            className={cn(
              "w-full h-11 font-semibold text-sm relative overflow-hidden group",
              "bg-gradient-to-r from-premium-500 via-honey-600 to-amber-600",
              "hover:from-premium-600 hover:via-honey-700 hover:to-amber-700",
              "text-white shadow-lg hover:shadow-xl",
              "transform hover:scale-[1.02] transition-all duration-300",
              "focus:ring-2 focus:ring-premium-500/30",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
              "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            )}
            onClick={handleCardClick}
          >
            <span className="relative z-10 flex items-center justify-center">查看详情</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
