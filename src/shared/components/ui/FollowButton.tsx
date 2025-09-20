import React, { useState, useEffect } from 'react';
import { Heart, UserPlus } from 'lucide-react';
import { Button } from './Button';
import { FollowService } from '../../services/api';
import { FollowTargetType } from '../../types';
import { useAuth } from '../../../context/AuthContext';
import { cn } from '../../utils/cn';

interface FollowButtonProps {
  targetId: string;
  targetType: FollowTargetType;
  variant?: 'heart' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetId,
  targetType,
  variant = 'button',
  size = 'md',
  className,
  showText = true,
  onFollowChange,
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // 检查初始关注状态
  useEffect(() => {
    if (!user || !targetId) {
      console.log('[FollowButton] 跳过状态检查: user =', !!user, 'targetId =', targetId);
      return;
    }

    const checkStatus = async () => {
      try {
        console.log('[FollowButton] 开始检查关注状态:', { targetId, targetType });
        setIsCheckingStatus(true);

        const statusResponse = await FollowService.checkFollowStatus({
          targetId,
          targetType,
        });

        console.log('[FollowButton] 关注状态检查结果:', statusResponse);
        setIsFollowing(statusResponse.isFollowing);
      } catch (error) {
        console.error('[FollowButton] 检查关注状态失败:', error);
        // 检查状态失败不显示toast，避免干扰用户
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [user, targetId, targetType]);

  // 切换关注状态
  const handleToggleFollow = async () => {
    if (!user) {
      console.log('[FollowButton] 用户未登录，无法操作');
      return;
    }

    if (isLoading || isCheckingStatus) {
      console.log('[FollowButton] 正在加载中，跳过操作');
      return;
    }

    // 保存当前状态用于回滚
    const previousState = isFollowing;

    try {
      console.log('[FollowButton] 开始切换关注状态:', {
        targetId,
        targetType,
        currentState: isFollowing,
        willChangeTo: !isFollowing
      });

      setIsLoading(true);

      // 乐观更新：立即更新UI状态
      setIsFollowing(!isFollowing);

      // 调用API
      const response = await FollowService.toggleFollow({
        targetId,
        targetType,
      });

      console.log('[FollowButton] API完整响应:', response);

      // 检查API响应是否包含isFollowing字段
      if (response && typeof response.isFollowing === 'boolean') {
        console.log('[FollowButton] 使用API返回的状态:', response.isFollowing);
        setIsFollowing(response.isFollowing);
        onFollowChange?.(response.isFollowing);
      } else {
        console.log('[FollowButton] API响应缺少isFollowing字段，使用乐观更新结果');
        // 如果API没有返回isFollowing，保持乐观更新的结果
        const newState = !previousState;
        setIsFollowing(newState);
        onFollowChange?.(newState);
      }

    } catch (error) {
      console.error('[FollowButton] 关注操作失败:', error);

      // 回滚乐观更新
      setIsFollowing(previousState);

      // 不再手动显示toast，统一响应拦截器会处理

    } finally {
      setIsLoading(false);
    }
  };

  // 如果用户未登录，不显示关注按钮
  if (!user) {
    return null;
  }

  // 心形图标样式
  if (variant === 'heart') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isLoading || isCheckingStatus}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus:outline-none',
          'hover:scale-110 active:scale-95',
          size === 'sm' && 'p-1',
          size === 'md' && 'p-2',
          size === 'lg' && 'p-3',
          className
        )}
        title={isFollowing ? '取消关注' : '关注'}
      >
        <Heart
          className={cn(
            'transition-all duration-200',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6',
            isFollowing
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400 hover:text-red-500',
            (isLoading || isCheckingStatus) && 'opacity-50'
          )}
        />
      </button>
    );
  }

  // 按钮样式
  const getButtonVariant = () => {
    if (isFollowing) return 'outline';
    return 'primary';
  };

  const getButtonText = () => {
    if (isCheckingStatus) return '检查中...';
    if (isLoading) {
      // 在加载时显示更明确的动作提示
      return isFollowing ? '取消中...' : '关注中...';
    }
    return isFollowing ? '已关注' : '关注';
  };

  const getIcon = () => {
    if (isFollowing) {
      return <Heart className="w-4 h-4 fill-current" />;
    }
    return <UserPlus className="w-4 h-4" />;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      isLoading={isLoading || isCheckingStatus}
      onClick={handleToggleFollow}
      className={cn(
        'gap-2',
        isFollowing && 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300',
        className
      )}
    >
      {!isLoading && !isCheckingStatus && getIcon()}
      {showText && getButtonText()}
    </Button>
  );
};