import React from 'react';
import { MessageSquare, Heart, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Post } from '@shared/types';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  variant?: 'default' | 'compact';
  showAuthorInfo?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onPostClick, 
  variant = 'default',
  showAuthorInfo = true 
}) => {
  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const cardClassName = variant === 'compact' 
    ? 'p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer'
    : 'p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer';

  return (
    <Card className={cardClassName} onClick={() => onPostClick(post.id)}>
      {/* Author Info - 完整版才显示 */}
      {variant === 'default' && showAuthorInfo && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(post.author.membershipTier)}`}>
                  {post.author.membershipTier.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 紧凑版的头部信息 */}
      {variant === 'compact' && showAuthorInfo && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(post.author.membershipTier)}`}>
                  {post.author.membershipTier.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors ${
        variant === 'compact' ? 'text-lg' : 'text-xl'
      }`}>
        {post.title}
      </h3>
      
      {/* Content */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {post.content}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" size="sm" className="hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1 hover:text-red-500 cursor-pointer transition-colors">
            <Heart className="h-4 w-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};