import { useEffect, useRef, RefObject, useCallback } from 'react';
import { UserLearningService } from '@shared/services/api/user-learning.service';

export interface VideoChapterProgressOptions {
  courseId: string;
  chapterId: string;
  videoRef: RefObject<HTMLVideoElement>;
  intervalSec?: number;  // 心跳间隔（秒），默认 10s
  enabled?: boolean;     // 是否启用，默认 true
}

/**
 * 视频章节学习进度追踪 Hook
 *
 * 策略：
 * 1. 心跳：播放中每 8-10 秒上报一次
 * 2. 关键节点：play/pause/seeked/ended 事件立即上报
 * 3. 离开/切页：visibilitychange/beforeunload 时 flush 一次
 * 4. positionSec = Math.floor(video.currentTime)（必须上传）
 * 5. progressPercent = Math.round((video.currentTime / video.duration) * 100)
 * 6. timeSpentDeltaSec = 上次上报到本次上报之间"实际播放"的秒数（暂停/后台不计）
 */
export function useVideoChapterProgress(options: VideoChapterProgressOptions) {
  const {
    courseId,
    chapterId,
    videoRef,
    intervalSec = 10,
    enabled = true
  } = options;

  const lastTickTimeRef = useRef<number>(Date.now());
  const lastReportTimeRef = useRef<number>(Date.now());
  const accumulatedPlayTimeMsRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const isReportingRef = useRef(false);

  // 上报进度函数
  const reportProgress = useCallback(async (reason = '') => {
    if (!enabled || !courseId || !chapterId) return;
    if (isReportingRef.current) return; // 防止并发上报

    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    isReportingRef.current = true;

    try {
      const now = Date.now();
      const positionSec = Math.floor(video.currentTime);
      const progressPercent = Math.round((video.currentTime / video.duration) * 100);

      // 计算增量播放时长（秒）
      let deltaTimeSec = 0;
      if (accumulatedPlayTimeMsRef.current > 0) {
        deltaTimeSec = Math.floor(accumulatedPlayTimeMsRef.current / 1000);
        accumulatedPlayTimeMsRef.current = 0; // 重置累积时长
      }

      lastReportTimeRef.current = now;

      await UserLearningService.reportChapterProgress({
        courseId,
        chapterId,
        progressPercent: Math.max(0, Math.min(100, progressPercent)),
        positionSec,
        timeSpentDeltaSec: deltaTimeSec > 0 ? deltaTimeSec : undefined,
      });

      console.log(`[视频进度上报] 位置=${positionSec}s, 进度=${progressPercent}%, 增量时长=${deltaTimeSec}s ${reason ? `(${reason})` : ''}`);
    } catch (e) {
      console.error('上报视频章节进度失败', e);
    } finally {
      isReportingRef.current = false;
    }
  }, [enabled, courseId, chapterId, videoRef]);

  // 累积播放时长（仅在播放且页面可见时累积）
  const accumulatePlayTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const now = Date.now();
    const isPlaying = !video.paused && !video.ended;
    const isVisible = document.visibilityState === 'visible';

    if (isPlaying && isVisible) {
      const deltaMs = now - lastTickTimeRef.current;
      accumulatedPlayTimeMsRef.current += deltaMs;
    }

    lastTickTimeRef.current = now;
  }, [videoRef]);

  // 设置心跳定时器
  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const tick = () => {
      accumulatePlayTime();
      void reportProgress('心跳');
    };

    // 立即上报一次
    void reportProgress('初始');

    // 设置定时器
    timerRef.current = window.setInterval(tick, Math.max(5, intervalSec) * 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, intervalSec, videoRef, accumulatePlayTime, reportProgress]);

  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video) return;

    // 播放开始
    const handlePlay = () => {
      lastTickTimeRef.current = Date.now();
      void reportProgress('播放');
    };

    // 暂停
    const handlePause = () => {
      accumulatePlayTime();
      void reportProgress('暂停');
    };

    // 跳转
    const handleSeeked = () => {
      lastTickTimeRef.current = Date.now();
      void reportProgress('跳转');
    };

    // 播放结束
    const handleEnded = () => {
      accumulatePlayTime();
      void reportProgress('结束');
    };

    // timeupdate 时累积时间（不上报，只累积）
    const handleTimeUpdate = () => {
      accumulatePlayTime();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [enabled, videoRef, accumulatePlayTime, reportProgress]);

  // 监听页面可见性变化和页面离开
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        accumulatePlayTime();
        void reportProgress('页面隐藏');
      } else {
        lastTickTimeRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      accumulatePlayTime();
      void reportProgress('页面离开');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      // 组件卸载时最后上报一次
      accumulatePlayTime();
      void reportProgress('组件卸载');

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [enabled, accumulatePlayTime, reportProgress]);

  // 重置状态（当章节变化时）
  useEffect(() => {
    lastTickTimeRef.current = Date.now();
    lastReportTimeRef.current = Date.now();
    accumulatedPlayTimeMsRef.current = 0;
  }, [chapterId]);
}

export default useVideoChapterProgress;
