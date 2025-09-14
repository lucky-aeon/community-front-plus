import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { UploadService, UPLOAD_CONFIG } from '../../services/api/upload.service';
import { showToast } from './Toast';

interface ImageUploadProps {
  label?: string;
  value?: string;                    // 当前图片URL
  onChange: (url: string) => void;   // URL变化回调
  onError?: (error: string) => void; // 错误回调
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

  // 更新预览URL
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    if (disabled) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 创建本地预览
      const localPreviewUrl = UploadService.createPreviewURL(file);
      setPreviewUrl(localPreviewUrl);

      // 上传文件
      const result = await UploadService.uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      // 清理本地预览URL
      UploadService.revokePreviewURL(localPreviewUrl);
      
      // 设置服务器返回的URL
      setPreviewUrl(result.url);
      onChange(result.url);
      showToast.success('图片上传成功');

    } catch (err: any) {
      console.error('图片上传失败:', err);
      const errorMessage = err.message || '上传失败，请稍后重试';
      
      setPreviewUrl(value || null); // 恢复原有预览
      onError?.(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [disabled, value, onChange, onError]);

  // 文件选择处理
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  // 点击上传
  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  // 删除图片
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    setPreviewUrl(null);
    onChange('');
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled, onChange]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  // 计算上传区域的样式
  const uploadAreaClasses = cn(
    'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer',
    'flex flex-col items-center justify-center text-center p-6',
    isDragging && !disabled
      ? 'border-blue-500 bg-blue-50'
      : error
        ? 'border-red-300 bg-red-50'
        : 'border-gray-300 hover:border-gray-400 bg-gray-50',
    disabled && 'cursor-not-allowed opacity-50',
    className
  );

  return (
    <div className="space-y-3">
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 上传区域 */}
      <div
        className={uploadAreaClasses}
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
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        {/* 上传中状态 */}
        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <div className="text-sm text-gray-600">上传中...</div>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{uploadProgress}%</div>
          </div>
        ) : (
          /* 正常状态 */
          <div className="space-y-3">
            <Upload className={cn(
              'h-10 w-10 mx-auto',
              isDragging ? 'text-blue-500' : 'text-gray-400'
            )} />
            <div className="space-y-1">
              <div className={cn(
                'text-sm font-medium',
                isDragging ? 'text-blue-600' : 'text-gray-700'
              )}>
                {placeholder}
              </div>
              <div className="text-xs text-gray-500">
                支持 {UPLOAD_CONFIG.supportedExtensions.join(', ')} 格式，最大 {UPLOAD_CONFIG.maxSizeText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 图片预览 */}
      {showPreview && previewUrl && !isUploading && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="预览图片"
            className={cn(
              'object-cover rounded-lg border border-gray-200',
              previewSizes[previewSize]
            )}
            onError={() => {
              setPreviewUrl(null);
              onError?.('图片加载失败');
            }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className={cn(
                'absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full',
                'hover:bg-red-600 transition-colors duration-200',
                'shadow-sm border border-white'
              )}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 帮助信息 */}
      {!error && !isUploading && (
        <div className="text-xs text-gray-500">
          {isDragging ? '松开鼠标完成上传' : '支持拖拽上传，或点击选择文件'}
        </div>
      )}
    </div>
  );
};