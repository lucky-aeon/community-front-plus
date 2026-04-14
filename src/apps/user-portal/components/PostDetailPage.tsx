import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { ReactionBar } from '@shared/components/ui/ReactionBar';
import { Comments } from '@shared/components/ui/Comments';
import { SubscribeButton } from '@/components/ui/subscribe-button';
import { LikeButton } from '@shared/components/ui/LikeButton';
import { FavoriteButton } from '@shared/components/business/FavoriteButton';
import { ShareButton } from '@shared/components/ui/ShareButton';
// 评论组件
import { routeUtils } from '@shared/routes/routes';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDetailDTO, FrontPostDTO, UserPublicProfileDTO } from '@shared/types';
import { UserService } from '@shared/services/api/user.service';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  // 评论计数由后端返回，评论模块已移除
  const [post, setPost] = useState<FrontPostDetailDTO | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<FrontPostDTO[]>([]);
  const [authorProfile, setAuthorProfile] = useState<UserPublicProfileDTO | null>(null);
  const [sameCategoryPosts, setSameCategoryPosts] = useState<FrontPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // AI 总结：折叠
  const [aiCollapsed, setAiCollapsed] = useState(true);

  // 页面标题：文章标题优先
  useDocumentTitle(post?.title || '帖子详情');

  const scrollToComments = () => {
    const el = document.getElementById('comments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        // 并行拉取作者公开资料（含标签）
        try {
          const profile = await UserService.getUserPublicProfile(postDetail.authorId);
          setAuthorProfile(profile);
        } catch (e) {
          console.error('获取作者公开资料失败:', e);
        }
        
        // 获取作者的其他文章（最多3篇），同分类类型优先
        try {
          const relatedResponse = await PostsService.getUserPublicPosts(postDetail.authorId, {
            pageNum: 1,
            pageSize: 4,
            categoryType: postDetail.categoryType
          });
          const filteredRelated = relatedResponse.records.filter(p => p.id !== postId).slice(0, 3);
          setRelatedPosts(filteredRelated);
        } catch (relatedError) {
          console.error('获取作者其他文章失败:', relatedError);
          // 相关文章失败不影响主文章展示
        }

        // 获取同类型文章（同分类，最多5篇）
        try {
          if (postDetail.categoryId) {
            const sameCategoryResp = await PostsService.getPublicPosts({
              pageNum: 1,
              pageSize: 6,
              categoryId: postDetail.categoryId,
            });
            const filtered = sameCategoryResp.records.filter(p => p.id !== postId).slice(0, 5);
            setSameCategoryPosts(filtered);
          } else {
            setSameCategoryPosts([]);
          }
        } catch (sameCatErr) {
          console.error('获取同类型文章失败:', sameCatErr);
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
          {/* 问答解决状态：仅 categoryType 为 QA 时展示 */}
          {post.categoryType === 'QA' && (
            (post.acceptedCommentIds && post.acceptedCommentIds.length > 0) ? (
              <Badge variant="secondary" className="bg-emerald-500 text-white border-0">已解决</Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600">未解决</Badge>
            )
          )}
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
            <div className="flex flex-col items-center text-center space-y-3">
              {/* 点击头像跳转到作者主页 */}
              <div
                className="cursor-pointer hover:opacity-90 transition"
                onClick={() => navigate(routeUtils.getUserProfileRoute(post.authorId))}
                role="button"
                aria-label="查看作者主页"
              >
                <Avatar size={96} shape="rounded" framed>
                  <AvatarImage src={post.authorAvatar || undefined} alt={post.authorName} />
                  <AvatarFallback>{(post.authorName || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <h4
                  className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(routeUtils.getUserProfileRoute(post.authorId))}
                >
                  {post.authorName}
                </h4>
                {authorProfile?.tags && authorProfile.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {authorProfile.tags.slice(0, 6).map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5">{t}</Badge>
                    ))}
                    {authorProfile.tags.length > 6 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">+{authorProfile.tags.length - 6}</Badge>
                    )}
                  </div>
                )}
                {post.authorDescription && (
                  <p className="text-sm text-gray-600 line-clamp-3">{post.authorDescription}</p>
                )}
              </div>
            </div>
            <SubscribeButton
              targetId={post.authorId}
              targetType="USER"
              size="sm"
              className="w-full mt-4"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => navigate(routeUtils.getUserProfileRoute(post.authorId))}
            >
              查看Ta的主页
            </Button>
          </Card>
          {/* Related Posts - 作者的其他文章（无数据不展示） */}
          {relatedPosts.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">作者的其他文章</h3>
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
              </div>
            </Card>
          )}

          {/* Same Category Posts - 同类型文章（无数据不展示） */}
          {sameCategoryPosts.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">同类型文章</h3>
              <div className="space-y-3">
                {sameCategoryPosts.map((p) => (
                  <div
                    key={p.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => navigate(routeUtils.getPostDetailRoute(p.id))}
                  >
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {p.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{p.likeCount} 赞</span>
                      <span>{p.viewCount} 浏览</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="p-6">
            {/* Post Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
            {/* Publish Time */}
            {post.publishTime && (
              <div className="text-sm text-gray-500 mb-4">发布于 {post.publishTime}</div>
            )}

            {/* Top Actions: 点赞 / 收藏 / 评论数 / 浏览数 */}
            <div className="flex items-center gap-4 mb-6">
              <LikeButton
                businessType="POST"
                businessId={post.id}
                initialCount={post.likeCount}
                onChange={(s) => setPost(prev => prev ? { ...prev, likeCount: s.likeCount } : prev)}
              />
              <FavoriteButton
                targetId={post.id}
                targetType="POST"
                variant="ghost"
                size="sm"
                showCount={true}
              />
              <ShareButton
                businessType="POST"
                businessId={post.id}
                shareTitle={post.title}
                shareDescription={post.summary || post.content?.slice(0, 100)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
                onClick={scrollToComments}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </Button>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
            </div>

            {/* 表情操作也放到顶部 */}
            <ReactionBar businessType={'POST'} businessId={post.id} className="mb-4 -mt-4" />
            <Separator className="my-4" />

            {/* AI Summary */}
            {post.aiSummary && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-purple-900">🤖 AI 总结（基于文章与评论）</h3>
                  <button
                    type="button"
                    className="text-xs text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                    onClick={() => setAiCollapsed((v) => !v)}
                  >
                    {aiCollapsed ? '展开' : '收起'}
                    {aiCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
                {!aiCollapsed && (
                  <div className="prose-content mt-3">
                    <MarkdownEditor
                      value={post.aiSummary}
                      onChange={() => {}}
                      previewOnly
                      height="auto"
                      toolbar={false}
                      className="!border-none !shadow-none !bg-transparent"
                      enableFullscreen={false}
                      enableToc={false}
                    />
                  </div>
                )}
              </div>
            )}

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
              {/* 顶部已提供表情操作，此处移除避免重复 */}
            </div>

            {/* 底部操作行移除：按产品需求仅保留顶部操作 */}
          </Card>

          <div id="comments">
            <Comments
            businessId={post.id}
            businessType="POST"
            authorId={post.authorId}
            isQA={post.categoryType === 'QA'}
            onCountChange={(n) => setPost(prev => prev ? { ...prev, commentCount: n } : prev)}
            onQAResolveChange={({ action, commentId }) => {
              setPost(prev => {
                if (!prev) return prev;
                // 非问答则不处理
                if (typeof prev.acceptedCommentIds === 'undefined') return prev;
                const set = new Set(prev.acceptedCommentIds || []);
                if (action === 'accept') set.add(commentId);
                if (action === 'revoke') set.delete(commentId);
                return { ...prev, acceptedCommentIds: Array.from(set) } as FrontPostDetailDTO;
              });
            }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
