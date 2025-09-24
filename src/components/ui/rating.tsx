import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@shared/utils/cn';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({ value = 0, onChange, max = 5, readOnly = false, className }) => {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const active = display >= idx;
        return (
          <Button
            key={idx}
            type="button"
            size="icon"
            variant="ghost"
            className={cn('h-8 w-8', active ? 'text-yellow-500' : 'text-muted-foreground')}
            onMouseEnter={() => !readOnly && setHover(idx)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(idx)}
            aria-label={`评分 ${idx}`}
          >
            <Star className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
};

export default Rating;
