import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Clock, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { UserLearningService } from '@shared/services/api/user-learning.service';
import type { LearningRecordItemDTO } from '@shared/types';

interface RecentLearningBannerProps {
  className?: string;
  maxItems?: number; // 目前仅展示首条，保留扩展
}

export const RecentLearningBanner: React.FC<RecentLearningBannerProps> = ({ className, maxItems = 1 }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LearningRecordItemDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRecent = async () => {
      try {
        setIsLoading(true);
        const data = await UserLearningService.listMyLearningRecords(1, Math.max(1, Math.min(5, maxItems)));
        if (!cancelled) setItems(data.records || []);
      } catch (e) {
        // 统一由拦截器处理错误提示，这里仅记录日志
        console.error('获取最近学习数据失败:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchRecent();
    return () => { cancelled = true; };
  }, [maxItems]);

  const first = items[0];

  const formatDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString('zh-CN') : '-');

  const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full bg-yellow-500 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );

  const goContinue = () => {
    if (!first) return;
    if (first.lastAccessChapterId) {
      navigate(`/dashboard/courses/${first.courseId}/chapters/${first.lastAccessChapterId}`);
    } else {
      navigate(`/dashboard/courses/${first.courseId}`);
    }
  };

  const gotoCourse = () => {
    if (!first) return;
    navigate(`/dashboard/courses/${first.courseId}`);
  };

  const gotoAll = () => {
    navigate('/dashboard/user-backend/learning');
  };

  // 加载骨架
  if (isLoading) {
    return (
      <Card className={cn('p-5 sm:p-6', className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </Card>
    );
  }

  // 空态
  if (!first) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-600">暂无最近学习记录</p>
        <p className="text-gray-400 text-sm mt-1">开始学习一门课程，系统会自动记录你的进度</p>
        <div className="mt-4">
          <Button variant="primary" onClick={() => navigate('/dashboard/courses')}>去选课</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        {/* 左侧信息区 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">继续学习</h3>
            {first.completed && (
              <Badge variant="secondary" className="inline-flex items-center gap-1 text-green-700 bg-green-50 border-green-200">
                <Trophy className="h-3 w-3" /> 已完成
              </Badge>
            )}
          </div>

          <div className="mt-1 sm:mt-2">
            <button
              className="block w-full text-left text-gray-900 hover:text-blue-600 font-medium truncate"
              title={first.courseTitle}
              onClick={gotoCourse}
            >
              {first.courseTitle}
            </button>
            {first.lastAccessChapterId && (
              <div className="mt-1 text-sm text-gray-600">
                最近章节：
                <button
                  className="block w-full text-blue-600 hover:underline truncate"
                  onClick={goContinue}
                >
                  {first.lastAccessChapterTitle || `#${first.lastAccessChapterId}`}
                </button>
              </div>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>最近学习：{formatDateTime(first.lastAccessTime)}</span>
            </div>

            {/* 进度 */}
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar percent={first.progressPercent || 0} />
              <span className="text-sm text-gray-700 w-12 text-right">{first.progressPercent ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* 右侧操作区 */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-2 sm:items-start">
          <Button variant="primary" onClick={goContinue} className="inline-flex items-center gap-1">
            继续学习 <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={gotoAll}>查看全部</Button>
        </div>
      </div>
    </Card>
  );
};

export default RecentLearningBanner;
