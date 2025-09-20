import React, { useState, useEffect } from 'react';
import { Heart, UserPlus, Bell, BellOff } from 'lucide-react';
import { Button } from './Button';
import { SubscribeService } from '../../services/api';
import { SubscribeTargetType } from '../../types';
import { useAuth } from '../../../context/AuthContext';
import { cn } from '../../utils/cn';

interface SubscribeButtonProps {
  targetId: string;
  targetType: SubscribeTargetType;
  variant?: 'heart' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onSubscribeChange?: (isSubscribed: boolean) => void;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  targetId,
  targetType,
  variant = 'button',
  size = 'md',
  className,
  showText = true,
  onSubscribeChange,
}) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // 检查初始订阅状态
  useEffect(() => {
    if (!user || !targetId) {
      console.log('[SubscribeButton] 跳过状态检查: user =', !!user, 'targetId =', targetId);
      return;
    }

    const checkStatus = async () => {
      try {
        console.log('[SubscribeButton] 开始检查订阅状态:', { targetId, targetType });
        setIsCheckingStatus(true);

        const statusResponse = await SubscribeService.checkSubscribeStatus({
          targetId,
          targetType,
        });

        console.log('[SubscribeButton] 订阅状态检查结果:', statusResponse);
        setIsSubscribed(statusResponse.isFollowing);
      } catch (error) {
        console.error('[SubscribeButton] 检查订阅状态失败:', error);
        // 检查状态失败不显示toast，避免干扰用户
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [user, targetId, targetType]);

  // 切换订阅状态
  const handleToggleSubscribe = async () => {
    if (!user) {
      console.log('[SubscribeButton] 用户未登录，无法操作');
      return;
    }

    if (isLoading || isCheckingStatus) {
      console.log('[SubscribeButton] 正在加载中，跳过操作');
      return;
    }

    // 保存当前状态用于回滚
    const previousState = isSubscribed;

    try {
      console.log('[SubscribeButton] 开始切换订阅状态:', {
        targetId,
        targetType,
        currentState: isSubscribed,
        willChangeTo: !isSubscribed
      });

      setIsLoading(true);

      // 乐观更新：立即更新UI状态
      setIsSubscribed(!isSubscribed);

      // 调用API
      const response = await SubscribeService.toggleSubscribe({
        targetId,
        targetType,
      });

      console.log('[SubscribeButton] API完整响应:', response);

      // 检查API响应是否包含isFollowing字段
      if (response && typeof response.isFollowing === 'boolean') {
        console.log('[SubscribeButton] 使用API返回的状态:', response.isFollowing);
        setIsSubscribed(response.isFollowing);
        onSubscribeChange?.(response.isFollowing);
      } else {
        console.log('[SubscribeButton] API响应缺少isFollowing字段，使用乐观更新结果');
        // 如果API没有返回isFollowing，保持乐观更新的结果
        const newState = !previousState;
        setIsSubscribed(newState);
        onSubscribeChange?.(newState);
      }

    } catch (error) {
      console.error('[SubscribeButton] 订阅操作失败:', error);

      // 回滚乐观更新
      setIsSubscribed(previousState);

      // 不再手动显示toast，统一响应拦截器会处理

    } finally {
      setIsLoading(false);
    }
  };

  // 如果用户未登录，不显示订阅按钮
  if (!user) {
    return null;
  }

  // 根据目标类型获取文案
  const getActionText = (action: 'subscribe' | 'unsubscribe' | 'subscribed') => {
    if (targetType === 'USER') {
      switch (action) {
        case 'subscribe': return '关注';
        case 'unsubscribe': return '取消关注';
        case 'subscribed': return '已关注';
      }
    } else {
      switch (action) {
        case 'subscribe': return '订阅';
        case 'unsubscribe': return '取消订阅';
        case 'subscribed': return '已订阅';
      }
    }
  };

  // 心形图标样式（主要用于用户关注）
  if (variant === 'heart') {
    return (
      <button
        onClick={handleToggleSubscribe}
        disabled={isLoading || isCheckingStatus}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus:outline-none',
          'hover:scale-110 active:scale-95',
          size === 'sm' && 'p-1',
          size === 'md' && 'p-2',
          size === 'lg' && 'p-3',
          className
        )}
        title={isSubscribed ? getActionText('unsubscribe') : getActionText('subscribe')}
      >
        <Heart
          className={cn(
            'transition-all duration-200',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6',
            isSubscribed
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
    if (isSubscribed) return 'outline';
    return 'primary';
  };

  const getButtonText = () => {
    if (isCheckingStatus) return '检查中...';
    if (isLoading) {
      // 在加载时显示更明确的动作提示
      return isSubscribed ? `${getActionText('unsubscribe')}中...` : `${getActionText('subscribe')}中...`;
    }
    return isSubscribed ? getActionText('subscribed') : getActionText('subscribe');
  };

  const getIcon = () => {
    if (targetType === 'USER') {
      if (isSubscribed) {
        return <Heart className="w-4 h-4 fill-current" />;
      }
      return <UserPlus className="w-4 h-4" />;
    } else {
      // 课程订阅使用铃铛图标
      if (isSubscribed) {
        return <Bell className="w-4 h-4 fill-current" />;
      }
      return <BellOff className="w-4 h-4" />;
    }
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      isLoading={isLoading || isCheckingStatus}
      onClick={handleToggleSubscribe}
      className={cn(
        'gap-2',
        isSubscribed && targetType === 'USER' && 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300',
        isSubscribed && targetType === 'COURSE' && 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300',
        className
      )}
    >
      {!isLoading && !isCheckingStatus && getIcon()}
      {showText && getButtonText()}
    </Button>
  );
};

// 为了向后兼容，导出FollowButton别名
export const FollowButton = SubscribeButton;