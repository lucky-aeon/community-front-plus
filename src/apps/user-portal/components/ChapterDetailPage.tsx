import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CoursesService, ChaptersService } from '@shared/services/api';
import { useChapterProgressHeartbeat } from '@shared/hooks/useChapterProgressHeartbeat';
import { FrontCourseDetailDTO, FrontChapterDetailDTO, FrontChapterDTO } from '@shared/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { ReactionBar } from '@shared/components/ui/ReactionBar';
import { Comments } from '@shared/components/ui/Comments';
import { LikeButton } from '@shared/components/ui/LikeButton';

export const ChapterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();

  const [course, setCourse] = useState<FrontCourseDetailDTO | null>(null);
  const [chapterDetail, setChapterDetail] = useState<FrontChapterDetailDTO | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [isChapterLoading, setIsChapterLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // ============= 学习进度心跳上报（基于预计阅读时长的粗略估计） =============
  const readingSeconds = useMemo(() => (chapterDetail?.readingTime || 0) * 60, [chapterDetail?.readingTime]);
  const startRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  const getProgress = useCallback(() => {
    if (!readingSeconds || readingSeconds <= 0 || !chapterDetail) {
      return null;
    }
    const now = Date.now();
    if (startRef.current === null) startRef.current = now;
    let deltaSec = 0;
    if (lastTickRef.current !== null) {
      deltaSec = Math.max(0, Math.round((now - lastTickRef.current) / 1000));
    } else {
      deltaSec = Math.max(0, Math.round((now - startRef.current) / 1000));
    }
    lastTickRef.current = now;
    elapsedRef.current += deltaSec;
    const percent = Math.min(100, Math.floor((elapsedRef.current / readingSeconds) * 100));
    return {
      progressPercent: percent,
      timeSpentDeltaSec: deltaSec > 0 ? deltaSec : undefined,
    };
  }, [readingSeconds, chapterDetail?.id]);

  useChapterProgressHeartbeat({
    courseId: course?.id || '',
    chapterId: chapterDetail?.id || '',
    getProgress,
    intervalSec: 10,
    enabled: !!course && !!chapterDetail && readingSeconds > 0,
  });

  // 载入课程信息
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      try {
        setIsCourseLoading(true);
        setCourseError(null);
        const data = await CoursesService.getFrontCourseDetail(courseId);
        setCourse(data);
      } catch (err) {
        console.error('获取课程详情失败:', err);
        setCourseError('课程加载失败');
      } finally {
        setIsCourseLoading(false);
      }
    };
    fetchCourseDetail();
  }, [courseId]);

  // 载入章节信息
  useEffect(() => {
    const fetchChapterDetail = async () => {
      if (!chapterId) return;
      try {
        setIsChapterLoading(true);
        setChapterError(null);
        const data = await ChaptersService.getFrontChapterDetail(chapterId);
        setChapterDetail(data);
      } catch (err) {
        console.error('获取章节详情失败:', err);
        setChapterError('章节加载失败');
      } finally {
        setIsChapterLoading(false);
      }
    };
    fetchChapterDetail();
  }, [chapterId]);

  // 派生：章节序列与前后章节
  const sortedChapters = useMemo<FrontChapterDTO[]>(() => {
    if (!course?.chapters) return [];
    return [...course.chapters].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [course]);

  const currentIndex = useMemo(() => {
    if (!sortedChapters.length || !chapterId) return -1;
    return sortedChapters.findIndex((c) => c.id === chapterId);
  }, [sortedChapters, chapterId]);

  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : undefined;
  const nextChapter = currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : undefined;

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

  // 处理基本校验
  if (!courseId || !chapterId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="destructive">
          <AlertTitle>参数缺失</AlertTitle>
          <AlertDescription>缺少课程ID或章节ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  // 加载骨架
  if (isCourseLoading || isChapterLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gradient-to-br from-honey-50 via-white to-honey-50/60 border-b border-honey-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-2/3 mt-3" />
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
          <Card className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </Card>
        </div>
      </div>
    );
  }

  // 错误态
  if (courseError || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="destructive">
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{courseError || '课程未找到'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (chapterError || !chapterDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="destructive">
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{chapterError || '章节未找到'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 顶部：面包屑与标题 */}
      <div className="bg-gradient-to-br from-honey-50 via-white to-honey-50/60 border-b border-honey-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-2">
          <div className="text-sm text-warm-gray-500">
            <button className="hover:text-honey-600" onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
              {course.title}
            </button>
            <span className="mx-2">/</span>
            <span className="text-warm-gray-700 font-medium">{chapterDetail.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{chapterDetail.title}</h1>
          <div className="flex items-center gap-3 text-sm text-warm-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>预计 {chapterDetail.readingTime} 分钟</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-warm-gray-300" />
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>发布于 {formatDate(chapterDetail.createTime)}</span>
            </div>
            <div className="flex-1" />
            {/* 顶部操作：点赞 */}
            <LikeButton
              businessType="CHAPTER"
              businessId={chapterDetail.id}
              initialCount={chapterDetail.likeCount}
              onChange={(s) => setChapterDetail(prev => prev ? { ...prev, likeCount: s.likeCount } as FrontChapterDetailDTO : prev)}
            />
          </div>
          {/* 上/下一章按钮 */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={!prevChapter}
              onClick={() => prevChapter && navigate(`/dashboard/courses/${course.id}/chapters/${prevChapter.id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> 上一章
            </Button>
            <Button
              variant="secondary"
              disabled={!nextChapter}
              onClick={() => nextChapter && navigate(`/dashboard/courses/${course.id}/chapters/${nextChapter.id}`)}
            >
              下一章 <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* 主体 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 内容区 */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="prose-content">
              <MarkdownEditor
                value={chapterDetail.content || ''}
                onChange={() => {}}
                previewOnly
                height="auto"
                toolbar={false}
                enableFullscreen={false}
                enableToc
                className="!border-none !shadow-none !bg-transparent"
              />
            {/* 表情回复 */}
            <ReactionBar businessType={'CHAPTER'} businessId={chapterDetail.id} />
            </div>
          </Card>

          <Comments businessId={chapterDetail.id} businessType={'CHAPTER'} authorId={course.authorId} />
        </div>

        {/* 右侧：章节目录 */}
        <div>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">课程目录</h2>
              <Badge variant="secondary">共 {sortedChapters.length} 章</Badge>
            </div>
            <div className="space-y-1">
              {sortedChapters.map((ch, idx) => {
                const active = ch.id === chapterDetail.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => navigate(`/dashboard/courses/${course.id}/chapters/${ch.id}`)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      active ? 'bg-honey-50 border-honey-200' : 'hover:bg-honey-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-warm-gray-500 w-10">#{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{ch.title}</div>
                        <div className="text-xs text-warm-gray-500">预计 {ch.readingTime} 分钟</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 下方上一章/下一章 */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={!prevChapter}
                onClick={() => prevChapter && navigate(`/dashboard/courses/${course.id}/chapters/${prevChapter.id}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> 上一章
              </Button>
              <Button
                variant="outline"
                disabled={!nextChapter}
                onClick={() => nextChapter && navigate(`/dashboard/courses/${course.id}/chapters/${nextChapter.id}`)}
              >
                下一章 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
