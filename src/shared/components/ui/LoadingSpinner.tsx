import React from 'react';
import { cn } from '@shared/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text = '加载中...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={cn(
          'border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin',
          sizeClasses[size],
          className
        )} />
        {text && (
          <span className="text-gray-600 font-medium">{text}</span>
        )}
      </div>
    </div>
  );
};