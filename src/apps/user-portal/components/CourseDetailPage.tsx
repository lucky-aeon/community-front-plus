import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Clock, ExternalLink, Tags, Star, Lock, MessageSquare } from 'lucide-react';
import { CoursesService, SubscribeService, AppUnreadService } from '@shared/services/api';
import { FrontCourseDetailDTO, FrontChapterDTO } from '@shared/types';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { ReactionBar } from '@shared/components/ui/ReactionBar';
import { Comments } from '@shared/components/ui/Comments';
import { PaymentModal } from '@shared/components/business/PaymentModal';
import { LikeButton } from '@shared/components/ui/LikeButton';

export const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<FrontCourseDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const clearedRef = React.useRef<boolean>(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);
        const courseData = await CoursesService.getFrontCourseDetail(courseId);
        setCourse(courseData);
        // 列表加载成功后清零课程章节频道未读（幂等，首次进入触发）
        try {
          if (!clearedRef.current) {
            clearedRef.current = true;
            await AppUnreadService.visit('CHAPTERS');
          }
        } catch (e) {
          console.error('清零课程章节未读失败:', e);
        }

        // 获取订阅状态
        try {
          const status = await SubscribeService.checkSubscribeStatus({ targetId: courseId, targetType: 'COURSE' });
          setIsFollowing(!!status.isFollowing);
        } catch {
          // 忽略订阅状态错误（未登录或接口异常），不影响详情显示
        }
      } catch (err) {
        console.error('获取课程详情失败:', err);
        setError('课程加载失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const statusBadge = (status?: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      IN_PROGRESS: 'bg-honey-100 text-honey-800 border-honey-200',
      COMPLETED: 'bg-sage-100 text-sage-800 border-sage-200'
    };
    const textMap: Record<string, string> = { PENDING: '待更新', IN_PROGRESS: '更新中', COMPLETED: '已完成' };
    return (
      <Badge className={`border ${map[status || ''] || 'bg-warm-gray-100 text-warm-gray-800 border-warm-gray-200'}`}>
        {textMap[status || ''] || '未知状态'}
      </Badge>
    );
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

  const firstChapter = useMemo<FrontChapterDTO | undefined>(() => {
    if (!course?.chapters?.length) return undefined;
    // 保持后端返回顺序，不在前端重新排序
    return course.chapters[0];
  }, [course]);

  const startLearning = () => {
    if (course?.unlocked === false) {
      setIsPaymentOpen(true);
      return;
    }
    if (course && firstChapter) {
      navigate(`/dashboard/courses/${course.id}/chapters/${firstChapter.id}`);
    }
  };

  const toggleSubscribe = async () => {
    if (!course) return;
    setFollowLoading(true);
    try {
      const res = await SubscribeService.toggleSubscribe({ targetId: course.id, targetType: 'COURSE' });
      setIsFollowing(!!res.isFollowing);
    } catch {
      // 错误提示由拦截器处理
    } finally {
      setFollowLoading(false);
    }
  };

  const openUrl = (url?: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  if (!courseId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="destructive">
          <AlertTitle>参数缺失</AlertTitle>
          <AlertDescription>课程 ID 缺失</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gradient-to-br from-honey-50 via-white to-honey-50/60 border-b border-honey-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Skeleton className="h-7 w-48" />
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-32" />
          </Card>
          <Card className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="destructive">
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{error || '课程未找到'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // 安全的章节数组，避免后端返回 null 导致 length 报错
  const chapters = course.chapters ?? [];

  return (
    <div className="relative">
      {/* 顶部 Hero */}
      <div className="bg-gradient-to-br from-honey-50 via-white to-honey-50/60 border-b border-honey-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {statusBadge(course.status)}
              <span className="text-warm-gray-400 text-sm">创建于 {formatDate(course.createTime)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center gap-3 text-sm text-warm-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{course.rating?.toFixed(1) ?? '0.0'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-warm-gray-300" />
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{CoursesService.formatReadingTime(course.totalReadingTime)}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-warm-gray-300" />
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{chapters.length} 章节</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {course.price !== undefined && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">¥{course.price}</span>
                  {course.originalPrice !== undefined && course.originalPrice > course.price! && (
                    <span className="text-sm text-warm-gray-500 line-through">¥{course.originalPrice}</span>
                  )}
                </div>
              )}

              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button
                  variant={isFollowing ? 'secondary' : 'outline'}
                  onClick={toggleSubscribe}
                  disabled={followLoading}
                >
                  {isFollowing ? '已订阅' : '订阅课程'}
                </Button>
                <Button
                  onClick={startLearning}
                  disabled={!firstChapter && course?.unlocked !== false}
                  className="bg-gradient-to-r from-premium-500 via-honey-600 to-amber-600 text-white"
                >
                  {course?.unlocked === false ? '解锁课程' : '开始学习'}
                </Button>
                {course.projectUrl && (
                  <Button variant="secondary" onClick={() => openUrl(course.projectUrl)}>
                    <ExternalLink className="h-4 w-4 mr-1" /> 项目地址
                  </Button>
                )}
                {course.demoUrl && (
                  <Button variant="secondary" onClick={() => openUrl(course.demoUrl!)}>
                    <ExternalLink className="h-4 w-4 mr-1" /> 在线演示
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：课程概览 */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 space-y-4">
            {/* 顶部操作：点赞 + 表情 + 分类/标签 */}
            <div className="flex items-center gap-4">
              <LikeButton
                businessType="COURSE"
                businessId={course.id}
                initialCount={course.likeCount}
                onChange={(s) => setCourse(prev => prev ? { ...prev, likeCount: s.likeCount } as FrontCourseDetailDTO : prev)}
              />
            </div>
            <ReactionBar businessType={'COURSE'} businessId={course.id} />
            {((course.techStack?.length ?? 0) > 0 || (course.tags?.length ?? 0) > 0) && (
              <div className="pt-2 space-y-3">
                {(course.techStack?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Tags className="h-4 w-4 text-honey-600" />
                    <div className="flex flex-wrap gap-2">
                      {course.techStack!.map((t) => (
                        <Badge key={`tech-${t}`} className="bg-honey-50 text-honey-700 border-honey-200">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(course.tags?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-warm-gray-500">分类标签</span>
                    <div className="flex flex-wrap gap-2">
                      {course.tags!.map((tag) => (
                        <Badge key={`tag-${tag}`} className="bg-sage-50 text-sage-700 border-sage-200">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator className="my-2" />

            <h2 className="text-lg font-bold">课程介绍</h2>
            <div className="prose-content">
              <MarkdownEditor
                value={course.description || ''}
                onChange={() => {}}
                previewOnly
                height="auto"
                toolbar={false}
                enableFullscreen={false}
                enableToc={false}
                className="!border-none !shadow-none !bg-transparent"
              />
            </div>

          </Card>

          {/* 资源区：已移动到右侧栏 */}

          <Comments businessId={course.id} businessType={'COURSE'} authorId={course.authorId} />
        </div>

        {/* 右侧：资源 + 章节列表 */}
        <div>
          {/* 未解锁时显示解锁方式 */}
          {course.unlocked === false && ((course.unlockPlans && course.unlockPlans.length > 0) || typeof course.price === 'number') && (
            <Card className="p-6 space-y-4 mb-4">
              <h2 className="text-lg font-bold">解锁方式</h2>
              {/* 订阅解锁（套餐） */}
              {(course.unlockPlans && course.unlockPlans.length > 0) && (
                <div>
                  <div className="text-sm text-warm-gray-600 mb-2">订阅以下任一套餐可解锁本课程：</div>
                  <div className="space-y-2">
                    {course.unlockPlans.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-right">
                          <div className="text-base font-semibold text-gray-900">¥{p.price}</div>
                          {typeof p.originalPrice === 'number' && p.originalPrice > p.price && (
                            <div className="text-xs text-warm-gray-500 line-through">¥{p.originalPrice}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 单次购买（按课程价格） - 价格为0表示不支持单次购买，直接隐藏 */}
              {typeof course.price === 'number' && course.price > 0 && (
                <div className="pt-2">
                  <div className="text-sm text-warm-gray-600 mb-2">或直接购买本课程：</div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
                    <div className="font-medium text-gray-900">单次购买</div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-gray-900">¥{course.price}</div>
                      {typeof course.originalPrice === 'number' && course.originalPrice > (course.price ?? 0) && (
                        <div className="text-xs text-warm-gray-500 line-through">¥{course.originalPrice}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-3">
                <Button variant="honeySoft" className="w-full" onClick={() => setIsPaymentOpen(true)}>去支付解锁</Button>
              </div>
            </Card>
          )}
          {(course.resources?.length ?? 0) > 0 && (
            <Card className="p-6 space-y-4 mb-4">
              <h2 className="text-lg font-bold">课程资源</h2>
              <div className="grid grid-cols-1 gap-4">
                {course.resources!.map((r, idx) => (
                  <div key={`${r.title}-${idx}`} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-honey-50/40 transition-colors">
                    <div className="mt-0.5">
                      {/* 简单的图标映射 */}
                      {r.icon === 'Github' && (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-800" aria-hidden>
                          <path fill="currentColor" d="M12 .5A12 12 0 0 0 0 12.7c0 5.4 3.4 10 8.2 11.6.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 2 .7 2 1 .1 2-.5 2-.5-.6-.4-1-.9-1.2-1.5-.2-.6 0-1.3.4-1.8-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.5 1.3-3.3-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.4 1.3a11.7 11.7 0 0 1 6.2 0C17 5.2 18 5.5 18 5.5c.7 1.7.2 3 .2 3 .8.8 1.3 2 1.3 3.3 0 4.7-2.8 5.6-5.4 5.9.4.3.7 1 .7 2.1v3c0 .3.2.7.8.6 4.8-1.6 8.2-6.2 8.2-11.6A12 12 0 0 0 12 .5Z"/>
                        </svg>
                      )}
                      {r.icon === 'Code' && (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-honey-700" aria-hidden>
                          <path fill="currentColor" d="M9.4 16.6 5.8 13l3.6-3.6L8 8l-5 5 5 5 1.4-1.4Zm5.2 0 3.6-3.6-3.6-3.6L16 8l5 5-5 5-1.4-1.4ZM14.9 4l-3.8 16H9.1L12.9 4h2Z"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 leading-tight">{r.title}</div>
                      <div className="text-sm text-warm-gray-600 leading-relaxed">{r.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">课程章节</h2>
              <Badge variant="secondary">共 {chapters.length} 章</Badge>
            </div>

            {chapters.length === 0 ? (
              <div className="text-sm text-warm-gray-600">暂无章节</div>
            ) : (
              <div className="space-y-2">
                {chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        if (course.unlocked === false) { setIsPaymentOpen(true); return; }
                        navigate(`/dashboard/courses/${course.id}/chapters/${ch.id}`);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${course.unlocked === false ? 'opacity-70 cursor-not-allowed' : 'hover:bg-honey-50/60'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-gray-500 w-10 text-left font-mono tabular-nums shrink-0">#{idx + 1}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{ch.title}</div>
                            <div className="text-xs text-warm-gray-500 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> 预计 {ch.readingTime} 分钟
                            </div>
                          </div>
                        </div>
                        {course.unlocked === false && (
                          <div className="flex items-center gap-1 text-xs text-warm-gray-600">
                            <Lock className="h-3.5 w-3.5" /> 未解锁
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </Card>

          {/* 移除右侧评分卡，评分仅在顶部展示 */}
        </div>
      </div>
      {/* 支付二维码弹窗（与会员页一致） */}
      <PaymentModal open={isPaymentOpen} onOpenChange={setIsPaymentOpen} />
    </div>
  );
};
