import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { PostsService } from '@shared/services/api';
import { AdminPostDTO, AdminPostQueryRequest } from '@shared/types';
import toast from 'react-hot-toast';

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
      toast.error('加载文章列表失败');
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

  // 渲染文章行
  const renderPostRow = (post: AdminPostDTO) => {
    return (
      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
        <td className="py-4 px-6">
          <div className="flex items-center space-x-2">
            <div className="font-medium text-gray-900">
              {post.title}
            </div>
            {post.isTop && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">置顶</span>
            )}
          </div>
        </td>
        
        <td className="py-4 px-6">
          <span className="text-sm text-gray-900">{post.authorName}</span>
        </td>
        
        <td className="py-4 px-6">
          <span className="text-sm text-gray-900">{post.categoryName}</span>
        </td>
        
        <td className="py-4 px-6">
          <Badge 
            variant={post.status === 'PUBLISHED' ? 'success' : 'warning'}
            size="sm"
          >
            {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
          </Badge>
        </td>
        
        <td className="py-4 px-6 text-sm text-gray-600">
          {post.publishTime ? formatDateTime(post.publishTime) : '-'}
        </td>
        
        <td className="py-4 px-6 text-sm text-gray-600">
          {formatDateTime(post.createTime)}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <p className="text-gray-600 mt-1">管理系统中的所有用户文章</p>
      </div>

      {/* 文章列表 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文章标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    暂无文章数据
                  </td>
                </tr>
              ) : (
                posts.map(post => renderPostRow(post))
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
    </div>
  );
};