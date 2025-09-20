import React from 'react';
import { cn } from '@shared/utils/cn';

interface CheckboxProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  error,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variantClasses = {
    default: 'text-blue-600 focus:ring-blue-500',
    primary: 'text-blue-600 focus:ring-blue-500',
    success: 'text-green-600 focus:ring-green-500',
    warning: 'text-orange-600 focus:ring-orange-500',
    danger: 'text-red-600 focus:ring-red-500'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            sizeClasses[size],
            variantClasses[variant],
            'bg-gray-100 border-gray-300 rounded focus:ring-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600',
            {
              'opacity-50 cursor-not-allowed': disabled,
              'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20': error
            }
          )}
        />
        {label && (
          <span
            className={cn(
              labelSizeClasses[size],
              'font-medium text-gray-900 dark:text-white select-none',
              {
                'opacity-50': disabled,
                'text-red-600 dark:text-red-400': error
              }
            )}
          >
            {label}
          </span>
        )}
      </label>
      {error && (
        <span className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};