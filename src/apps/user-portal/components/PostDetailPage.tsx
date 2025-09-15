import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark, Flag, CheckCircle } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { CommentsSection } from '@shared/components/business/CommentsSection';
import { useAuth } from '../../../context/AuthContext';
import { routeUtils } from '@shared/routes/routes';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDetailDTO, FrontPostDTO } from '@shared/types';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [post, setPost] = useState<FrontPostDetailDTO | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<FrontPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取文章详情和相关文章
  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) {
        setError('文章ID缺失');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取文章详情
        const postDetail = await PostsService.getPublicPostDetail(postId);
        setPost(postDetail);
        
        // 获取相关文章（最新的3篇）
        try {
          const relatedResponse = await PostsService.getPublicPosts({
            pageNum: 1,
            pageSize: 4 // 获取4篇，然后过滤掉当前文章
          });
          const filteredRelated = relatedResponse.records.filter(p => p.id !== postId).slice(0, 3);
          setRelatedPosts(filteredRelated);
        } catch (relatedError) {
          console.error('获取相关文章失败:', relatedError);
          // 相关文章失败不影响主文章展示
        }
      } catch (error) {
        console.error('获取文章详情失败:', error);
        setError('文章加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {error || '文章未找到'}
        </h2>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Badge variant="primary">
            {post.categoryName}
          </Badge>
          {post.isTop && (
            <Badge variant="warning" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>置顶</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Author Info & Related Posts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Author Info */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">作者信息</h3>
            <div className="flex flex-col items-center text-center space-y-3">
              <img
                src={post.authorAvatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                alt={post.authorName}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{post.authorName}</h4>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  作者
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              关注作者
            </Button>
          </Card>

          {/* Related Posts */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">相关内容</h3>
            <div className="space-y-3">
              {relatedPosts.map((relatedPost) => (
                <div 
                  key={relatedPost.id} 
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => navigate(routeUtils.getPostDetailRoute(relatedPost.id))}
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {relatedPost.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{relatedPost.likeCount} 赞</span>
                    <span>{relatedPost.commentCount} 评论</span>
                    <span>{relatedPost.viewCount} 浏览</span>
                  </div>
                </div>
              ))}
              {relatedPosts.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  暂无相关文章
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={post.authorAvatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                  alt={post.authorName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      作者
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(post.publishTime)}</p>
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

            {/* Post Summary - 移到内容上方 */}
            {post.summary && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📝 文章摘要</h3>
                <p className="text-sm text-blue-800">{post.summary}</p>
              </div>
            )}

            {/* Tags - 移到内容上方 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">🏷️ 标签：</span>
                <Badge variant="secondary" className="hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                  #{post.categoryName}
                </Badge>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              {/* 使用 Markdown 渲染器显示文章内容 */}
              <div className="prose-content">
                <MarkdownEditor
                  value={post.content}
                  onChange={() => {}} // 只读模式，不需要处理变更
                  previewOnly={true}
                  height="auto"
                  toolbar={false}
                  className="!border-none !shadow-none !bg-transparent"
                  enableFullscreen={false}
                  enableToc={false}
                />
              </div>
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
                  <span>{post.likeCount + (isLiked ? 1 : 0)}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{commentCount > 0 ? commentCount : post.commentCount}</span>
                </Button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>浏览 {post.viewCount}</span>
                </div>
                
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
          <CommentsSection
            businessId={post.id}
            businessType="POST"
            currentUser={user}
            onCommentCountChange={handleCommentCountChange}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
};