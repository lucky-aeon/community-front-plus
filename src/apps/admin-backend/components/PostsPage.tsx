import React, { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@shared/components/ui/Badge';
import { DataTable, DataTableColumn } from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { PostsService } from '@shared/services/api';
import { AdminPostDTO, AdminPostQueryRequest } from '@shared/types';

export const PostsPage: React.FC = () => {
  // 状态管理
  const [posts, setPosts] = useState<AdminPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 加载文章列表
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AdminPostQueryRequest = {
        pageNum: currentPage,
        pageSize
      };

      const response = await PostsService.getAdminPosts(params);
      setPosts(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载文章列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // 初始化加载
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 格式化时间显示
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 定义表格列
  const columns: DataTableColumn<AdminPostDTO>[] = [
    {
      key: 'title',
      title: '文章标题',
      render: (_, post) => (
        <div className="flex items-center space-x-2">
          <div className="font-medium text-gray-900 dark:text-white">
            {post.title}
          </div>
          {post.isTop && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded dark:bg-red-900 dark:text-red-200">置顶</span>
          )}
        </div>
      ),
    },
    {
      key: 'authorName',
      title: '作者',
      dataIndex: 'authorName',
      render: (authorName) => (
        <span className="text-sm text-gray-900 dark:text-white">{authorName}</span>
      ),
    },
    {
      key: 'categoryName',
      title: '分类',
      dataIndex: 'categoryName',
      render: (categoryName) => (
        <span className="text-sm text-gray-900 dark:text-white">{categoryName}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_, post) => (
        <Badge
          variant={post.status === 'PUBLISHED' ? 'success' : 'warning'}
          size="sm"
        >
          {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
        </Badge>
      ),
    },
    {
      key: 'publishTime',
      title: '发布时间',
      render: (_, post) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {post.publishTime ? formatDateTime(post.publishTime) : '-'}
        </span>
      ),
    },
    {
      key: 'createTime',
      title: '创建时间',
      render: (_, post) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDateTime(post.createTime)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">文章管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">管理系统中的所有用户文章</p>
      </div>

      {/* 文章列表 */}
      <DataTable
        columns={columns}
        data={posts}
        loading={isLoading}
        rowKey="id"
        emptyText="暂无文章数据"
        emptyIcon={<FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
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
    </div>
  );
};