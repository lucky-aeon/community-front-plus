import React from 'react';
import { cn } from '@shared/utils/cn';

interface VersionBadgeProps {
  version: string;
  isImportant?: boolean;
  className?: string;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  version,
  isImportant = false,
  className
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
        isImportant 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-800 border border-gray-200',
        className
      )}
    >
      v{version}
    </span>
  );
};
