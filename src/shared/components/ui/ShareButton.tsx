import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@shared/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { ShareModal } from '@shared/components/business/ShareModal';

export type ShareTargetType = 'POST' | 'COMMENT' | 'COURSE' | 'CHAPTER' | 'INTERVIEW_QUESTION';

interface ShareButtonProps {
  /** 内容类型 */
  businessType: ShareTargetType;
  /** 内容 ID */
  businessId: string;
  /** 分享标题（预填充） */
  shareTitle?: string;
  /** 分享描述（预填充） */
  shareDescription?: string;
  /** 分享链接（用于生成二维码），默认使用当前页面 URL */
  shareUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 分享按钮组件（仅超级管理员可见）
 * 点击后弹出分享卡片生成弹窗，可生成包含标题、描述、二维码和社区 Logo 的图片
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
  businessType,
  shareTitle = '',
  shareDescription = '',
  shareUrl,
  className,
  size = 'sm',
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // 仅超级管理员可见
  if (user?.role !== 'ADMIN') return null;

  const sizeCls =
    size === 'lg' ? 'h-9 px-3' : size === 'md' ? 'h-8 px-2.5' : 'h-8 px-2';

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="生成分享卡片"
        title="生成分享卡片"
        className={cn('flex items-center space-x-1', sizeCls, className)}
      >
        <Share2 className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">分享</span>
      </Button>

      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        businessType={businessType}
        defaultTitle={shareTitle}
        defaultDescription={shareDescription}
        shareUrl={shareUrl}
      />
    </>
  );
};

export default ShareButton;
