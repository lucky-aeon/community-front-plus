import React from 'react';
import { Clock, Star, Users, Crown, Lock } from 'lucide-react';
import { Course } from '../../shared/types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CourseCardProps {
  course: Course;
  onPurchase?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPurchase }) => {
  const { user } = useAuth();

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

  return (
    <Card hover className="overflow-hidden">
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
            New
          </Badge>
        )}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getTierColor(course.requiredTier)}`}>
          {course.requiredTier === 'vip' && <Crown className="h-3 w-3" />}
          <span>{course.requiredTier.toUpperCase()}</span>
        </div>
        {!canAccess() && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={getLevelColor(course.level)} size="sm">
            {course.level}
          </Badge>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">{course.rating}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{course.studentCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">${course.price}</span>
            {course.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${course.originalPrice}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">by {course.instructor}</p>
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
          onClick={onPurchase}
          disabled={!canAccess() && user?.membershipTier === 'guest'}
        >
          {!user || user.membershipTier === 'guest' 
            ? 'Login to Access' 
            : canAccess() 
              ? 'Start Learning' 
              : 'Upgrade Required'
          }
        </Button>
      </div>
    </Card>
  );
};