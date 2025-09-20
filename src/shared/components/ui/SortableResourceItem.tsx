import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { IconSelector } from './IconSelector';
import { CourseResource } from '@shared/types';

interface SortableResourceItemProps {
  resource: CourseResource;
  index: number;
  onUpdate: (index: number, field: keyof CourseResource, value: string) => void;
  onDelete: (index: number) => void;
  validateResource: (resource: CourseResource) => boolean;
}

export const SortableResourceItem: React.FC<SortableResourceItemProps> = ({
  resource,
  index,
  onUpdate,
  onDelete,
  validateResource
}) => {
  // 使用 title + icon + index 作为唯一ID
  const itemId = `${resource.title}-${resource.icon}-${index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
        isDragging
          ? 'shadow-lg ring-2 ring-blue-300 z-50'
          : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* 拖拽手柄 */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-gray-200 transition-colors active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* 表单内容 */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 图标选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图标
              </label>
              <IconSelector
                value={resource.icon}
                onChange={(iconName) => onUpdate(index, 'icon', iconName)}
                placeholder="选择资源图标"
              />
            </div>

            {/* 资源标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                资源标题 <span className="text-red-500">*</span>
              </label>
              <Input
                value={resource.title}
                onChange={(e) => onUpdate(index, 'title', e.target.value)}
                placeholder="如：项目源码、演示视频等"
                className={!validateResource(resource) && resource.title.length > 0 ? 'border-red-300' : ''}
              />
              {!validateResource(resource) && resource.title.length > 0 && (
                <p className="text-xs text-red-500 mt-1">资源标题不能为空</p>
              )}
            </div>
          </div>

          {/* 资源描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              资源描述
            </label>
            <Textarea
              value={resource.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder="简单描述该资源的内容和用途..."
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {resource.description.length}/200 字符
            </p>
          </div>
        </div>

        {/* 删除按钮 */}
        <div className="flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(index)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};