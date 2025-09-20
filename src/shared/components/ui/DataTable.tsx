import React from 'react';
import { cn } from '../../utils/cn';
import { LoadingSpinner } from './LoadingSpinner';

// 列定义接口
export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

// 数据表格属性接口
export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  emptyDescription?: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
  pagination?: React.ReactNode;
  showHeader?: boolean;
}

export const DataTable = <T,>({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  emptyText = '暂无数据',
  emptyIcon,
  emptyDescription,
  className,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  onRowClick,
  pagination,
  showHeader = true,
}: DataTableProps<T>) => {
  // 获取行的唯一key
  const getRowKey = (record: T, index: number) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index.toString();
  };

  // 获取行的样式类名
  const getRowClassName = (record: T, index: number) => {
    const baseClassName = 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
    if (typeof rowClassName === 'function') {
      return cn(baseClassName, rowClassName(record, index));
    }
    return cn(baseClassName, rowClassName);
  };

  // 渲染单元格内容
  const renderCell = (column: DataTableColumn<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(
        column.dataIndex ? (record as any)[column.dataIndex] : record,
        record,
        index
      );
    }

    if (column.dataIndex) {
      return (record as any)[column.dataIndex];
    }

    return null;
  };

  // 获取文本对齐样式
  const getAlignClassName = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-lg overflow-hidden', className)}>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className={cn('w-full', tableClassName)}>
              {showHeader && (
                <thead className={cn(
                  'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
                  headerClassName
                )}>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          'px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                          getAlignClassName(column.align),
                          column.className
                        )}
                        style={column.width ? { width: column.width } : undefined}
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className={cn(
                'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700',
                bodyClassName
              )}>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        {emptyIcon && (
                          <div className="text-gray-400 dark:text-gray-500">
                            {emptyIcon}
                          </div>
                        )}
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {emptyText}
                          </div>
                          {emptyDescription && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {emptyDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((record, index) => (
                    <tr
                      key={getRowKey(record, index)}
                      className={getRowClassName(record, index)}
                      onClick={onRowClick ? () => onRowClick(record, index) : undefined}
                      style={onRowClick ? { cursor: 'pointer' } : undefined}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-6 py-4',
                            getAlignClassName(column.align),
                            column.className
                          )}
                        >
                          {renderCell(column, record, index)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页区域 */}
          {pagination && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {pagination}
            </div>
          )}
        </>
      )}
    </div>
  );
};