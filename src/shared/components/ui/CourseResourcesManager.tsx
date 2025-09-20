import React from 'react';
import { Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Button } from './Button';
import { Card } from './Card';
import { CourseResource } from '@shared/types';
import { SortableResourceItem } from './SortableResourceItem';

interface CourseResourcesManagerProps {
  value: CourseResource[];
  onChange: (resources: CourseResource[]) => void;
  className?: string;
}

export const CourseResourcesManager: React.FC<CourseResourcesManagerProps> = ({
  value = [],
  onChange,
  className = ''
}) => {
  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeIndex = value.findIndex((_, index) =>
      `${value[index].title}-${value[index].icon}-${index}` === active.id
    );
    const overIndex = value.findIndex((_, index) =>
      `${value[index].title}-${value[index].icon}-${index}` === over.id
    );

    if (activeIndex !== -1 && overIndex !== -1) {
      const newResources = arrayMove(value, activeIndex, overIndex);
      onChange(newResources);
    }
  };

  const addResource = () => {
    const newResource: CourseResource = {
      title: '',
      description: '',
      icon: ''
    };
    onChange([...value, newResource]);
  };

  const updateResource = (index: number, field: keyof CourseResource, newValue: string) => {
    const updatedResources = value.map((resource, i) =>
      i === index ? { ...resource, [field]: newValue } : resource
    );
    onChange(updatedResources);
  };

  const deleteResource = (index: number) => {
    const updatedResources = value.filter((_, i) => i !== index);
    onChange(updatedResources);
  };

  const validateResource = (resource: CourseResource): boolean => {
    return resource.title.trim() !== '';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">课程资源</h3>
          <p className="text-sm text-gray-600">添加与课程相关的资源链接，如源码、视频、文档等</p>
        </div>
        <Button
          type="button"
          onClick={addResource}
          size="sm"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>添加资源</span>
        </Button>
      </div>

      {value.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-gray-200">
          <div className="text-gray-500">
            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">暂无课程资源</div>
            <div className="text-xs mt-1">点击"添加资源"按钮开始添加</div>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="mb-4 text-sm text-gray-500 flex items-center space-x-2">
            <GripVertical className="h-4 w-4" />
            <span>拖拽资源卡片可调整顺序</span>
          </div>
          <SortableContext
            items={value.map((resource, index) => `${resource.title}-${resource.icon}-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {value.map((resource, index) => (
                <SortableResourceItem
                  key={`${resource.title}-${resource.icon}-${index}`}
                  resource={resource}
                  index={index}
                  onUpdate={updateResource}
                  onDelete={deleteResource}
                  validateResource={validateResource}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 统计信息 */}
      {value.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          共 {value.length} 个资源
          {value.filter(r => !validateResource(r)).length > 0 && (
            <span className="text-red-500 ml-2">
              · {value.filter(r => !validateResource(r)).length} 个资源需要完善标题
            </span>
          )}
        </div>
      )}
    </div>
  );
};