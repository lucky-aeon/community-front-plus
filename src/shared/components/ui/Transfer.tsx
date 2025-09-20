import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Check,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  dataSource: TransferItem[];
  targetKeys: string[];
  titles?: [string, string];
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  height?: number;
  onChange: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
}

export const Transfer: React.FC<TransferProps> = ({
  dataSource = [],
  targetKeys = [],
  titles = ['可选项', '已选项'],
  showSearch = true,
  searchPlaceholder = '搜索',
  className = '',
  height = 300,
  onChange,
  onSelectChange
}) => {
  const [sourceSearchValue, setSourceSearchValue] = useState('');
  const [targetSearchValue, setTargetSearchValue] = useState('');
  const [sourceSelectedKeys, setSourceSelectedKeys] = useState<string[]>([]);
  const [targetSelectedKeys, setTargetSelectedKeys] = useState<string[]>([]);

  // 分离源数据和目标数据
  const { sourceData, targetData } = useMemo(() => {
    const targetSet = new Set(targetKeys);
    const source = dataSource.filter(item => !targetSet.has(item.key));
    const target = dataSource.filter(item => targetSet.has(item.key));
    return { sourceData: source, targetData: target };
  }, [dataSource, targetKeys]);

  // 过滤搜索结果
  const filteredSourceData = useMemo(() => {
    if (!sourceSearchValue) return sourceData;
    return sourceData.filter(item =>
      item.label.toLowerCase().includes(sourceSearchValue.toLowerCase())
    );
  }, [sourceData, sourceSearchValue]);

  const filteredTargetData = useMemo(() => {
    if (!targetSearchValue) return targetData;
    return targetData.filter(item =>
      item.label.toLowerCase().includes(targetSearchValue.toLowerCase())
    );
  }, [targetData, targetSearchValue]);

  // 处理选择变化
  const handleSelectChange = useCallback((keys: string[], type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceSelectedKeys(keys);
      onSelectChange?.(keys, targetSelectedKeys);
    } else {
      setTargetSelectedKeys(keys);
      onSelectChange?.(sourceSelectedKeys, keys);
    }
  }, [sourceSelectedKeys, targetSelectedKeys, onSelectChange]);

  // 移动到目标
  const moveToTarget = useCallback(() => {
    const newTargetKeys = [...targetKeys, ...sourceSelectedKeys];
    onChange(newTargetKeys, 'right', sourceSelectedKeys);
    setSourceSelectedKeys([]);
  }, [targetKeys, sourceSelectedKeys, onChange]);

  // 移动到源
  const moveToSource = useCallback(() => {
    const newTargetKeys = targetKeys.filter(key => !targetSelectedKeys.includes(key));
    onChange(newTargetKeys, 'left', targetSelectedKeys);
    setTargetSelectedKeys([]);
  }, [targetKeys, targetSelectedKeys, onChange]);

  // 全部移动到目标
  const moveAllToTarget = useCallback(() => {
    const allSourceKeys = filteredSourceData.filter(item => !item.disabled).map(item => item.key);
    const newTargetKeys = [...targetKeys, ...allSourceKeys];
    onChange(newTargetKeys, 'right', allSourceKeys);
    setSourceSelectedKeys([]);
  }, [targetKeys, filteredSourceData, onChange]);

  // 全部移动到源
  const moveAllToSource = useCallback(() => {
    const allTargetKeys = filteredTargetData.filter(item => !item.disabled).map(item => item.key);
    const newTargetKeys = targetKeys.filter(key => !allTargetKeys.includes(key));
    onChange(newTargetKeys, 'left', allTargetKeys);
    setTargetSelectedKeys([]);
  }, [targetKeys, filteredTargetData, onChange]);

  // 渲染列表项
  const renderListItem = (item: TransferItem, selected: boolean, onSelect: (key: string, checked: boolean) => void) => (
    <div
      key={item.key}
      className={`
        flex items-center p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
        ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !item.disabled && onSelect(item.key, !selected)}
    >
      <div className={`
        w-4 h-4 border border-gray-300 dark:border-gray-600 rounded mr-3 flex items-center justify-center
        ${selected ? 'bg-blue-600 border-blue-600' : ''}
      `}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
        {item.label}
      </span>
    </div>
  );

  // 渲染列表
  const renderList = (
    data: TransferItem[],
    title: string,
    selectedKeys: string[],
    searchValue: string,
    onSearchChange: (value: string) => void,
    onSelectChange: (keys: string[]) => void
  ) => {
    const handleItemSelect = (key: string, checked: boolean) => {
      if (checked) {
        onSelectChange([...selectedKeys, key]);
      } else {
        onSelectChange(selectedKeys.filter(k => k !== key));
      }
    };

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        const allKeys = data.filter(item => !item.disabled).map(item => item.key);
        onSelectChange(allKeys);
      } else {
        onSelectChange([]);
      }
    };

    const allSelectableItems = data.filter(item => !item.disabled);
    const isAllSelected = allSelectableItems.length > 0 &&
      allSelectableItems.every(item => selectedKeys.includes(item.key));
    const isIndeterminate = selectedKeys.length > 0 && !isAllSelected;

    return (
      <Card className="w-full">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`
                w-4 h-4 border border-gray-300 dark:border-gray-600 rounded mr-3 flex items-center justify-center cursor-pointer
                ${isAllSelected ? 'bg-blue-600 border-blue-600' : isIndeterminate ? 'bg-blue-600 border-blue-600' : ''}
              `}
                onClick={() => handleSelectAll(!isAllSelected)}
              >
                {isAllSelected && <Check className="w-3 h-3 text-white" />}
                {isIndeterminate && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{title}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedKeys.length}/{data.length}
            </span>
          </div>

          {/* 搜索框 */}
          {showSearch && (
            <div className="relative">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 列表内容 */}
        <div className="overflow-y-auto" style={{ height: height - 120 }}>
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              暂无数据
            </div>
          ) : (
            data.map(item => renderListItem(
              item,
              selectedKeys.includes(item.key),
              handleItemSelect
            ))
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 源列表 */}
      <div className="flex-1">
        {renderList(
          filteredSourceData,
          titles[0],
          sourceSelectedKeys,
          sourceSearchValue,
          setSourceSearchValue,
          (keys) => handleSelectChange(keys, 'source')
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={moveToTarget}
          disabled={sourceSelectedKeys.length === 0}
          title="移动选中项到右侧"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={moveAllToTarget}
          disabled={filteredSourceData.filter(item => !item.disabled).length === 0}
          title="移动全部到右侧"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={moveAllToSource}
          disabled={filteredTargetData.filter(item => !item.disabled).length === 0}
          title="移动全部到左侧"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={moveToSource}
          disabled={targetSelectedKeys.length === 0}
          title="移动选中项到左侧"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* 目标列表 */}
      <div className="flex-1">
        {renderList(
          filteredTargetData,
          titles[1],
          targetSelectedKeys,
          targetSearchValue,
          setTargetSearchValue,
          (keys) => handleSelectChange(keys, 'target')
        )}
      </div>
    </div>
  );
};