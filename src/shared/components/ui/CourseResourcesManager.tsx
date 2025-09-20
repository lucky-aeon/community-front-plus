import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { IconSelector } from './IconSelector';
import { Card } from './Card';

interface CourseResource {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CourseResourcesManagerProps {
  value: CourseResource[];
  onChange: (resources: CourseResource[]) => void;
  className?: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const CourseResourcesManager: React.FC<CourseResourcesManagerProps> = ({
  value = [],
  onChange,
  className = ''
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addResource = () => {
    const newResource: CourseResource = {
      id: generateId(),
      title: '',
      description: '',
      icon: ''
    };
    onChange([...value, newResource]);
    setEditingId(newResource.id);
  };

  const updateResource = (id: string, field: keyof Omit<CourseResource, 'id'>, newValue: string) => {
    const updatedResources = value.map(resource =>
      resource.id === id ? { ...resource, [field]: newValue } : resource
    );
    onChange(updatedResources);
  };

  const deleteResource = (id: string) => {
    const updatedResources = value.filter(resource => resource.id !== id);
    onChange(updatedResources);
  };

  const moveResource = (fromIndex: number, toIndex: number) => {
    const updatedResources = [...value];
    const [movedResource] = updatedResources.splice(fromIndex, 1);
    updatedResources.splice(toIndex, 0, movedResource);
    onChange(updatedResources);
  };

  const validateResource = (resource: CourseResource): boolean => {
    return resource.title.trim() !== '';
  };

  const getIconComponent = (iconName: string) => {
    // 这里需要根据 IconSelector 中的图标映射来获取对应的组件
    // 为了简化，先返回一个默认的展示
    return iconName || 'FileText';
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
        <div className="space-y-4">
          {value.map((resource, index) => (
            <Card key={resource.id} className="p-4">
              <div className="flex items-start space-x-4">
                {/* 拖拽手柄 */}
                <div className="flex-shrink-0 pt-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
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
                        onChange={(iconName) => updateResource(resource.id, 'icon', iconName)}
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
                        onChange={(e) => updateResource(resource.id, 'title', e.target.value)}
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
                      onChange={(e) => updateResource(resource.id, 'description', e.target.value)}
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
                    onClick={() => deleteResource(resource.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 预览卡片 */}
              {resource.title && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">预览效果：</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-medium">
                            {resource.icon ? '📦' : '📄'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {resource.title}
                        </h4>
                        {resource.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
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