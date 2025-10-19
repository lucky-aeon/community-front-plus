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
  categoryType?: 'ARTICLE' | 'QA' | 'INTERVIEW' | string;  // 根据类型过滤分类
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

  // 将树形分类扁平化，便于下拉选择匹配已有值
  const flattenCategories = (cats: Category[], level = 0): Array<{ id: string; name: string }> => {
    const res: Array<{ id: string; name: string }> = [];
    cats.forEach((c) => {
      const prefix = level > 0 ? `${'\u2502 '.repeat(Math.max(0, level - 1))}${'\u2514\u2500 '}` : '';
      res.push({ id: c.id, name: `${prefix}${c.name}` });
      if (c.children && c.children.length > 0) {
        res.push(...flattenCategories(c.children, level + 1));
      }
    });
    return res;
  };

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
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryType]);

  // 如果按类型过滤后未包含当前值：
  // 仅当未指定 categoryType 时尝试回退获取全部类型；
  // 指定了类型（如 INTERVIEW）时不回退，保持严格类型集合。
  useEffect(() => {
    const ensureSelectedExists = async () => {
      if (!value || loading || loadError) return;
      if (categoryType) return; // 严格类型：不做回退
      const flat = new Set(flattenCategories(categories).map(c => c.id));
      if (flat.has(value)) return;
      try {
        setLoading(true);
        const all = await PostsService.getCategories(undefined);
        setCategories(all);
      } catch (e) {
        // 忽略回退异常
      } finally {
        setLoading(false);
      }
    };
    ensureSelectedExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, categories, categoryType]);


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
            flattenCategories(categories).map((category) => (
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
