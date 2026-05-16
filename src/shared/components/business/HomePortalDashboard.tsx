import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Key,
  MessageSquare,
  Newspaper,
  PenLine,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AppAiNewsService,
  AppCodexPersistentService,
  ChaptersService,
  CommentsService,
  CoursesService,
  PostsService,
  UpdateLogService,
  UnreadService,
  UserLearningService,
} from '@shared/services/api';
import type {
  CodexPublicInstanceDTO,
  FrontPostDTO,
  FrontCourseDTO,
  LatestChapterDTO,
  LatestCommentDTO,
  LearningRecordItemDTO,
  TodayDailyDTO,
  UnreadSummaryDTO,
  UpdateLogDTO,
} from '@shared/types';
import { ROUTES, routeUtils } from '@shared/routes/routes';
import { showToast } from '@shared/utils/toast';
import { cn } from '@shared/utils/cn';

interface HomePortalDashboardProps {
  userName?: string;
}

type LoadingState = {
  learning: boolean;
  chapters: boolean;
  posts: boolean;
  comments: boolean;
  aiDaily: boolean;
  codex: boolean;
  logs: boolean;
  unread: boolean;
};

const emptyUnread: UnreadSummaryDTO = {
  postsUnread: 0,
  questionsUnread: 0,
  chaptersUnread: 0,
  chatsUnread: 0,
  postIds: [],
  questionIds: [],
  chapterIds: [],
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const formatDateTime = (date?: string) => {
  if (!date) return '暂无记录';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (date?: string) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return formatDate(date);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  return '刚刚';
};

const maskKey = (key?: string) => {
  if (!key) return '暂无 Key';
  if (key.length <= 12) return key;
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
};

const SectionTitle: React.FC<{
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-500" />
        <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      </div>
      {description && <p className="mt-1 text-sm text-warm-gray-500">{description}</p>}
    </div>
    {action}
  </div>
);

const ProgressLine: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
    <div
      className="h-full rounded-full bg-orange-500 transition-all"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

const NewBadge: React.FC = () => (
  <span className="inline-flex shrink-0 items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
    新
  </span>
);

const CourseCover: React.FC<{ title?: string; coverImage?: string; size?: 'sm' | 'lg' }> = ({ title, coverImage, size = 'sm' }) => {
  const text = title?.trim()?.slice(0, 2).toUpperCase() || 'AI';
  if (coverImage) {
    return (
      <div className={cn(
        'shrink-0 overflow-hidden rounded-md bg-gray-100 shadow-sm',
        size === 'lg' ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-11 w-11'
      )}>
        <img
          src={coverImage}
          alt={title || '课程封面'}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      'flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 text-center text-white shadow-sm',
      size === 'lg' ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-11 w-11'
    )}>
      <div>
        <div className={cn('font-bold leading-none text-orange-200', size === 'lg' ? 'text-3xl' : 'text-sm')}>
          {text}
        </div>
        {size === 'lg' && <div className="mt-1 text-xs font-medium text-orange-100">专栏</div>}
      </div>
    </div>
  );
};

