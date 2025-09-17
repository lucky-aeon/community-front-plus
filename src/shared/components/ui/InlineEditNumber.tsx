import React, { useState, useEffect, useRef } from 'react';
import { Edit3 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface InlineEditNumberProps {
  value: number;
  onSave: (newValue: number) => Promise<void>;
  disabled?: boolean;
  min?: number;
  max?: number;
  className?: string;
}

export const InlineEditNumber: React.FC<InlineEditNumberProps> = ({
  value,
  onSave,
  disabled = false,
  min = 1,
  max = 99,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 重置输入值当原值改变时
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  // 进入编辑模式
  const startEditing = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
    setInputValue(value.toString());
  };

  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(false);
    setInputValue(value.toString());
    setError(null);
  };

  // 验证输入值
  const validateInput = (input: string): { isValid: boolean; error?: string; value?: number } => {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return { isValid: false, error: '请输入设备数量' };
    }

    const num = parseInt(trimmed, 10);
    
    if (isNaN(num)) {
      return { isValid: false, error: '请输入有效的数字' };
    }

    if (num < min) {
      return { isValid: false, error: `设备数量不能少于${min}` };
    }

    if (num > max) {
      return { isValid: false, error: `设备数量不能超过${max}` };
    }

    return { isValid: true, value: num };
  };

  // 保存更改
  const saveChanges = async () => {
    const validation = validateInput(inputValue);
    
    if (!validation.isValid) {
      setError(validation.error || '输入无效');
      return;
    }

    const newValue = validation.value!;
    
    // 如果值没有改变，直接退出编辑模式
    if (newValue === value) {
      cancelEditing();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (error) {
      console.error('保存设备数量失败:', error);
      setError('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  // 处理失焦事件
  const handleBlur = () => {
    // 如果正在加载，不处理失焦
    if (isLoading) return;
    
    // 验证并保存，如果验证失败则取消编辑
    const validation = validateInput(inputValue);
    if (validation.isValid && validation.value !== value) {
      saveChanges();
    } else {
      cancelEditing();
    }
  };

  // 聚焦到输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className={`relative inline-block ${className}`}>
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isLoading}
          min={min}
          max={max}
          className={`w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100' : 'bg-white'}`}
        />
        
        {/* 加载状态指示器 */}
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="absolute top-full left-0 mt-1 px-2 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded shadow-sm whitespace-nowrap z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={startEditing}
      disabled={disabled}
      className={`inline-flex items-center space-x-1 px-2 py-1 text-sm rounded transition-colors group ${
        disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-900 hover:bg-gray-100 hover:text-blue-600'
      } ${className}`}
      title={disabled ? '' : '点击编辑设备数量'}
    >
      <span>{value}</span>
      {!disabled && (
        <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};