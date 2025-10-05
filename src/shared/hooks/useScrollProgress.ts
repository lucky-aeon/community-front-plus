import { useEffect, useRef, useState, useCallback } from 'react';

export interface ScrollProgressOptions {
  containerSelector?: string;  // 容器选择器，默认使用 window
  thresholds?: number[];       // 触发回调的阈值百分比，默认 [25, 50, 75, 95]
  onThreshold?: (percent: number) => void; // 达到阈值时的回调
}

export interface ScrollProgressResult {
  currentPercent: number;  // 当前滚动百分比
  maxPercent: number;      // 历史最大滚动百分比（只增不减）
}

/**
 * 滚动进度追踪 Hook
 * 监听容器滚动，计算滚动百分比，并在达到特定阈值时触发回调
 */
export function useScrollProgress(options: ScrollProgressOptions = {}): ScrollProgressResult {
  const {
    containerSelector,
    thresholds = [25, 50, 75, 95],
    onThreshold
  } = options;

  const [currentPercent, setCurrentPercent] = useState(0);
  const [maxPercent, setMaxPercent] = useState(0);
  const triggeredThresholdsRef = useRef<Set<number>>(new Set());

  const calculateScrollPercent = useCallback(() => {
    let scrollTop: number;
    let scrollHeight: number;
    let clientHeight: number;

    if (containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return 0;
      scrollTop = container.scrollTop;
      scrollHeight = container.scrollHeight;
      clientHeight = container.clientHeight;
    } else {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    }

    // 如果内容不足一屏，直接返回 100
    if (scrollHeight <= clientHeight) {
      return 100;
    }

    // 计算滚动百分比
    const percent = Math.floor((scrollTop / (scrollHeight - clientHeight)) * 100);
    return Math.max(0, Math.min(100, percent));
  }, [containerSelector]);

  const handleScroll = useCallback(() => {
    const percent = calculateScrollPercent();
    setCurrentPercent(percent);

    // 更新最大百分比（只增不减）
    setMaxPercent(prev => {
      const newMax = Math.max(prev, percent);

      // 检查是否达到新的阈值
      if (onThreshold) {
        thresholds.forEach(threshold => {
          if (newMax >= threshold && !triggeredThresholdsRef.current.has(threshold)) {
            triggeredThresholdsRef.current.add(threshold);
            onThreshold(threshold);
          }
        });
      }

      return newMax;
    });
  }, [calculateScrollPercent, onThreshold, thresholds]);

  useEffect(() => {
    // 初始计算一次
    handleScroll();

    const target = containerSelector
      ? document.querySelector(containerSelector)
      : window;

    if (!target) return;

    // 使用 passive listener 提升性能
    const options: AddEventListenerOptions = { passive: true };
    target.addEventListener('scroll', handleScroll, options);

    // 监听窗口大小变化，重新计算百分比
    window.addEventListener('resize', handleScroll, options);

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerSelector, handleScroll]);

  // 重置已触发的阈值（当容器变化时）
  useEffect(() => {
    triggeredThresholdsRef.current.clear();
    setCurrentPercent(0);
    setMaxPercent(0);
  }, [containerSelector]);

  return {
    currentPercent,
    maxPercent,
  };
}

export default useScrollProgress;
