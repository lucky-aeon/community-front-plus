import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false,
  ...props
}) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-2xl shadow-lg border border-gray-100',
        hover && 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};