export const HomePortalDashboard: React.FC<HomePortalDashboardProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [learningRecords, setLearningRecords] = useState<LearningRecordItemDTO[]>([]);
  const [chapters, setChapters] = useState<LatestChapterDTO[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, FrontCourseDTO>>({});
  const [posts, setPosts] = useState<FrontPostDTO[]>([]);
  const [comments, setComments] = useState<LatestCommentDTO[]>([]);
  const [todayDaily, setTodayDaily] = useState<TodayDailyDTO | null>(null);
  const [codexInstances, setCodexInstances] = useState<CodexPublicInstanceDTO[]>([]);
  const [logs, setLogs] = useState<UpdateLogDTO[]>([]);
  const [unread, setUnread] = useState<UnreadSummaryDTO>(emptyUnread);
  const [loading, setLoading] = useState<LoadingState>({
    learning: true,
    chapters: true,
    posts: true,
    comments: true,
    aiDaily: true,
    codex: true,
    logs: true,
    unread: true,
  });

  const setDone = useCallback((key: keyof LoadingState) => {
    setLoading(prev => ({ ...prev, [key]: false }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    void UserLearningService.listMyLearningRecords(1, 1)
      .then(page => { if (!cancelled) setLearningRecords(page.records || []); })
      .catch(e => console.error('首页加载最近学习失败:', e))
      .finally(() => { if (!cancelled) setDone('learning'); });

    void ChaptersService.getLatestChapters()
      .then(list => { if (!cancelled) setChapters((list || []).slice(0, 5)); })
      .catch(e => console.error('首页加载最新章节失败:', e))
      .finally(() => { if (!cancelled) setDone('chapters'); });

    void CoursesService.getFrontCoursesList({ pageNum: 1, pageSize: 100 })
      .then(page => {
        if (cancelled) return;
        const nextMap = (page.records || []).reduce<Record<string, FrontCourseDTO>>((acc, course) => {
          acc[course.id] = course;
          return acc;
        }, {});
        setCourseMap(nextMap);
      })
      .catch(e => console.error('首页加载课程封面失败:', e));

    void PostsService.getPublicPosts({ pageNum: 1, pageSize: 6, isTop: false })
      .then(page => { if (!cancelled) setPosts(page.records || []); })
      .catch(e => console.error('首页加载社区内容失败:', e))
      .finally(() => { if (!cancelled) setDone('posts'); });

    void CommentsService.getLatestComments()
      .then(list => { if (!cancelled) setComments((list || []).slice(0, 3)); })
      .catch(e => console.error('首页加载最新评论失败:', e))
      .finally(() => { if (!cancelled) setDone('comments'); });

    void AppAiNewsService.getToday()
      .then(data => { if (!cancelled) setTodayDaily(data); })
      .catch(e => console.error('首页加载AI日报失败:', e))
      .finally(() => { if (!cancelled) setDone('aiDaily'); });

    void AppCodexPersistentService.listInfos()
      .then(list => { if (!cancelled) setCodexInstances(Array.isArray(list) ? list : []); })
      .catch(e => console.error('首页加载Codex配置失败:', e))
      .finally(() => { if (!cancelled) setDone('codex'); });

    void UpdateLogService.getPublicUpdateLogs()
      .then(list => { if (!cancelled) setLogs((list || []).slice(0, 3)); })
      .catch(e => console.error('首页加载更新日志失败:', e))
      .finally(() => { if (!cancelled) setDone('logs'); });

    void UnreadService.getDetails()
      .then(data => { if (!cancelled) setUnread(data); })
      .catch(e => console.error('首页加载未读详情失败:', e))
      .finally(() => { if (!cancelled) setDone('unread'); });

    return () => { cancelled = true; };
  }, [setDone]);

  const firstLearning = learningRecords[0];
  const unreadPostIds = useMemo(() => new Set(unread.postIds || []), [unread.postIds]);
  const unreadChapterIds = useMemo(() => new Set(unread.chapterIds || []), [unread.chapterIds]);
  const goContinueLearning = () => {
    if (!firstLearning) {
      navigate('/dashboard/courses');
      return;
    }
    if (firstLearning.lastAccessChapterId) {
      navigate(`/dashboard/courses/${firstLearning.courseId}/chapters/${firstLearning.lastAccessChapterId}`);
      return;
    }
    navigate(`/dashboard/courses/${firstLearning.courseId}`);
  };

  const copyKey = async (key?: string) => {
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      showToast.success('API Key 已复制');
    } catch (e) {
      console.error('复制 API Key 失败:', e);
      showToast.error('复制失败，请手动复制');
    }
  };

  const jumpToCommentTarget = async (comment: LatestCommentDTO) => {
    try {
      if (comment.businessType === 'POST') {
        navigate(`${routeUtils.getPostDetailRoute(comment.businessId)}#comment-${comment.id}`);
        return;
      }
      if (comment.businessType === 'COURSE') {
        navigate(`${routeUtils.getCourseDetailRoute(comment.businessId)}#comment-${comment.id}`);
        return;
      }
      if (comment.businessType === 'CHAPTER') {
        const detail = await ChaptersService.getFrontChapterDetail(comment.businessId);
        navigate(`/dashboard/courses/${detail.courseId}/chapters/${comment.businessId}#comment-${comment.id}`);
        return;
      }
      if (comment.businessType === 'INTERVIEW_QUESTION') {
        navigate(`${routeUtils.getInterviewDetailRoute(comment.businessId)}#comment-${comment.id}`);
      }
    } catch (e) {
      console.error('首页最新评论跳转失败:', e);
      if (comment.businessType === 'POST') navigate(routeUtils.getPostDetailRoute(comment.businessId));
      if (comment.businessType === 'COURSE') navigate(routeUtils.getCourseDetailRoute(comment.businessId));
      if (comment.businessType === 'INTERVIEW_QUESTION') navigate(routeUtils.getInterviewDetailRoute(comment.businessId));
    }
  };

  return (
    <div className="space-y-6 py-5">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-gray-950 sm:text-3xl">
            晚上好，{userName || '同学'}
          </h1>
          <p className="mt-2 text-sm text-warm-gray-500">欢迎回来，继续你的学习之旅吧！</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatusCard
            icon={MessageSquare}
            value={unread.postsUnread}
            label="个新讨论"
            detail="社区更新"
            loading={loading.unread}
          />
          <StatusCard
            icon={BookOpen}
            value={unread.chaptersUnread}
            label="个新章节"
            detail="课程更新"
            loading={loading.unread}
          />
          <StatusCard
            icon={TrendingUp}
            value={Math.round(firstLearning?.progressPercent ?? 0)}
            suffix="%"
            label="学习进度"
            detail={firstLearning ? `${firstLearning.completedChapters}/${firstLearning.totalChapters} 章` : '待开始'}
            loading={loading.learning}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.85fr)]">
        <div data-plus-guide="home-learning" className="min-w-0">
          <LearningFocusCard
            learning={firstLearning}
            coverImage={firstLearning ? courseMap[firstLearning.courseId]?.coverImage : undefined}
            isLoading={loading.learning}
            onContinue={goContinueLearning}
            onViewAll={() => navigate('/dashboard/user-backend/learning')}
            onChooseCourse={() => navigate('/dashboard/courses')}
          />
        </div>

        <TodayActionCard
          comments={comments}
          posts={posts}
          unreadPostIds={unreadPostIds}
          isLoading={loading.comments || loading.posts}
          onOpenMessages={() => navigate(ROUTES.USER_BACKEND_MESSAGES)}
          onOpenDiscussions={() => navigate('/dashboard/discussions')}
          onOpenComment={jumpToCommentTarget}
        />
      </section>

      <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3">
        <div data-plus-guide="home-recent-chapters" className="min-w-0">
          <LatestChaptersCard
            chapters={chapters}
            courseMap={courseMap}
            unreadChapterIds={unreadChapterIds}
            isLoading={loading.chapters}
            onOpenChapter={(courseId, chapterId) => navigate(`/dashboard/courses/${courseId}/chapters/${chapterId}`)}
            onOpenCourse={(courseId) => navigate(`/dashboard/courses/${courseId}`)}
            onViewAll={() => navigate('/dashboard/courses')}
          />
        </div>
        <div data-plus-guide="home-pinned-posts" className="min-w-0">
          <CommunityFeedCard
            posts={posts}
            unreadPostIds={unreadPostIds}
            isLoading={loading.posts}
            onOpenPost={(id) => navigate(`/dashboard/discussions/${id}`)}
            onViewAll={() => navigate('/dashboard/discussions')}
            onCreatePost={() => navigate(ROUTES.USER_BACKEND_ARTICLES_CREATE)}
          />
        </div>
        <div className="min-w-0">
          <ToolsAndAnnouncementsCard
            todayDaily={todayDaily}
            codexInstances={codexInstances}
            logs={logs}
            isLoadingDaily={loading.aiDaily}
            isLoadingCodex={loading.codex}
            isLoadingLogs={loading.logs}
            onCopyKey={copyKey}
            onOpenDaily={() => navigate(todayDaily?.date ? `/dashboard/ai-news/daily/${encodeURIComponent(todayDaily.date)}` : '/dashboard/ai-news')}
            onOpenAiNews={() => navigate('/dashboard/ai-news')}
            onOpenChangelog={() => navigate('/dashboard/changelog')}
          />
        </div>
      </section>
    </div>
  );
};

const StatusCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  detail: string;
  suffix?: string;
  loading?: boolean;
}> = ({ icon: Icon, label, value, detail, suffix, loading }) => (
  <div className="flex min-h-[72px] items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
      <Icon className="h-5 w-5" />
    </div>
    {loading ? (
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
    ) : (
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-950">
          <span className="text-lg tabular-nums">{value}{suffix}</span>
          <span className="ml-1">{label}</span>
        </div>
        <div className="mt-0.5 text-xs text-warm-gray-500">{detail}</div>
      </div>
    )}
  </div>
);

const LearningFocusCard: React.FC<{
  learning?: LearningRecordItemDTO;
  coverImage?: string;
  isLoading: boolean;
  onContinue: () => void;
  onViewAll: () => void;
  onChooseCourse: () => void;
}> = ({ learning, coverImage, isLoading, onContinue, onViewAll, onChooseCourse }) => (
  <Card className="h-full border-gray-100 p-5 shadow-sm sm:p-6">
    <SectionTitle
      icon={BookOpen}
      title="继续学习"
      action={<Button variant="ghost" size="sm" onClick={onViewAll}>查看全部</Button>}
    />
    {isLoading ? (
      <div className="mt-5 flex gap-5">
        <Skeleton className="h-24 w-24 rounded-md sm:h-28 sm:w-28" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    ) : learning ? (
      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <CourseCover title={learning.courseTitle} coverImage={coverImage} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onContinue}
              className="text-left text-xl font-semibold leading-tight text-gray-950 transition-colors hover:text-orange-600 sm:text-2xl"
            >
              {learning.courseTitle}
            </button>
            <Badge variant="outline" className="border-orange-100 bg-orange-50 text-orange-700">
              {learning.completed ? '已完成' : '进行中'}
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 border-b border-gray-100 pb-3 text-sm">
            <span className="text-warm-gray-500">已学 {learning.progressPercent ?? 0}%</span>
            <span className="shrink-0 text-warm-gray-500">共 {learning.totalChapters} 章</span>
          </div>
          <div className="mt-4 text-xs font-medium text-warm-gray-500">当前章节</div>
          <p className="mt-1 line-clamp-2 text-base font-medium text-gray-950">
            {learning.lastAccessChapterTitle || '从课程第一章开始'}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <ProgressLine value={learning.progressPercent ?? 0} />
            <span className="w-10 text-right text-sm font-semibold tabular-nums text-gray-950">{learning.progressPercent ?? 0}%</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-warm-gray-500">
            <span>{learning.completedChapters} / {learning.totalChapters} 章节</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              最近学习：{formatDateTime(learning.lastAccessTime)}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="primary" onClick={onContinue}>
              <Play className="h-4 w-4" />
              继续学习
            </Button>
            <Button variant="outline" onClick={onViewAll}>学习记录</Button>
          </div>
        </div>
      </div>
    ) : (
      <div className="mt-5 rounded-lg border border-dashed border-orange-200 bg-orange-50/50 p-5">
        <div className="text-base font-semibold text-gray-950">还没有学习记录</div>
        <p className="mt-1 text-sm text-warm-gray-600">先选一门课程，首页会自动记录你的进度。</p>
        <Button variant="primary" className="mt-4" onClick={onChooseCourse}>去选课</Button>
      </div>
    )}
  </Card>
);

