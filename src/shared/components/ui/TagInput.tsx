import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  allowDuplicates?: boolean;
  separators?: string[];
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = '输入标签，按回车添加...',
  maxTags,
  maxLength = 50,
  allowDuplicates = false,
  separators = [',', '，', 'Enter'],
  className,
  disabled = false,
  size = 'md'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1 min-h-[28px]',
    md: 'text-sm px-3 py-2 min-h-[36px]',
    lg: 'text-base px-4 py-3 min-h-[44px]'
  };

  const tagSizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5'
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (!tag || disabled) return;
    
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // 检查最大标签数
    if (maxTags && value.length >= maxTags) {
      return;
    }
    
    // 检查重复
    if (!allowDuplicates && value.some(existingTag => 
      existingTag.toLowerCase() === trimmedTag.toLowerCase()
    )) {
      return;
    }
    
    // 检查长度
    if (trimmedTag.length > maxLength) {
      return;
    }
    
    const newTags = [...value, trimmedTag];
    onChange(newTags);
    setInputValue('');
  };

  // 删除标签
  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  // 处理键盘输入
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const currentValue = inputValue.trim();
    
    // 处理分隔符
    if (separators.includes(e.key) || separators.includes(e.key)) {
      e.preventDefault();
      if (currentValue) {
        addTag(currentValue);
      }
      return;
    }
    
    // 处理回车键
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentValue) {
        addTag(currentValue);
      }
      return;
    }
    
    // 处理退格键删除标签
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
      return;
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // 检查是否包含分隔符
    const containsSeparator = separators.some(sep => 
      sep !== 'Enter' && newValue.includes(sep)
    );
    
    if (containsSeparator) {
      // 分割并添加标签
      const parts = newValue.split(new RegExp(`[${separators.filter(s => s !== 'Enter').join('')}]`));
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed) {
          addTag(trimmed);
        }
      });
    } else {
      setInputValue(newValue);
    }
  };

  // 处理粘贴
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const tags = pastedText.split(new RegExp(`[${separators.filter(s => s !== 'Enter').join('')}\\n]`));
    
    tags.forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) {
        addTag(trimmed);
      }
    });
  };

  // 聚焦输入框
  const focusInput = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  const isMaxReached = maxTags && value.length >= maxTags;

  return (
    <div className={cn('relative', className)}>
      {/* 标签输入容器 */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1 border rounded-lg bg-white cursor-text transition-colors',
          sizeClasses[size],
          {
            'border-blue-500 ring-2 ring-blue-500/20': isFocused && !disabled,
            'border-gray-300 hover:border-gray-400': !isFocused && !disabled,
            'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
            'border-red-300': isMaxReached && !disabled
          }
        )}
        onClick={focusInput}
      >
        {/* 已有标签 */}
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={cn(
              'inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-md font-medium',
              tagSizeClasses[size],
              {
                'bg-gray-100 text-gray-600': disabled
              }
            )}
          >
            <span className="truncate max-w-[200px]" title={tag}>
              {tag}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="flex-shrink-0 ml-1 hover:text-blue-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {/* 输入框 */}
        {!isMaxReached && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 min-w-[120px] border-0 outline-0 bg-transparent',
              'placeholder:text-gray-400',
              {
                'cursor-not-allowed': disabled
              }
            )}
            maxLength={maxLength}
          />
        )}

        {/* 添加按钮（当达到最大数量时） */}
        {isMaxReached && (
          <span className="text-xs text-gray-500 px-2">
            已达到最大标签数量 ({maxTags})
          </span>
        )}
      </div>

      {/* 帮助文本 */}
      {!disabled && (
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>使用逗号、回车键分隔多个标签</span>
            {maxTags && (
              <span>• 最多 {maxTags} 个标签</span>
            )}
          </div>
          <span>{value.length}{maxTags ? `/${maxTags}` : ''}</span>
        </div>
      )}
    </div>
  );
};