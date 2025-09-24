import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageSquare, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { Comments } from '@shared/components/ui/Comments';
import { SubscribeButton } from '@/components/ui/subscribe-button';
// 评论组件
import { routeUtils } from '@shared/routes/routes';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDetailDTO, FrontPostDTO } from '@shared/types';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  // 评论计数由后端返回，评论模块已移除
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

  // 取消作者关注状态逻辑（页面不再展示作者卡片/关注按钮）

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-6 w-40" />
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </Card>
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
          {/* 与列表页一致：分类使用 outline 风格，不带 hover 变色 */}
          <Badge variant="outline" className="text-sm">
            {post.categoryName}
          </Badge>
          {post.isTop && (
            <Badge variant="secondary" className="flex items-center space-x-1 bg-yellow-500 text-white border-0">
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
                {/* 作者 tag 已移除 */}
              </div>
            </div>
            <SubscribeButton
              targetId={post.authorId}
              targetType="USER"
              size="sm"
              className="w-full mt-4"
            />
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
                    {/* 作者 tag 已移除 */}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(post.publishTime)}</p>
                </div>
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
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700 mr-1">🏷️ 标签：</span>
                {post.tags.map((t) => (
                  <Badge key={t} variant="outline" className="cursor-default text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

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
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>{post.likeCount}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.commentCount}</span>
                </Button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>浏览 {post.viewCount}</span>
                </div>
              </div>
            </div>
          </Card>

          <Comments businessId={post.id} businessType="POST" authorId={post.authorId} />
        </div>
      </div>
    </div>
  );
};
