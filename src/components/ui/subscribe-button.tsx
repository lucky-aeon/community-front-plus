import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscribeService } from '@shared/services/api/subscribe.service';
import type { SubscribeStatusResponse, SubscribeTargetType } from '@shared/types';
import { useAuth } from '@/context/AuthContext';

interface SubscribeButtonProps {
  targetId: string;
  targetType: SubscribeTargetType;
  showText?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  targetId,
  targetType,
  showText = false,
  size = 'sm',
  className,
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscribeStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user) return;
      try {
        const s = await SubscribeService.checkSubscribeStatus({ targetId, targetType });
        if (mounted) setStatus(s);
      } catch {}
    };
    run();
    return () => { mounted = false; };
  }, [user, targetId, targetType]);

  const toggle = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const resp = await SubscribeService.toggleSubscribe({ targetId, targetType });
      setStatus({ isFollowing: resp.isFollowing, targetId: resp.targetId, targetType: resp.targetType });
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isFollowing = !!status?.isFollowing;

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      size={size}
      variant="outline"
      className={`rounded-full ${isFollowing ? 'border-red-200 text-red-600 bg-white hover:bg-red-50' : 'text-muted-foreground hover:text-red-500'} ${className ?? ''}`}
    >
      <Heart className={`h-4 w-4 ${showText ? 'mr-1' : ''} ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
      {showText ? (isFollowing ? '已关注' : '关注') : null}
    </Button>
  );
};

export default SubscribeButton;
