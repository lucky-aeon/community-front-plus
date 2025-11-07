import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadService, UPLOAD_CONFIG, UploadProgressCallback } from '@shared/services/api/upload.service';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';
import { showToast } from '@shared/utils/toast';

interface ImageUploadProps {
  label?: string;
  value?: string;                    // 当前图片URL或资源ID
  onChange: (url: string) => void;   // URL变化回调
  onError?: (error: string) => void; // 错误回调
  onUploadSuccess?: (resourceId: string) => void; // 上传成功回调（新增）
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  maxSize?: number;                  // 最大文件大小（字节）
  accept?: string[];                 // 接受的文件类型
  showPreview?: boolean;             // 是否显示预览
  previewSize?: 'sm' | 'md' | 'lg';  // 预览尺寸
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  onError,
  onUploadSuccess,
  required,
  error,
  placeholder = '点击上传或拖拽图片到此处',
  className,
  maxSize = UPLOAD_CONFIG.maxSize,
  accept = UPLOAD_CONFIG.supportedTypes,
  showPreview = true,
  previewSize = 'md',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 预览尺寸映射
  const previewSizes = {
    sm: 'w-24 h-16',
    md: 'w-32 h-24',
    lg: 'w-48 h-36'
  };

  // 同步外部value变化
  useEffect(() => {
    if (value) {
      // 判断value是资源ID还是完整URL
      if (value.startsWith('http') || value.startsWith('/')) {
        setPreviewUrl(value);
      } else {
        // 假设是资源ID，生成访问URL
        const accessUrl = ResourceAccessService.getResourceAccessUrl(value);
        setPreviewUrl(accessUrl);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    if (!accept.includes(file.type)) {
      return `不支持的文件类型。支持的类型：${accept.join(', ')}`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `文件大小不能超过 ${maxSizeMB}MB`;
    }

    return null;
  }, [accept, maxSize]);

  // 上传文件
  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      showToast.error(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 创建进度回调
      const onProgress: UploadProgressCallback = (progress) => {
        setUploadProgress(progress);
      };

      // 使用新的上传服务
      const response = await UploadService.uploadImage(file, { onProgress, timeout: 0 });

      if (response.url) {
        try { await ResourceAccessService.ensureSession(); } catch { /* 忽略会话检查错误 */ }
        // 更新预览URL和资源ID
        setPreviewUrl(response.url);
        const newResourceId = response.resourceId || response.uploadId || '';

        // 调用回调函数
        onChange(response.url);
        onUploadSuccess?.(newResourceId);
      } else {
        throw new Error('上传失败：无法获取文件URL');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      onError?.(errorMessage);
      // 统一规则：Axios 异常已由拦截器弹窗；组件层不重复弹错
      const toastShown = typeof error === 'object' && error !== null && (error as any).__toastShown === true;
      if (!toastShown) {
        showToast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateFile, onChange, onUploadSuccess, onError]);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    uploadFile(file);
  }, [uploadFile]);

  // 处理点击上传
  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  // 处理文件输入变化
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  }, [handleFileSelect]);

  // 处理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isUploading, handleFileSelect]);

  // 删除图片
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setPreviewUrl(null);
  }, [onChange]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* 标签 */}
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* 上传区域 */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 hover:border-red-400'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          previewUrl && showPreview ? 'p-4' : 'p-6'
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* 预览图片 */}
        {previewUrl && showPreview ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="预览"
              className={cn(
                'object-cover rounded-md border border-gray-200',
                previewSizes[previewSize]
              )}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* 上传区域内容 */
          <div className="text-center">
            <div className="mb-4">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {isUploading ? '上传中...' : placeholder}
              </p>

              {isUploading && (
                <div className="w-full max-w-xs mx-auto">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                支持 {accept.map(type => type.split('/')[1].toUpperCase()).join(', ')} 格式，
                最大 {(maxSize / (1024 * 1024)).toFixed(1)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};
