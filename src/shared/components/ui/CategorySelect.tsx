import React, { useState, useEffect } from 'react';
import { ChevronDown, Folder, AlertCircle } from 'lucide-react';
import { Category } from '../../types';
import { PostsService } from '../../services/api/posts.service';

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
  const [isOpen, setIsOpen] = useState(false);
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
            sortOrder: 1,
            isActive: true,
            createTime: '', 
            updateTime: '',
            children: [
              { id: 'default-1-1', name: '前端开发', type: defaultType, level: 2, sortOrder: 1, isActive: true, createTime: '', updateTime: '', parentId: 'default-1' },
              { id: 'default-1-2', name: '后端开发', type: defaultType, level: 2, sortOrder: 2, isActive: true, createTime: '', updateTime: '', parentId: 'default-1' },
            ]
          },
          { 
            id: 'default-2', 
            name: '学习心得', 
            type: defaultType,
            level: 1,
            sortOrder: 2,
            isActive: true,
            createTime: '', 
            updateTime: '' 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryType]); // 依赖 categoryType，类型变化时重新加载

  // 扁平化树形分类结构，用于展示
  const flattenCategories = (categories: Category[], level = 0): (Category & { displayName: string })[] => {
    const result: (Category & { displayName: string })[] = [];
    
    categories.forEach(category => {
      // 创建带缩进的显示名称
      const indent = '　'.repeat(level); // 使用全角空格缩进
      const displayName = `${indent}${category.name}`;
      
      result.push({
        ...category,
        displayName
      });

      // 递归处理子分类
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1));
      }
    });

    return result;
  };

  const flatCategories = flattenCategories(categories);

  // 根据ID查找分类名称（包含完整路径）
  const getSelectedCategoryName = () => {
    if (!value) return placeholder;
    
    // 递归查找分类并构建路径
    const findCategoryPath = (categories: Category[], targetId: string, path: string[] = []): string[] | null => {
      for (const category of categories) {
        const currentPath = [...path, category.name];
        
        if (category.id === targetId) {
          return currentPath;
        }
        
        if (category.children && category.children.length > 0) {
          const result = findCategoryPath(category.children, targetId, currentPath);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    const path = findCategoryPath(categories, value);
    return path ? path.join(' > ') : placeholder;
  };

  // 选择分类
  const handleSelectCategory = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-select')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`category-select ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 选择器 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`
            w-full px-4 py-3 text-left bg-white border rounded-xl shadow-sm transition-all duration-200
            flex items-center justify-between
            ${loading 
              ? 'border-gray-200 cursor-not-allowed opacity-50' 
              : isOpen 
                ? 'border-blue-500 ring-2 ring-blue-100' 
                : error 
                  ? 'border-red-300 hover:border-red-400' 
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }
          `}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Folder className={`h-4 w-4 flex-shrink-0 ${value ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {loading ? '加载中...' : getSelectedCategoryName()}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {/* 下拉选项 */}
        {isOpen && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {flatCategories.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                暂无可选分类
              </div>
            ) : (
              <div className="py-1">
                {flatCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelectCategory(category.id)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200
                      flex items-center space-x-3 border-b border-gray-100 last:border-b-0
                      ${value === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                  >
                    <Folder className={`h-4 w-4 flex-shrink-0 ${value === category.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div 
                        className={`font-medium truncate ${category.level > 1 ? 'text-sm' : ''}`}
                        style={{ 
                          marginLeft: category.level > 1 ? `${(category.level - 1) * 8}px` : '0',
                          color: category.level > 1 ? '#6b7280' : undefined 
                        }}
                      >
                        {category.displayName}
                      </div>
                      {category.description && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="flex items-center space-x-1 mt-2 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 加载错误信息 */}
      {loadError && (
        <div className="flex items-center space-x-1 mt-2 text-amber-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{loadError}，使用默认分类</span>
        </div>
      )}
    </div>
  );
};