const TodayActionCard: React.FC<{
  comments: LatestCommentDTO[];
  posts: FrontPostDTO[];
  unreadPostIds: Set<string>;
  isLoading: boolean;
  onOpenMessages: () => void;
  onOpenDiscussions: () => void;
  onOpenComment: (comment: LatestCommentDTO) => void;
}> = ({ comments, posts, unreadPostIds, isLoading, onOpenMessages, onOpenDiscussions, onOpenComment }) => (
  <Card className="h-full border-gray-100 p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-orange-500" />
        <h2 className="text-base font-semibold text-gray-950">今日动态</h2>
      </div>
      <Button variant="ghost" size="sm" onClick={onOpenMessages}>查看全部</Button>
    </div>
    {isLoading ? (
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
      </div>
    ) : (
      <div className="mt-4 divide-y divide-gray-100">
        <ActivitySection title={`社区最新评论 (${comments.length})`} onClick={onOpenDiscussions}>
          {comments.slice(0, 2).map(comment => (
            <ActivityTimelineItem
              key={comment.id}
              title={comment.content}
              meta={`${comment.commentUserName} · ${comment.businessName} · ${formatRelativeTime(comment.createTime)}`}
              onClick={() => onOpenComment(comment)}
            />
          ))}
          {comments.length === 0 && <ActivityMuted text="暂无社区最新评论" />}
        </ActivitySection>
        <ActivitySection title={`最新讨论 (${posts.length})`} onClick={onOpenDiscussions}>
          {posts.slice(0, 3).map(post => (
            <ActivityPlainItem
              key={post.id}
              title={post.title}
              meta={`${post.viewCount} 浏览 · ${post.commentCount} 评论 · ${post.likeCount} 点赞`}
              badge={post.categoryName}
              isUnread={unreadPostIds.has(post.id)}
            />
          ))}
          {posts.length === 0 && <ActivityMuted text="暂无最新讨论" />}
        </ActivitySection>
      </div>
    )}
  </Card>
);

