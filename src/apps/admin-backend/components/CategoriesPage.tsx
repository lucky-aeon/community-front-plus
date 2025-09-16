import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Tag
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { CategoriesService } from '@shared/services/api';
import { CategoryDTO, CategoryQueryRequest } from '@shared/types';
import { CategoryModal } from './CategoryModal';
import toast from 'react-hot-toast';

export const CategoriesPage: React.FC = () => {
  // 状态管理
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryDTO | null>(null);

  // 筛选和分页状态
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ARTICLE' | 'QA'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 加载分类列表
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CategoryQueryRequest = {
        pageNum: currentPage,
        pageSize,
        ...(typeFilter !== 'ALL' && { type: typeFilter as 'ARTICLE' | 'QA' })
      };

      const response = await CategoriesService.getCategoriesList(params);
      setCategories(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载分类列表失败:', error);
      toast.error('加载分类列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, typeFilter, pageSize]);

  // 初始化加载
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // 处理创建分类
  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // 处理编辑分类
  const handleEdit = (category: CategoryDTO) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // 处理删除分类
  const handleDelete = async (category: CategoryDTO) => {
    setDeletingCategory(category);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await CategoriesService.deleteCategory(deletingCategory.id);
      toast.success('分类删除成功');
      setDeletingCategory(null);
      loadCategories(); // 重新加载列表
    } catch (error) {
      console.error('删除分类失败:', error);
      toast.error('删除分类失败');
    }
  };

  // 渲染分类行
  const renderCategoryRow = (category: CategoryDTO) => {
    return (
      <React.Fragment key={category.id}>
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{category.name}</span>
            </div>
          </td>
          
          <td className="py-4 px-6">
            <Badge 
              variant={category.type === 'ARTICLE' ? 'primary' : 'success'}
              size="sm"
            >
              {category.type === 'ARTICLE' ? '文章' : '问答'}
            </Badge>
          </td>
          
          <td className="py-4 px-6 text-sm text-gray-600">
            {category.sortOrder}
          </td>
          
          <td className="py-4 px-6 text-sm text-gray-600">
            {new Date(category.createTime).toLocaleDateString()}
          </td>
          
          <td className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(category)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(category)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-600 mt-1">管理文章和问答分类，支持多级分类结构</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>创建分类</span>
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索分类名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as 'ALL' | 'ARTICLE' | 'QA')}
            options={[
              { value: 'ALL', label: '全部类型' },
              { value: 'ARTICLE', label: '文章' },
              { value: 'QA', label: '问答' }
            ]}
            className="w-36"
            size="md"
          />
        </div>
      </Card>

      {/* 分类列表 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    暂无分类数据
                  </td>
                </tr>
              ) : (
                categories.map(category => renderCategoryRow(category))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                共 {totalCount} 条记录，第 {currentPage} 页，共 {totalPages} 页
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        title="确认删除分类"
        message={`确定要删除分类"${deletingCategory?.name}"吗？此操作不可恢复。`}
        confirmText="确定删除"
        cancelText="取消"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCategory(null)}
      />

      {/* 创建/编辑分类模态框 */}
      <CategoryModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          loadCategories(); // 重新加载分类列表
        }}
      />
    </div>
  );
};