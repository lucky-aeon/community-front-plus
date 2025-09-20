import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const maxRating = 5;
  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (rating: number) => {
    if (readonly || !onChange) return;
    onChange(rating);
  };

  const handleStarHover = (rating: number) => {
    if (readonly) return;
    setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverValue(null);
  };

  const getStarType = (starIndex: number): 'full' | 'half' | 'empty' => {
    const starValue = starIndex + 1;
    if (displayValue >= starValue) {
      return 'full';
    } else if (displayValue >= starValue - 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  const renderStar = (index: number) => {
    const starType = getStarType(index);
    const starValue = index + 1;

    return (
      <div
        key={index}
        className={`relative ${!readonly ? 'cursor-pointer' : ''}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
      >
        {/* 背景空心星 */}
        <Star
          className={`${sizeClasses[size]} text-gray-300 transition-colors`}
        />

        {/* 填充星 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            width: starType === 'full' ? '100%' : starType === 'half' ? '50%' : '0%'
          }}
        >
          <Star
            className={`${sizeClasses[size]} text-yellow-400 fill-current transition-colors`}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>

      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};