const ActivitySection: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
  <div className="py-4 first:pt-0 last:pb-0">
    <button
      type="button"
      className="mb-3 flex w-full items-center justify-between text-left text-sm font-semibold text-gray-950 hover:text-orange-600"
      onClick={onClick}
    >
      <span>{title}</span>
      <ChevronRight className="h-4 w-4 text-warm-gray-400" />
    </button>
    <div className="space-y-3">{children}</div>
  </div>
);

const ActivityTimelineItem: React.FC<{ title: string; meta: string; onClick?: () => void }> = ({ title, meta, onClick }) => (
  <button
    type="button"
    className="relative block w-full cursor-pointer pl-5 text-left transition-colors hover:text-orange-600"
    onClick={onClick}
  >
    <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full border border-orange-300 bg-white" />
    <span className="absolute left-[3px] top-5 h-[calc(100%-0.25rem)] w-px bg-gray-100" />
    <div className="line-clamp-1 text-sm font-medium text-gray-950">{title}</div>
    <div className="mt-1 line-clamp-1 text-xs text-warm-gray-500">{meta}</div>
  </button>
);

const ActivityPlainItem: React.FC<{ title: string; meta: string; badge?: string; action?: React.ReactNode; isUnread?: boolean }> = ({ title, meta, badge, action, isUnread }) => (
  <div className="flex items-center gap-3">
    {badge && (
      <Badge variant="outline" className="shrink-0 border-green-100 bg-green-50 text-green-700">
        {badge}
      </Badge>
    )}
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="min-w-0 flex-1 line-clamp-1 text-sm font-medium text-gray-950">{title}</div>
        {isUnread && <NewBadge />}
      </div>
      <div className="mt-1 line-clamp-1 text-xs text-warm-gray-500">{meta}</div>
    </div>
    {action}
  </div>
);

const ActivityMuted: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-warm-gray-500">{text}</div>
);

