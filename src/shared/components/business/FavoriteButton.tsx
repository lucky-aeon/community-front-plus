import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FavoritesService } from '@shared/services/api';
import { FavoriteTargetType } from '@shared/types';
import { useAuth } from '@/context/AuthContext';

interface FavoriteButtonProps {
  targetId: string;
  targetType: FavoriteTargetType;
  initialIsFavorited?: boolean;
  initialCount?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
  /** 跳过初始查询（当外部已提供准确的初始状态时） */
  skipInitialFetch?: boolean;
}

/**
 * 收藏按钮组件
 * 支持文章、章节、评论、题目等多种类型的收藏功能
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  targetId,
  targetType,
  initialIsFavorited = false,
  initialCount = 0,
  variant = 'outline',
  size = 'default',
  showCount = true,
  className = '',
  onToggle,
  skipInitialFetch = false,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favoritesCount, setFavoritesCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // 获取收藏状态
  useEffect(() => {
    // 如果跳过初始查询，直接使用传入的初始状态
    if (skipInitialFetch) {
      setIsFavorited(initialIsFavorited);
      setFavoritesCount(initialCount);
      return;
    }

    const fetchStatus = async () => {
      if (!user || !targetId) return;

      try {
        const status = await FavoritesService.getFavoriteStatus(targetId, targetType);
        setIsFavorited(status.isFavorited);
        setFavoritesCount(status.favoritesCount);
      } catch (error) {
        console.error('获取收藏状态失败:', error);
      }
    };

    fetchStatus();
  }, [targetId, targetType, user, skipInitialFetch, initialIsFavorited, initialCount]);

  // 切换收藏状态
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止事件冒泡
    e.preventDefault();

    if (!user) {
      // TODO: 显示登录提示或跳转到登录页
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      // 乐观更新 UI
      const newIsFavorited = !isFavorited;
      const newCount = newIsFavorited ? favoritesCount + 1 : Math.max(0, favoritesCount - 1);

      setIsFavorited(newIsFavorited);
      setFavoritesCount(newCount);

      // 调用 API
      const result = await FavoritesService.toggleFavorite(targetId, targetType);

      // 使用服务器返回的实际状态（防止并发问题）
      setIsFavorited(result.isFavorited);

      // 触发回调
      onToggle?.(result.isFavorited);

    } catch (error) {
      console.error('切换收藏状态失败:', error);
      // 恢复原状态
      setIsFavorited(!isFavorited);
      setFavoritesCount(isFavorited ? favoritesCount + 1 : Math.max(0, favoritesCount - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || !user}
      className={`flex items-center space-x-1 ${className}`}
      title={isFavorited ? '取消收藏' : '收藏'}
    >
      <Star
        className={`h-4 w-4 transition-colors ${
          isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
        }`}
      />
      {showCount && <span>{favoritesCount}</span>}
      {!showCount && <span>{isFavorited ? '已收藏' : '收藏'}</span>}
    </Button>
  );
};
