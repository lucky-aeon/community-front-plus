import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Heart, Clock, ArrowLeft } from 'lucide-react';
import { routeUtils } from '@shared/routes/routes';
import { PostsService } from '@shared/services/api/posts.service';
import { UserService } from '@shared/services/api/user.service';
import { FrontPostDTO, PageResponse, UserPublicProfileDTO, CommentDTO } from '@shared/types';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { CommentsService } from '@shared/services/api/comments.service';
import { ChaptersService } from '@shared/services/api';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

// 用户公开主页：展示用户公开资料 + 该用户发布的文章/问答 + 最近评论（mock）
export const UserPublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 顶部用户信息
  const [profile, setProfile] = useState<UserPublicProfileDTO | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 列表：文章/问答
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [postFilter, setPostFilter] = useState<'all' | 'ARTICLE' | 'QA'>('all');
  const [postsPage, setPostsPage] = useState(1);
  const [postsPageData, setPostsPageData] = useState<PageResponse<FrontPostDTO> | null>(null);
  const [posts, setPosts] = useState<FrontPostDTO[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // 评论列表（公开：该用户发布的评论）
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentsPageData, setCommentsPageData] = useState<PageResponse<CommentDTO> | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [loadingComments, setLoadingComments] = useState(true);

  // 设置页面标题（优先显示用户名）
  useDocumentTitle(profile ? `${profile.name} 的主页` : '用户主页');

  // 从 URL 初始化 tab/filter/page，使分享链接可还原
  useEffect(() => {
    const tab = (searchParams.get('tab') || 'posts') as 'posts' | 'comments';
    const filter = (searchParams.get('type') || 'all') as 'all' | 'ARTICLE' | 'QA';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    if (tab !== activeTab) setActiveTab(tab);
    if (filter !== postFilter) setPostFilter(filter);
    if (page !== postsPage) setPostsPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 拉取用户公开资料
  useEffect(() => {
    let canceled = false;
    const run = async () => {
      if (!userId) return;
      try {
        setLoadingProfile(true);
        const data = await UserService.getUserPublicProfile(userId);
        if (!canceled) setProfile(data);
      } catch (e) {
        console.error('获取用户公开资料失败:', e);
      } finally {
        if (!canceled) setLoadingProfile(false);
      }
    };
    run();
    return () => { canceled = true; };
  }, [userId]);

  // 拉取该用户的公开文章/问答
  useEffect(() => {
    let canceled = false;
    const run = async () => {
      if (!userId) return;
      try {
        setLoadingPosts(true);
        const categoryType = postFilter === 'all' ? undefined : postFilter;
        const pageResp = await PostsService.getUserPublicPosts(userId, {
          pageNum: postsPage,
          pageSize: 10,
          categoryType
        });
        if (!canceled) {
          setPosts(pageResp.records);
          setPostsPageData(pageResp);
        }
      } catch (e) {
        console.error('获取用户文章失败:', e);
      } finally {
        if (!canceled) setLoadingPosts(false);
      }
    };
    run();
    return () => { canceled = true; };
  }, [userId, postsPage, postFilter]);

  // 拉取该用户发布的评论（公开）
  useEffect(() => {
    let canceled = false;
    const run = async () => {
      if (!userId) return;
      try {
        setLoadingComments(true);
        const resp = await CommentsService.getUserPublishedComments(userId, {
          pageNum: commentsPage,
          pageSize: 10,
        });
        if (!canceled) {
          setComments(resp.records);
          setCommentsPageData(resp);
        }
      } catch (e) {
        console.error('获取用户评论失败:', e);
      } finally {
        if (!canceled) setLoadingComments(false);
      }
    };
    run();
    return () => { canceled = true; };
  }, [userId, commentsPage]);

  // 交互：切换文章过滤、分页、tab
  const handlePostFilterChange = (val: string) => {
    const v = (val as 'all' | 'ARTICLE' | 'QA');
    setPostFilter(v);
    setPostsPage(1);
    setSearchParams({ tab: activeTab, type: v, page: '1' });
  };

  const handlePostsPageChange = (page: number) => {
    setPostsPage(page);
    setSearchParams({ tab: activeTab, type: postFilter, page: String(page) });
  };

  const handleTabChange = (v: string) => {
    const tab = v as 'posts' | 'comments';
    setActiveTab(tab);
    // 切换tab时保持当前过滤与页码（或重置为1也可）
    setSearchParams({ tab, type: postFilter, page: String(postsPage) });
  };

  const handleCommentsPageChange = (page: number) => {
    setCommentsPage(page);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = Math.max(0, now.getTime() - d.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins > 0) return `${mins}分钟前`;
    return '刚刚';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 返回 */}
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Button>
      </div>

      {/* 顶部：公开资料 */}
      <Card className="p-6 mb-6">
        {loadingProfile ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-14" />
                ))}
              </div>
            </div>
          </div>
        ) : profile ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
                <AvatarFallback>{(profile.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  {Array.isArray(profile.tags) && profile.tags.slice(0, 4).map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5">{t}</Badge>
                  ))}
                  {Array.isArray(profile.tags) && profile.tags.length > 4 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">+{profile.tags.length - 4}</Badge>
                  )}
                </div>
                {profile.description && (
                  <p className="text-gray-600 mt-1 max-w-2xl">{profile.description}</p>
                )}
                {profile.createTime && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 加入于 {new Date(profile.createTime).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">未找到该用户</div>
        )}
      </Card>

      {/* 主体：文章/评论 */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="h-11">
          <TabsTrigger value="posts">文章与问答</TabsTrigger>
          <TabsTrigger value="comments">最近评论</TabsTrigger>
        </TabsList>

        {/* 文章与问答列表 */}
        <TabsContent value="posts">
          {/* 过滤：全部 / 文章 / 问答 */}
          <div className="mb-4">
            <Tabs value={postFilter} onValueChange={handlePostFilterChange}>
              <TabsList className="h-10">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="ARTICLE">文章</TabsTrigger>
                <TabsTrigger value="QA">问答</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 列表 */}
          {loadingPosts ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="grid gap-4 items-start sm:grid-cols-[1fr_192px]">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="hidden sm:block">
                      <Skeleton className="w-full h-24 rounded-lg" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((p) => (
                <Card key={p.id} className="p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate(routeUtils.getPostDetailRoute(p.id))}>
                  <div className="grid gap-4 items-start sm:grid-cols-[1fr_192px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {p.categoryName && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs border-transparent">{p.categoryName}</Badge>
                        )}
                        {p.categoryType === 'QA' && (
                          <Badge variant="secondary" className="text-xs">问答</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{p.title}</h3>
                      {p.summary && <p className="text-sm text-gray-600 line-clamp-2">{p.summary}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {p.commentCount}</div>
                        <div className="flex items-center gap-1"><Heart className="h-4 w-4" /> {p.likeCount}</div>
                        <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {p.publishTime}</div>
                      </div>
                    </div>
                    {p.coverImage && (
                      <div className="hidden sm:block overflow-hidden rounded-lg h-24">
                        <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">暂无内容</div>
          )}

          {/* 分页器 */}
          {postsPageData && postsPageData.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" disabled={postsPage <= 1} onClick={() => handlePostsPageChange(postsPage - 1)}>上一页</Button>
              <span className="text-sm text-gray-600">第 {postsPage} 页，共 {postsPageData.pages} 页</span>
              <Button variant="outline" disabled={postsPage >= postsPageData.pages} onClick={() => handlePostsPageChange(postsPage + 1)}>下一页</Button>
            </div>
          )}
        </TabsContent>

        {/* 最近评论（该用户发布的评论） */}
        <TabsContent value="comments">
          {loadingComments ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </Card>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600 mb-1">{c.businessName || '相关内容'}</div>
                      <div className="prose-content">
                        <MarkdownEditor
                          value={c.content}
                          onChange={() => {}}
                          previewOnly
                          height="auto"
                          toolbar={false}
                          className="!border-none !shadow-none !bg-transparent"
                          enableFullscreen={false}
                          enableToc={false}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{formatTime(c.createTime)}</div>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            if (c.businessType === 'POST') {
                              navigate(routeUtils.getPostDetailRoute(c.businessId) + `#comment-${c.id}`);
                            } else if (c.businessType === 'COURSE') {
                              navigate(`/dashboard/courses/${c.businessId}#comment-${c.id}`);
                            } else if (c.businessType === 'CHAPTER') {
                              // 需要先查章节以拿到课程ID
                              const detail = await ChaptersService.getFrontChapterDetail(c.businessId);
                              navigate(`/dashboard/courses/${detail.courseId}/chapters/${c.businessId}#comment-${c.id}`);
                            } else if (c.businessType === 'INTERVIEW_QUESTION') {
                              navigate(`/dashboard/interviews/${c.businessId}#comment-${c.id}`);
                            }
                          } catch (e) {
                            console.error('跳转失败', e);
                          }
                        }}
                      >
                        查看上下文
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {commentsPageData && commentsPageData.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" disabled={commentsPage <= 1} onClick={() => handleCommentsPageChange(commentsPage - 1)}>上一页</Button>
                  <span className="text-sm text-gray-600">第 {commentsPage} 页，共 {commentsPageData.pages} 页</span>
                  <Button variant="outline" disabled={commentsPage >= (commentsPageData?.pages || 1)} onClick={() => handleCommentsPageChange(commentsPage + 1)}>下一页</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">暂无评论</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
