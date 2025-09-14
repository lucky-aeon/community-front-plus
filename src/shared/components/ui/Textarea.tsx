import React, { useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  required,
  showCharCount = false,
  maxLength,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  className,
  value = '',
  onChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stringValue = String(value);

  // 自动调整高度
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;
    
    const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
    textarea.style.height = `${newHeight}px`;
  };

  // 监听内容变化，自动调整高度
  useEffect(() => {
    adjustHeight();
  }, [stringValue, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    // 延迟执行高度调整，确保值已更新
    setTimeout(adjustHeight, 0);
  };

  const isOverLimit = maxLength ? stringValue.length > maxLength : false;
  const isNearLimit = maxLength ? stringValue.length > maxLength * 0.9 : false;

  return (
    <div className="space-y-2">
      {/* 标签和字符计数 */}
      {(label || showCharCount) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className={cn(
              'text-xs',
              isOverLimit ? 'text-red-500' : 
              isNearLimit ? 'text-amber-500' : 
              'text-gray-400'
            )}>
              {stringValue.length}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* 文本域 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        rows={autoResize ? minRows : undefined}
        className={cn(
          'w-full px-4 py-3 border border-gray-300 rounded-xl resize-vertical',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
          'placeholder-gray-400',
          autoResize && 'resize-none overflow-hidden',
          error && 'border-red-500 focus:ring-red-500',
          isOverLimit && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />

      {/* 错误信息 */}
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>{error}</span>
        </p>
      )}

      {/* 超出限制提示 */}
      {isOverLimit && !error && (
        <p className="text-sm text-red-600">
          字符数超出限制，请删除 {stringValue.length - maxLength!} 个字符
        </p>
      )}
    </div>
  );
};