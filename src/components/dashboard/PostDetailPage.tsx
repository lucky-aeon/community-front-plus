import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark, Flag, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { posts, comments } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface PostDetailPageProps {
  postId: string;
  onBack: () => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ postId, onBack }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const post = posts.find(p => p.id === postId);
  const postComments = comments.filter(c => c.postId === postId);

  if (!post) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h2>
        <Button onClick={onBack}>返回</Button>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Here you would typically submit the comment to your backend
      console.log('Submitting comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Badge variant={post.type === 'article' ? 'primary' : 'warning'}>
            {post.type === 'article' ? '文章' : '问答'}
          </Badge>
          {post.type === 'question' && post.isAnswered && (
            <Badge variant="success" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>已解答</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-8">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(post.author.membershipTier)}`}>
                      {post.author.membershipTier.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Post Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

            {/* Post Content */}
            <div className="prose max-w-none mb-8">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between py-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes + (isLiked ? 1 : 0)}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{postComments.length}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center space-x-2 ${isBookmarked ? 'text-blue-500' : ''}`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>收藏</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Comments Section */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              评论 ({postComments.length})
            </h2>

            {/* Add Comment */}
            {user && (
              <div className="mb-8">
                <div className="flex items-start space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      placeholder="写下您的评论..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        发布评论
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {postComments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-4">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(comment.author.membershipTier)}`}>
                        {comment.author.membershipTier.toUpperCase()}
                      </span>
                      {comment.isAnswer && (
                        <Badge variant="success" size="sm">
                          最佳答案
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                        <Heart className="h-3 w-3" />
                        <span>{comment.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        回复
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {postComments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无评论，来发表第一个评论吧！</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">作者信息</h3>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(post.author.membershipTier)}`}>
                  {post.author.membershipTier.toUpperCase()}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              关注作者
            </Button>
          </Card>

          {/* Related Posts */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">相关内容</h3>
            <div className="space-y-3">
              {posts.filter(p => p.id !== postId).slice(0, 3).map((relatedPost) => (
                <div key={relatedPost.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {relatedPost.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{relatedPost.likes} 赞</span>
                    <span>{relatedPost.comments} 评论</span>
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