import React from 'react';
import { Edit, Trash2, Eye, Copy, Plus, Settings, BookOpen, List, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

// 预定义的操作类型
export type ActionType =
  | 'edit'
  | 'delete'
  | 'view'
  | 'copy'
  | 'add'
  | 'settings'
  | 'chapters'
  | 'courses'
  | 'custom';

// 操作项配置接口
export interface TableAction {
  key: string;
  type: ActionType;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  hidden?: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}

export interface TableActionsProps {
  actions: TableAction[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxVisible?: number; // 最多显示几个按钮，超出的放入下拉菜单
}

// 获取预定义操作的默认配置
const getDefaultActionConfig = (type: ActionType): Partial<TableAction> => {
  switch (type) {
    case 'edit':
      return {
        icon: <Edit className="w-4 h-4" />,
        variant: 'ghost',
        title: '编辑',
        className: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      };
    case 'delete':
      return {
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'ghost',
        title: '删除',
        className: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
      };
    case 'view':
      return {
        icon: <Eye className="w-4 h-4" />,
        variant: 'ghost',
        title: '查看',
        className: 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
      };
    case 'copy':
      return {
        icon: <Copy className="w-4 h-4" />,
        variant: 'ghost',
        title: '复制',
      };
    case 'add':
      return {
        icon: <Plus className="w-4 h-4" />,
        variant: 'primary',
        title: '添加',
      };
    case 'settings':
      return {
        icon: <Settings className="w-4 h-4" />,
        variant: 'ghost',
        title: '设置',
        className: 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
      };
    case 'chapters':
      return {
        icon: <List className="w-4 h-4" />,
        variant: 'ghost',
        title: '管理章节',
        className: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
      };
    case 'courses':
      return {
        icon: <BookOpen className="w-4 h-4" />,
        variant: 'ghost',
        title: '课程绑定',
        className: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
      };
    default:
      return {
        variant: 'ghost',
      };
  }
};

export const TableActions: React.FC<TableActionsProps> = ({
  actions,
  size = 'sm',
  className,
  maxVisible = 3,
}) => {
  // 过滤掉隐藏的操作
  const visibleActions = actions.filter(action => !action.hidden);

  if (visibleActions.length === 0) {
    return null;
  }

  // 如果操作数量较少或者不限制显示数量，直接显示所有按钮
  if (visibleActions.length <= maxVisible) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {visibleActions.map((action) => {
          const defaultConfig = getDefaultActionConfig(action.type);

          return (
            <Button
              key={action.key}
              variant={action.variant || defaultConfig.variant || 'ghost'}
              size={action.size || size}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.title || defaultConfig.title || action.label}
              className={cn(defaultConfig.className, action.className)}
            >
              {action.icon || defaultConfig.icon}
              {action.label && (
                <span className="ml-1">{action.label}</span>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // 如果操作数量较多，显示前几个按钮，其余的放入下拉菜单
  const displayActions = visibleActions.slice(0, maxVisible - 1);
  const dropdownActions = visibleActions.slice(maxVisible - 1);

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* 显示的按钮 */}
      {displayActions.map((action) => {
        const defaultConfig = getDefaultActionConfig(action.type);

        return (
          <Button
            key={action.key}
            variant={action.variant || defaultConfig.variant || 'ghost'}
            size={action.size || size}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.title || defaultConfig.title || action.label}
            className={cn(defaultConfig.className, action.className)}
          >
            {action.icon || defaultConfig.icon}
            {action.label && (
              <span className="ml-1">{action.label}</span>
            )}
          </Button>
        );
      })}

      {/* 更多操作按钮 */}
      {dropdownActions.length > 0 && (
        <div className="relative group">
          <Button
            variant="ghost"
            size={size}
            title="更多操作"
            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {/* 简单的下拉菜单 - 这里可以后续优化为更复杂的 Dropdown 组件 */}
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
            {dropdownActions.map((action) => {
              const defaultConfig = getDefaultActionConfig(action.type);

              return (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md flex items-center space-x-2',
                    action.disabled && 'opacity-50 cursor-not-allowed',
                    defaultConfig.className?.includes('text-red') && 'text-red-600 dark:text-red-400',
                    defaultConfig.className?.includes('text-blue') && 'text-blue-600 dark:text-blue-400',
                    defaultConfig.className?.includes('text-green') && 'text-green-600 dark:text-green-400',
                  )}
                  title={action.title || defaultConfig.title || action.label}
                >
                  {action.icon || defaultConfig.icon}
                  <span>{action.label || action.title || defaultConfig.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};