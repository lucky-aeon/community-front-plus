import { useEffect, useRef, useCallback } from 'react';
import { UserLearningService } from '@shared/services/api/user-learning.service';
import { useScrollProgress } from './useScrollProgress';

export interface TextChapterProgressOptions {
  courseId: string;
  chapterId: string;
  readingTimeMinutes: number;  // 预计阅读时长（分钟）
  containerSelector?: string;  // 内容容器选择器
  enabled?: boolean;           // 是否启用，默认 true
}

/**
 * 图文章节学习进度追踪 Hook
 *
 * 策略：
 * 1. 滚动阈值：到达 25%/50%/75%/95% 时各上报一次
 * 2. 停留时长：离开/失焦时上报本次停留的秒数
 * 3. 综合进度：progressPercent = max(滚动百分比, 时间推进百分比)
 */
export function useTextChapterProgress(options: TextChapterProgressOptions) {
  const {
    courseId,
    chapterId,
    readingTimeMinutes,
    containerSelector = '.prose-content',
    enabled = true
  } = options;

  const startTimeRef = useRef<number>(Date.now());
  const lastReportTimeRef = useRef<number>(Date.now());
  const reportedRef = useRef<Set<number>>(new Set());

  const readingSeconds = readingTimeMinutes * 60;

  // 上报进度函数
  const reportProgress = useCallback(async (scrollPercent: number, isLeaving = false) => {
    if (!enabled || !courseId || !chapterId) return;

    const now = Date.now();
    const totalElapsedSec = Math.floor((now - startTimeRef.current) / 1000);
    const deltaTimeSec = Math.floor((now - lastReportTimeRef.current) / 1000);
    lastReportTimeRef.current = now;

    // 计算基于时间的进度百分比
    const timePercent = readingSeconds > 0
      ? Math.floor((totalElapsedSec / readingSeconds) * 100)
      : 0;

    // 综合进度：max(滚动%, 时间%)
    const progressPercent = Math.min(100, Math.max(scrollPercent, timePercent));

    try {
      await UserLearningService.reportChapterProgress({
        courseId,
        chapterId,
        progressPercent,
        timeSpentDeltaSec: deltaTimeSec > 0 ? deltaTimeSec : undefined,
      });

      console.log(`[图文进度上报] 滚动=${scrollPercent}%, 时间=${timePercent}%, 综合=${progressPercent}%, 增量时长=${deltaTimeSec}s ${isLeaving ? '(离开)' : ''}`);
    } catch (e) {
      console.error('上报图文章节进度失败', e);
    }
  }, [enabled, courseId, chapterId, readingSeconds]);

  // 滚动阈值回调
  const handleThreshold = useCallback((threshold: number) => {
    if (reportedRef.current.has(threshold)) return;
    reportedRef.current.add(threshold);
    void reportProgress(threshold);
  }, [reportProgress]);

  // 使用滚动进度追踪
  const { maxPercent } = useScrollProgress({
    containerSelector,
    thresholds: [25, 50, 75, 95],
    onThreshold: handleThreshold,
  });

  // 页面离开/失焦时上报
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      void reportProgress(maxPercent, true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void reportProgress(maxPercent, true);
      }
    };

    // 进入页面时上报一次初始进度
    void reportProgress(0);

    // 监听离开事件
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // 组件卸载时最后上报一次
      void reportProgress(maxPercent, true);

      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, maxPercent, reportProgress]);

  // 重置状态（当章节变化时）
  useEffect(() => {
    startTimeRef.current = Date.now();
    lastReportTimeRef.current = Date.now();
    reportedRef.current.clear();
  }, [chapterId]);
}

export default useTextChapterProgress;
