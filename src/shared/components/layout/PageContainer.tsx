import React from 'react';
import { cn } from '@shared/utils/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'white' | 'honey';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = '7xl',
  padding = 'lg',
  background = 'transparent'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-6 py-6',
    lg: 'px-4 sm:px-6 lg:px-8 py-6 lg:py-8'
  };

  const backgroundClasses = {
    transparent: '',
    white: 'bg-white',
    honey: 'bg-honey-50'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      backgroundClasses[background],
      className
    )}>
      {children}
    </div>
  );
};
