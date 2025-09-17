import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { CategoriesService } from '@shared/services/api';
import { CategoryDTO } from '@shared/types';
import toast from 'react-hot-toast';

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory?: CategoryDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  editingCategory,
  onClose,
  onSuccess
}) => {
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'ARTICLE' as 'ARTICLE' | 'QA',
    sortOrder: 0
  });

  // 其他状态
  const [isLoading, setIsLoading] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        type: editingCategory.type,
        sortOrder: editingCategory.sortOrder
      });
    } else {
      setFormData({
        name: '',
        type: 'ARTICLE',
        sortOrder: 0
      });
    }
  }, [editingCategory, isOpen]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.name.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    if (formData.name.length < 2 || formData.name.length > 50) {
      toast.error('分类名称长度应在2-50字符之间');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        sortOrder: formData.sortOrder
      };

      if (editingCategory) {
        // 更新分类
        await CategoriesService.updateCategory(editingCategory.id, payload);
      } else {
        // 创建分类
        await CategoriesService.createCategory(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? '编辑分类' : '创建分类'}
              </h2>
              <p className="text-sm text-gray-600">
                {editingCategory ? '修改分类信息' : '创建新的文章或问答分类'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基础信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">基础信息</h3>
            
            {/* 分类名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类名称 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入分类名称（2-50字符）"
                maxLength={50}
                required
              />
            </div>

            {/* 分类类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类类型 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
                options={[
                  { value: 'ARTICLE', label: '文章分类' },
                  { value: 'QA', label: '问答分类' }
                ]}
                size="md"
              />
              <p className="text-xs text-gray-500 mt-1">
                不同类型的分类用于区分文章和问答内容
              </p>
            </div>

            {/* 排序值 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序值
              </label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder="输入数字，数值越小排序越靠前"
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">
                数值越小排序越靠前，默认为0
              </p>
            </div>
          </div>
        </form>

        {/* 底部操作 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>{editingCategory ? '更新分类' : '创建分类'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};