import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Folder, AlertCircle } from 'lucide-react';
import { Category } from '@shared/types';
import { PostsService } from '@shared/services/api/posts.service';

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  categoryType?: 'ARTICLE' | 'QA';  // 根据文章类型过滤分类
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  label = '文章分类',
  placeholder = '请选择文章分类',
  required = false,
  error,
  className = '',
  categoryType
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const categoriesData = await PostsService.getCategories(categoryType);
        setCategories(categoriesData);
      } catch (error) {
        console.error('获取分类列表失败:', error);
        setLoadError('获取分类列表失败');
        // 设置默认分类数据以防API失败
        const defaultType = categoryType || 'ARTICLE';
        setCategories([
          {
            id: 'default-1',
            name: '技术分享',
            type: defaultType,
            level: 1,
            parentId: null,
            sort: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'default-2',
            name: '学习心得',
            type: defaultType,
            level: 1,
            parentId: null,
            sort: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'default-3',
            name: '项目经验',
            type: defaultType,
            level: 1,
            parentId: null,
            sort: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryType]);


  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="category-select" className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={loading ? '加载中...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="__loading__" disabled>
              加载中...
            </SelectItem>
          ) : loadError ? (
            <SelectItem value="__error__" disabled>
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {loadError}
              </div>
            </SelectItem>
          ) : categories.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              暂无分类
            </SelectItem>
          ) : (
            categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gray-500" />
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};
