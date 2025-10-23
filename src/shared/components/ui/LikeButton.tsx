import React, { useEffect, useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@shared/utils/cn';
import { LikesService, type LikeStatusDTO, type LikeTargetType } from '@shared/services/api/likes.service';

interface LikeButtonProps {
  businessType: LikeTargetType;
  businessId: string;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onChange?: (state: LikeStatusDTO) => void;
  /** 跳过组件内部的初始状态拉取，交由父组件批量注入 */
  skipInitialFetch?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  businessType,
  businessId,
  initialLiked,
  initialCount,
  className,
  size = 'sm',
  disabled,
  onChange,
  skipInitialFetch = false,
}) => {
  const [liked, setLiked] = useState<boolean>(!!initialLiked);
  const [count, setCount] = useState<number>(initialCount ?? 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);

  // 仅在未提供初始 liked 时去拉取状态（避免重复请求）
  useEffect(() => {
    if (skipInitialFetch) return; // 父组件负责批量注入
    let mounted = true;
    const fetchStatus = async () => {
      try {
        setLoading(true);
        // 两者都缺：同时拉取状态+计数
        if (typeof initialLiked === 'undefined' && typeof initialCount === 'undefined') {
          const s = await LikesService.getStatusWithCount(businessType, businessId);
          if (!mounted) return;
          setLiked(!!s.liked);
          setCount(s.likeCount || 0);
          onChange?.(s);
          return;
        }
        // 单独缺某一项
        if (typeof initialLiked === 'undefined') {
          const st = await LikesService.getStatus(businessType, businessId);
          if (!mounted) return;
          setLiked(!!st.isLiked);
          onChange?.({ liked: !!st.isLiked, likeCount: typeof initialCount === 'number' ? initialCount : count });
        }
        if (typeof initialCount === 'undefined') {
          const c = await LikesService.getCount(businessType, businessId);
          if (!mounted) return;
          setCount(c || 0);
          onChange?.({ liked, likeCount: c || 0 });
        }
      } catch (e) {
        console.error('获取点赞状态失败', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessType, businessId, skipInitialFetch]);

  // 外部初始值变更时同步一次（例如父组件数据刷新）
  useEffect(() => {
    if (typeof initialLiked !== 'undefined') setLiked(!!initialLiked);
  }, [initialLiked]);
  useEffect(() => {
    if (typeof initialCount !== 'undefined') setCount(initialCount);
  }, [initialCount]);

  const handleToggle = async () => {
    if (toggling || disabled) return;
    setToggling(true);
    const prev = { liked, count };
    // 乐观更新
    const nextLiked = !liked;
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setCount(nextCount);
    onChange?.({ liked: nextLiked, likeCount: nextCount });
    try {
      const t = await LikesService.toggle({ targetType: businessType, targetId: businessId });
      const serverLiked = !!t.isLiked;
      setLiked(serverLiked);
      // 如果与乐观状态一致，则沿用当前计数；否则按服务器状态矫正一次
      const corrected = serverLiked === nextLiked ? nextCount : Math.max(0, prev.count + (serverLiked ? 1 : -1));
      setCount(corrected);
      onChange?.({ liked: serverLiked, likeCount: corrected });
    } catch (e) {
      // 回滚
      console.error('切换点赞失败', e);
      setLiked(prev.liked);
      setCount(prev.count);
      onChange?.({ liked: prev.liked, likeCount: prev.count });
    } finally {
      setToggling(false);
    }
  };

  const sizeCls = useMemo(() => {
    switch (size) {
      case 'lg': return 'h-9 px-3';
      case 'md': return 'h-8 px-2.5';
      case 'sm':
      default: return 'h-8 px-2';
    }
  }, [size]);

  const isBusy = loading || toggling;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={!!disabled || isBusy}
      aria-pressed={liked}
      aria-label={liked ? '取消点赞' : '点赞'}
      title={liked ? '取消点赞' : '点赞'}
      className={cn('flex items-center space-x-1', sizeCls, className)}
    >
      <Heart
        className={cn('h-4 w-4 transition-colors', liked ? 'text-red-500' : 'text-gray-500')}
        // 使用 fill + stroke 实现填充态
        style={liked ? { fill: 'currentColor', stroke: 'currentColor' } : {}}
      />
      <span className={cn('text-sm', liked ? 'text-red-600' : 'text-gray-600')}>
        {count}
      </span>
    </Button>
  );
};

export default LikeButton;
