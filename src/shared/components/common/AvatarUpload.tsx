import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UploadService } from '@shared/services/api/upload.service';
import { showToast } from '@shared/utils/toast';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';

interface AvatarUploadProps {
  /** 当前头像URL或资源ID */
  value?: string;
  /** 头像更新回调 */
  onChange: (avatarUrl: string) => void;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 上传成功回调（返回资源ID） */
  onUploadSuccess?: (resourceId: string) => void;
  /** 头像尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 用户名（用于alt属性和fallback） */
  userName?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示上传按钮 */
  showUploadButton?: boolean;
  /** 最大文件大小（字节） */
  maxSize?: number;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  onError,
  onUploadSuccess,
  size = 'lg',
  userName = '用户',
  disabled = false,
  className,
  showUploadButton = true,
  maxSize = 5 * 1024 * 1024, // 5MB
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 头像尺寸映射
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  // 上传按钮尺寸映射
  const buttonSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
    xl: 'h-9 w-9'
  };

  // 图标尺寸映射
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
    xl: 'h-4 w-4'
  };

  // 处理文件选择
  const handleFileSelect = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  // 处理文件上传
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      const error = '请选择图片文件';
      onError?.(error);
      showToast.error(error);
      return;
    }

    // 验证文件大小
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      const error = `图片大小不能超过 ${maxSizeMB}MB`;
      onError?.(error);
      showToast.error(error);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await UploadService.uploadImage(file, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        timeout: 0,
      });

      if (response.url) {
        // 确保资源访问会话有效，避免刚上传后预览401
        try { await ResourceAccessService.ensureSession(); } catch { /* 忽略会话检查错误 */ }
        onChange(response.url);
        onUploadSuccess?.(response.resourceId || '');
      } else {
        throw new Error('上传失败：无法获取头像URL');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '头像上传失败';
      onError?.(errorMessage);
      const toastShown = typeof error === 'object' && error !== null && (error as any).__toastShown === true;
      if (!toastShown) {
        showToast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // 清空input值，允许重复选择同一文件
      e.target.value = '';
    }
  }, [maxSize, onChange, onUploadSuccess, onError]);

  // 解析传入的 value：支持传 URL 或 资源ID
  const displaySrc = useMemo(() => {
    if (!value) return '';
    const v = value.trim();
    // 以 http(s) 或 / 开头，视为可直接使用的 URL
    if (/^https?:\/\//i.test(v) || v.startsWith('/')) {
      return v;
    }
    // 否则视为资源ID，构造访问URL
    try {
      return ResourceAccessService.getResourceAccessUrl(v);
    } catch {
      return v; // 兜底
    }
  }, [value]);

  // 生成用户名首字母作为fallback
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Avatar 容器 */}
      <div
        className={cn(
          'relative',
          !disabled && !showUploadButton && 'cursor-pointer',
          disabled && 'opacity-50'
        )}
        onClick={showUploadButton ? undefined : handleFileSelect}
      >
        <Avatar className={cn(sizeClasses[size], 'border-2 border-gray-200')}>
          <AvatarImage src={displaySrc} alt={`${userName}的头像`} />
          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* 上传进度遮罩 */}
        {isUploading && (
          <div className={cn(
            'absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center',
            sizeClasses[size]
          )}>
            <div className="text-center">
              <Loader2 className={cn('animate-spin text-white mx-auto mb-1', iconSizeClasses[size])} />
              <div className="text-xs text-white font-medium">
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}

        {/* 上传按钮 */}
        {showUploadButton && (
          <Button
            onClick={handleFileSelect}
            disabled={disabled || isUploading}
            size="sm"
            className={cn(
              'absolute -bottom-1 -right-1 rounded-full p-0 shadow-lg',
              buttonSizeClasses[size]
            )}
            title="更换头像"
          >
            {isUploading ? (
              <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />
            ) : (
              <Camera className={iconSizeClasses[size]} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
