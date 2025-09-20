import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LoadingSpinner } from './LoadingSpinner';

// 可展开列表项接口
export interface ExpandableListItem<T = unknown> {
  key: string;
  data: T;
  content: React.ReactNode;
  expandedContent?: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

// 可展开列表属性接口
export interface ExpandableListProps<T = unknown> {
  items: ExpandableListItem<T>[];
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  emptyDescription?: string;
  className?: string;
  itemClassName?: string;
  expandedItemClassName?: string;
  dividerClassName?: string;
  showDivider?: boolean;
  defaultExpandedKeys?: string[];
  onItemClick?: (item: ExpandableListItem<T>) => void;
  onExpandChange?: (key: string, expanded: boolean) => void;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  expandButtonPosition?: 'left' | 'right';
  expandButtonClassName?: string;
  animationDuration?: number;
  pagination?: React.ReactNode;
}

export const ExpandableList = <T,>({
  items,
  loading = false,
  emptyText = '暂无数据',
  emptyIcon,
  emptyDescription,
  className,
  itemClassName,
  expandedItemClassName,
  dividerClassName,
  showDivider = true,
  defaultExpandedKeys = [],
  onItemClick,
  onExpandChange,
  expandIcon,
  collapseIcon,
  expandButtonPosition = 'right',
  expandButtonClassName,
  animationDuration = 200,
  pagination,
}: ExpandableListProps<T>) => {
  // 展开状态管理
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const defaultExpanded = new Set(defaultExpandedKeys);
    // 添加默认展开的项
    items.forEach(item => {
      if (item.defaultExpanded) {
        defaultExpanded.add(item.key);
      }
    });
    return defaultExpanded;
  });

  // 切换展开状态
  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
        onExpandChange?.(key, false);
      } else {
        newSet.add(key);
        onExpandChange?.(key, true);
      }
      return newSet;
    });
  }, [onExpandChange]);

  // 处理项目点击
  const handleItemClick = useCallback((item: ExpandableListItem<T>) => {
    onItemClick?.(item);
  }, [onItemClick]);

  // 加载状态
  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // 空状态
  if (items.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {emptyIcon && (
            <div className="mb-4">
              {emptyIcon}
            </div>
          )}
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {emptyText}
          </p>
          {emptyDescription && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {emptyDescription}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* 列表内容 */}
      <div className={cn(
        showDivider ? 'divide-y divide-gray-200 dark:divide-gray-700' : '',
        dividerClassName
      )}>
        {items.map((item, index) => {
          const isExpanded = expandedKeys.has(item.key);
          const hasExpandedContent = item.expandable !== false && item.expandedContent;

          return (
            <div
              key={item.key}
              className={cn(
                'transition-colors duration-150',
                item.className,
                itemClassName
              )}
            >
              {/* 主要内容 */}
              <div
                className={cn(
                  'p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
                  onItemClick && 'cursor-pointer',
                  hasExpandedContent && expandButtonPosition === 'right' && 'pr-12'
                )}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center justify-between">
                  {/* 左侧内容 */}
                  <div className="flex-1 min-w-0">
                    {item.content}
                  </div>

                  {/* 展开按钮 */}
                  {hasExpandedContent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(item.key);
                      }}
                      className={cn(
                        'flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ml-4',
                        expandButtonClassName
                      )}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? '收起详情' : '展开详情'}
                    >
                      <span className="mr-1">
                        {isExpanded ? '收起' : '详情'}
                      </span>
                      {isExpanded
                        ? (collapseIcon || <ChevronUp className="h-4 w-4" />)
                        : (expandIcon || <ChevronDown className="h-4 w-4" />)
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* 展开内容 */}
              {hasExpandedContent && isExpanded && (
                <div
                  className={cn(
                    'border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4 transition-all',
                    expandedItemClassName
                  )}
                  style={{
                    animationDuration: `${animationDuration}ms`,
                  }}
                >
                  {item.expandedContent}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          {pagination}
        </div>
      )}
    </div>
  );
};

// 便利方法：从数据数组创建ExpandableListItem
export const createExpandableItems = <T,>(
  data: T[],
  renderContent: (item: T, index: number) => React.ReactNode,
  renderExpanded?: (item: T, index: number) => React.ReactNode,
  keyExtractor: (item: T, index: number) => string = (_, index) => index.toString(),
  options?: {
    expandable?: (item: T, index: number) => boolean;
    defaultExpanded?: (item: T, index: number) => boolean;
    className?: (item: T, index: number) => string;
  }
): ExpandableListItem<T>[] => {
  return data.map((item, index) => ({
    key: keyExtractor(item, index),
    data: item,
    content: renderContent(item, index),
    expandedContent: renderExpanded?.(item, index),
    expandable: options?.expandable ? options.expandable(item, index) : !!renderExpanded,
    defaultExpanded: options?.defaultExpanded?.(item, index),
    className: options?.className?.(item, index),
  }));
};