import React, { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  Tag
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DataTable, DataTableColumn } from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { TableActions, TableAction } from '@shared/components/ui/TableActions';
import { CategoriesService } from '@shared/services/api';
import { CategoryDTO, CategoryQueryRequest } from '@shared/types';
import { CategoryModal } from './CategoryModal';

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
      setDeletingCategory(null);
      loadCategories(); // 重新加载列表
    } catch (error) {
      console.error('删除分类失败:', error);
    }
  };

  // 定义表格列
  const columns: DataTableColumn<CategoryDTO>[] = [
    {
      key: 'name',
      title: '分类名称',
      render: (_, category) => (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      title: '类型',
      render: (_, category) => (
        <Badge
          variant={category.type === 'ARTICLE' ? 'primary' : 'success'}
          size="sm"
        >
          {category.type === 'ARTICLE' ? '文章' : '问答'}
        </Badge>
      ),
    },
    {
      key: 'sortOrder',
      title: '排序',
      dataIndex: 'sortOrder',
      render: (sortOrder) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{sortOrder}</span>
      ),
    },
    {
      key: 'createTime',
      title: '创建时间',
      render: (_, category) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(category.createTime).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, category) => {
        const actions: TableAction[] = [
          {
            key: 'edit',
            type: 'edit',
            onClick: () => handleEdit(category),
          },
          {
            key: 'delete',
            type: 'delete',
            onClick: () => handleDelete(category),
          },
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">分类管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理文章和问答分类，支持多级分类结构</p>
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
      <DataTable
        columns={columns}
        data={categories}
        loading={isLoading}
        rowKey="id"
        emptyText="暂无分类数据"
        emptyIcon={<Tag className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onChange={setCurrentPage}
            mode="simple"
          />
        }
      />

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