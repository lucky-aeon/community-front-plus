import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = '请选择',
  disabled = false,
  error,
  className = '',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 获取当前选中的选项
  const selectedOption = options.find(option => option.value === value);

  // 选择选项
  const handleSelectOption = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 尺寸样式
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  return (
    <div className={`custom-select ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 选择器 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full text-left bg-white border rounded-lg shadow-sm transition-all duration-200
            flex items-center justify-between
            ${sizeClasses[size]}
            ${disabled 
              ? 'border-gray-200 cursor-not-allowed opacity-50 bg-gray-50' 
              : isOpen 
                ? 'border-blue-500 ring-2 ring-blue-100' 
                : error 
                  ? 'border-red-300 hover:border-red-400' 
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }
          `}
        >
          <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ml-2 flex-shrink-0
              ${isOpen ? 'transform rotate-180' : ''}
            `} 
          />
        </button>

        {/* 下拉选项 */}
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                暂无选项
              </div>
            ) : (
              <div className="py-1">
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectOption(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-2 text-left transition-colors duration-200
                      flex items-center justify-between
                      ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}
                      ${option.disabled 
                        ? 'cursor-not-allowed opacity-50 text-gray-400' 
                        : value === option.value 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};