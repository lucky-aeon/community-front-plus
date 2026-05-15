import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { UserSubscriptionService } from '@shared/services/api/user-subscription.service';
import type { OwnershipSourceDTO, UserCourseOwnershipDTO } from '@shared/types';
import { BookOpen, CalendarClock, Crown, ExternalLink, GraduationCap, Layers3, Sparkles } from 'lucide-react';

const SOURCE_LABELS: Record<string, string> = {
  DIRECT_COURSE: '单课购买',
  SUBSCRIPTION_PLAN: '套餐解锁',
};

const OWNERSHIP_STATUS_LABELS: Record<string, string> = {
  ACTIVE: '生效中',
  NOT_YET_EFFECTIVE: '未生效',
  EXPIRED: '已失效',
};

const COURSE_STATUS_LABELS: Record<string, string> = {
  PENDING: '待更新',
  IN_PROGRESS: '更新中',
  COMPLETED: '已完成',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '永久有效';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN');
};

const OwnershipSourceItem: React.FC<{ source: OwnershipSourceDTO }> = ({ source }) => {
  const isDirect = source.sourceType === 'DIRECT_COURSE';

  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        isDirect ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/70'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={isDirect ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}>
          {SOURCE_LABELS[source.sourceType] || source.sourceType}
        </Badge>
        {source.permanent && (
          <Badge variant="secondary" className="bg-slate-900 text-white hover:bg-slate-900">
            永久权益
          </Badge>
        )}
        <span className="text-sm font-medium text-slate-900">{source.sourceName}</span>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
        <div>生效时间：{formatDateTime(source.effectiveTime ?? null)}</div>
        <div>失效时间：{source.permanent ? '永久有效' : formatDateTime(source.expireTime ?? null)}</div>
      </div>
    </div>
  );
};

const OwnershipCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden border-slate-200">
    <div className="flex flex-col gap-5 p-5 md:flex-row">
      <Skeleton className="h-32 w-full rounded-2xl md:w-48" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-7 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-5 w-64" />
        <div className="grid gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </Card>
);

export const MyCourseOwnershipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [ownerships, setOwnerships] = useState<UserCourseOwnershipDTO[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchOwnerships = async () => {
      try {
        setIsLoading(true);
        const data = await UserSubscriptionService.getCourseOwnerships();
        if (!cancelled) {
          setOwnerships(data);
        }
      } catch (error) {
        console.error('获取课程权益失败:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchOwnerships();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = ownerships.length;
    const permanent = ownerships.filter(item => item.permanent).length;
    const direct = ownerships.filter(item => item.sources.some(source => source.sourceType === 'DIRECT_COURSE')).length;
    const subscription = ownerships.filter(item => item.sources.some(source => source.sourceType === 'SUBSCRIPTION_PLAN')).length;
    return { total, permanent, direct, subscription };
  }, [ownerships]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">课程权益</h1>
          <p className="mt-1 text-sm text-slate-600">
            这里展示你当前账号已经解锁的课程，以及每门课程对应的授权来源与生效时间。
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/membership')}>
            查看套餐
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard/courses')}>
            去课程页
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">当前可访问课程</div>
              <div className="mt-2 text-3xl font-semibold">{stats.total}</div>
            </div>
            <BookOpen className="h-9 w-9 text-amber-300" />
          </div>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700">永久持有课程</div>
              <div className="mt-2 text-3xl font-semibold text-emerald-950">{stats.permanent}</div>
            </div>
            <Crown className="h-9 w-9 text-emerald-600" />
          </div>
        </Card>

        <Card className="border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700">含单课购买来源</div>
              <div className="mt-2 text-3xl font-semibold text-blue-950">{stats.direct}</div>
            </div>
            <GraduationCap className="h-9 w-9 text-blue-600" />
          </div>
        </Card>

        <Card className="border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-700">含套餐解锁来源</div>
              <div className="mt-2 text-3xl font-semibold text-amber-950">{stats.subscription}</div>
            </div>
            <Layers3 className="h-9 w-9 text-amber-600" />
          </div>
        </Card>
      </div>

      <Alert className="border-slate-200 bg-white">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>说明</AlertTitle>
        <AlertDescription>
          当前页面按“课程维度”聚合展示。单门课程可能同时来自单课购买和套餐解锁两种来源，页面会把来源明细全部展开给你看。
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="space-y-4">
          <OwnershipCardSkeleton />
          <OwnershipCardSkeleton />
        </div>
      ) : ownerships.length === 0 ? (
        <Card className="border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">你还没有可用的课程权益</h2>
          <p className="mt-2 text-sm text-slate-500">
            购买单课、开通套餐，或者兑换课程/套餐 CDK 之后，这里会自动出现对应课程。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/dashboard/membership')}>
              去开通套餐
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/courses')}>
              浏览课程
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {ownerships.map((item) => (
            <Card key={item.courseId} className="overflow-hidden border-slate-200 shadow-sm">
              <div className="flex flex-col gap-5 p-5 md:flex-row">
                <div className="relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-white md:h-32 md:w-52 md:flex-shrink-0">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.courseTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-white to-blue-100">
                      <BookOpen className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-slate-900" title={item.courseTitle}>
                        {item.courseTitle}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className="bg-slate-900 text-white hover:bg-slate-900">
                          {OWNERSHIP_STATUS_LABELS[item.ownershipStatus] || item.ownershipStatus}
                        </Badge>
                        {item.permanent && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            永久持有
                          </Badge>
                        )}
                        {item.courseStatus && (
                          <Badge variant="outline" className="border-slate-300 text-slate-600">
                            课程状态：{COURSE_STATUS_LABELS[item.courseStatus] || item.courseStatus}
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                          {item.sources.length} 个来源
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => navigate('/dashboard/courses')}>
                        返回课程列表
                      </Button>
                      <Button variant="primary" onClick={() => navigate(`/dashboard/courses/${item.courseId}`)}>
                        查看课程 <ExternalLink className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-slate-400" />
                      <span>最早生效：{formatDateTime(item.effectiveTime ?? null)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-slate-400" />
                      <span>{item.permanent ? '权益到期：永久有效' : `最晚失效：${formatDateTime(item.expireTime ?? null)}`}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {item.sources.map((source) => (
                      <OwnershipSourceItem
                        key={`${item.courseId}-${source.sourceType}-${source.sourceRecordId}`}
                        source={source}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourseOwnershipsPage;
