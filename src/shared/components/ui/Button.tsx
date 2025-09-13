import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../../context/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  useCustomTheme?: boolean; // 新增：控制是否使用自定义主题
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  isLoading = false,
  disabled,
  useCustomTheme = false,
  ...props
}) => {
  // 始终调用 useTheme hook，但允许在非Provider环境中使用
  const theme = useTheme();
  
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // 默认样式（原有的样式 + 新增语义化变体）
  const defaultVariants = {
    primary: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    neutral: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500'
  };

  // 从主题Context获取样式
  const getThemeVariants = () => {
    if (!theme?.currentVariant || !useCustomTheme) {
      return defaultVariants;
    }

    const currentVariant = theme.currentVariant;
    // 语义化变体始终使用默认样式，不受主题影响
    return {
      primary: currentVariant.primary || defaultVariants.primary,
      secondary: currentVariant.secondary || defaultVariants.secondary,
      outline: currentVariant.outline || defaultVariants.outline,
      ghost: currentVariant.ghost || defaultVariants.ghost,
      neutral: defaultVariants.neutral, // 语义化：始终使用中性灰色
      danger: defaultVariants.danger,   // 语义化：始终使用红色
      success: defaultVariants.success  // 语义化：始终使用绿色
    };
  };

  const variants = getThemeVariants();
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};