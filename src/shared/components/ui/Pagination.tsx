import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onChange: (page: number) => void;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  mode?: 'simple' | 'complex';
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onChange,
  showQuickJumper = false,
  showSizeChanger = false,
  showTotal = true,
  mode = 'complex',
  className,
}) => {
  // 如果只有一页或没有数据，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 简单模式：只显示上一页/下一页
  if (mode === 'simple') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        {showTotal && totalCount !== undefined && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            共 {totalCount} 条记录，第 {currentPage} 页，共 {totalPages} 页
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      </div>
    );
  }

  // 复杂模式：显示页码按钮
  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onChange(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        {/* 上一页按钮 */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* 第一页和省略号 */}
        {startPage > 1 && (
          <>
            <Button variant="secondary" size="sm" onClick={() => onChange(1)}>
              1
            </Button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {/* 页码按钮 */}
        {pages}

        {/* 最后一页和省略号 */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <Button variant="secondary" size="sm" onClick={() => onChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        {/* 下一页按钮 */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {showTotal && totalCount !== undefined && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          共 {totalCount} 条记录，第 {currentPage} 页，共 {totalPages} 页
        </div>
      )}
      {renderPageNumbers()}
    </div>
  );
};