const LatestChaptersCard: React.FC<{
  chapters: LatestChapterDTO[];
  courseMap: Record<string, FrontCourseDTO>;
  unreadChapterIds: Set<string>;
  isLoading: boolean;
  onOpenChapter: (courseId: string, chapterId: string) => void;
  onOpenCourse: (courseId: string) => void;
  onViewAll: () => void;
}> = ({ chapters, courseMap, unreadChapterIds, isLoading, onOpenChapter, onOpenCourse, onViewAll }) => (
  <Card className="h-full border-gray-100 p-5 shadow-sm">
    <SectionTitle
      icon={Sparkles}
      title="最新章节"
      action={<Button variant="ghost" size="sm" onClick={onViewAll}>课程</Button>}
    />
    <div className="mt-4 space-y-3">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)
      ) : chapters.length > 0 ? (
        chapters.map(chapter => {
          const isUnread = unreadChapterIds.has(chapter.id);
          return (
            <div
              key={chapter.id}
              className={cn(
                'group flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-orange-50/50',
                isUnread && 'bg-orange-50/60'
              )}
            >
              <CourseCover title={chapter.courseName} coverImage={courseMap[chapter.courseId]?.coverImage} />
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => onOpenChapter(chapter.courseId, chapter.id)}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="min-w-0 flex-1 line-clamp-1 text-sm font-medium text-gray-950 group-hover:text-orange-600">
                    {chapter.title}
                  </span>
                  {isUnread && <NewBadge />}
                </span>
                <span className="mt-1 block line-clamp-1 text-xs text-warm-gray-500">
                  {chapter.courseName} · 第 {chapter.sortOrder} 章
                </span>
              </button>
              <button
                type="button"
                className="shrink-0 text-xs text-warm-gray-500 hover:text-orange-600"
                onClick={() => onOpenCourse(chapter.courseId)}
              >
                {formatRelativeTime(chapter.createTime) || `${chapter.readingTime} 分钟`}
              </button>
            </div>
          );
        })
      ) : (
        <EmptyBlock icon={BookOpen} text="暂无最新章节" />
      )}
    </div>
  </Card>
);

const CommunityFeedCard: React.FC<{
  posts: FrontPostDTO[];
  unreadPostIds: Set<string>;
  isLoading: boolean;
  onOpenPost: (id: string) => void;
  onViewAll: () => void;
  onCreatePost: () => void;
}> = ({ posts, unreadPostIds, isLoading, onOpenPost, onViewAll, onCreatePost }) => (
  <Card className="h-full border-gray-100 p-5 shadow-sm" data-plus-guide="home-recent-articles">
    <SectionTitle
      icon={MessageSquare}
      title="社区正在讨论"
      action={(
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCreatePost}>
            <PenLine className="h-4 w-4" />
            发布文章
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewAll}>查看全部</Button>
        </div>
      )}
    />
    <div className="mt-4 space-y-1">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)
      ) : posts.length > 0 ? (
        posts.slice(0, 5).map(post => {
          const isUnread = unreadPostIds.has(post.id);
          return (
            <article
              key={post.id}
              className={cn(
                'grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1.5 py-2.5 transition-colors hover:bg-orange-50/50',
                isUnread && 'bg-orange-50/60'
              )}
              onClick={() => onOpenPost(post.id)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {post.categoryName && (
                    <Badge variant="outline" className="shrink-0 border-green-100 bg-green-50 text-green-700">
                      {post.categoryName}
                    </Badge>
                  )}
                  <h3 className="min-w-0 flex-1 line-clamp-1 text-sm font-medium text-gray-950">{post.title}</h3>
                  {isUnread && <NewBadge />}
                </div>
                <div className="mt-1 line-clamp-1 text-xs text-warm-gray-500">
                  {post.authorName} · {formatRelativeTime(post.publishTime)}
                </div>
              </div>
              <div className="hidden grid-cols-3 gap-3 text-center text-xs text-warm-gray-500 sm:grid">
                <MetricCell value={post.viewCount} label="浏览" />
                <MetricCell value={post.commentCount} label="评论" />
                <MetricCell value={post.likeCount} label="点赞" />
              </div>
            </article>
          );
        })
      ) : (
        <EmptyBlock icon={MessageSquare} text="暂无社区内容" />
      )}
    </div>
  </Card>
);

