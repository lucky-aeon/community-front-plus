import { useEffect, useRef } from 'react';
import { UserLearningService } from '@shared/services/api/user-learning.service';

export interface ChapterProgressHeartbeatOptions {
  courseId: string;
  chapterId: string;
  // 每次心跳时获取最新进度（百分比0-100，可携带可选位置/时长增量）
  getProgress: () => { progressPercent: number; positionSec?: number; timeSpentDeltaSec?: number } | null;
  intervalSec?: number;   // 心跳间隔（秒），默认 10s
  enabled?: boolean;      // 是否启用，默认 true
}

/**
 * 章节学习进度心跳上报 Hook
 * - 调用方负责提供 getProgress 回调；组件不进行错误 toast，失败由拦截器统一提示
 */
export function useChapterProgressHeartbeat(options: ChapterProgressHeartbeatOptions) {
  const { courseId, chapterId, getProgress, intervalSec = 10, enabled = true } = options;
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (!enabled || !courseId || !chapterId) return;

    const tick = async () => {
      if (runningRef.current) return; // 避免重入
      runningRef.current = true;
      try {
        // 页面不可见时可选择跳过，减少误计时
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          return;
        }
        const payload = getProgress();
        if (!payload || typeof payload.progressPercent !== 'number') return;

        // 保护：确保范围 0-100
        const progress = Math.max(0, Math.min(100, Math.floor(payload.progressPercent)));

        await UserLearningService.reportChapterProgress({
          courseId,
          chapterId,
          progressPercent: progress,
          positionSec: payload.positionSec,
          timeSpentDeltaSec: payload.timeSpentDeltaSec,
        });
      } catch (e) {
        // 失败提示由 axios 拦截器统一处理；此处仅记录日志
        // eslint-disable-next-line no-console
        console.error('上报学习进度失败', e);
      } finally {
        runningRef.current = false;
      }
    };

    // 立即尝试一次（可选）
    void tick();

    timerRef.current = window.setInterval(() => { void tick(); }, Math.max(3, intervalSec) * 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      runningRef.current = false;
    };
  }, [courseId, chapterId, intervalSec, enabled, getProgress]);
}

export default useChapterProgressHeartbeat;