const MetricCell: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <span>
    <span className="block tabular-nums text-gray-700">{value}</span>
    <span className="mt-0.5 block">{label}</span>
  </span>
);

const ToolsAndAnnouncementsCard: React.FC<{
  todayDaily: TodayDailyDTO | null;
  codexInstances: CodexPublicInstanceDTO[];
  logs: UpdateLogDTO[];
  isLoadingDaily: boolean;
  isLoadingCodex: boolean;
  isLoadingLogs: boolean;
  onCopyKey: (key?: string) => void;
  onOpenDaily: () => void;
  onOpenAiNews: () => void;
  onOpenChangelog: () => void;
}> = ({
  todayDaily,
  codexInstances,
  logs,
  isLoadingDaily,
  isLoadingCodex,
  isLoadingLogs,
  onCopyKey,
  onOpenDaily,
  onOpenAiNews,
  onOpenChangelog,
}) => {
  const firstCodex = codexInstances[0];
  return (
    <Card className="h-full border-gray-100 p-5 shadow-sm">
      <SectionTitle icon={Key} title="工具与公告" />
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Key className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-950">AI 工具 Key</div>
              {isLoadingCodex ? <Skeleton className="mt-2 h-4 w-24" /> : (
                <p className="mt-1 truncate font-mono text-xs text-warm-gray-500">
                  {firstCodex?.apiKey ? maskKey(firstCodex.apiKey) : '暂无可用 Key'}
                </p>
              )}
            </div>
            <Button variant="primary" size="sm" onClick={() => onCopyKey(firstCodex?.apiKey)} disabled={!firstCodex?.apiKey}>
              <Copy className="h-4 w-4" />
              复制
            </Button>
          </div>
          {!isLoadingCodex && firstCodex?.usageFetchFailed && (
            <p className="mt-3 text-xs text-orange-700">用量暂不可用，但 Key 可正常复制使用。</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-100 p-4" data-plus-guide="home-ai-daily">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Newspaper className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-950">AI 日报</div>
              {isLoadingDaily ? (
                <Skeleton className="mt-2 h-4 w-28" />
              ) : todayDaily ? (
                <>
                  <p className="mt-1 text-xs text-warm-gray-500">{todayDaily.date} · {todayDaily.titles.length} 个热点</p>
                  <p className="mt-1 line-clamp-1 text-xs text-warm-gray-500">
                    {todayDaily.titles[0] || '每日精选 AI 资讯与技术动态'}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-warm-gray-500">暂无日报</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onOpenDaily}>查看日报</Button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 p-4" data-plus-guide="home-update-logs">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-950">更新日志</div>
              {isLoadingLogs ? (
                <Skeleton className="mt-2 h-4 w-28" />
              ) : logs[0] ? (
                <p className="mt-1 line-clamp-2 text-xs text-warm-gray-500">
                  v{logs[0].version} · {logs[0].title}
                </p>
              ) : (
                <p className="mt-1 text-xs text-warm-gray-500">暂无更新日志</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onOpenChangelog}>查看详情</Button>
          </div>
          {!isLoadingLogs && logs[0] && (
            <div className="mt-3 flex items-center gap-1 text-xs text-warm-gray-400">
              <CalendarDays className="h-3 w-3" />
              {formatDate(logs[0].publishTime || logs[0].createTime)}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenAiNews}
          className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
        >
          查看往期 AI 日报 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
};

const EmptyBlock: React.FC<{ icon: React.ElementType; text: string }> = ({ icon: Icon, text }) => (
  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
    <Icon className="mx-auto h-8 w-8 text-gray-300" />
    <p className="mt-2 text-sm text-warm-gray-500">{text}</p>
  </div>
);

export default HomePortalDashboard;
