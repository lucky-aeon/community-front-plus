import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search,
  Eye,
  Trash2,
  FileText,
  Clock,
  User,
  Tag,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { PostsService } from '@shared/services/api';
import { AdminPostDTO, PageResponse } from '@shared/types';
import toast from 'react-hot-toast';

export const PostsPage: React.FC = () => {
  // 状态管理
  const [posts, setPosts] = useState<AdminPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPost, setDeletingPost] = useState<AdminPostDTO | null>(null);
  const [selectedPost, setSelectedPost] = useState<AdminPostDTO | null>(null);

  // 筛选和分页状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 加载文章列表
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNum: currentPage,
        pageSize,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm.trim() && { title: searchTerm.trim() })
      };

      const response: PageResponse<AdminPostDTO> = await PostsService.getAdminPosts(params);
      setPosts(response.records || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('加载文章列表失败:', error);
      toast.error('加载文章列表失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  // 初始加载和依赖更新
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 重置到第一页
  const resetToFirstPage = useCallback(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadPosts();
    }
  }, [currentPage, loadPosts]);

  // 搜索处理
  const handleSearch = () => {
    resetToFirstPage();
  };

  // 删除文章
  const handleDeletePost = async () => {
    if (!deletingPost) return;

    try {
      await PostsService.deleteAdminPost(deletingPost.id);
      toast.success('文章删除成功');
      setDeletingPost(null);
      loadPosts();
    } catch (error) {
      console.error('删除文章失败:', error);
      toast.error('删除文章失败，请稍后重试');
    }
  };

  // 切换文章状态
  const handleToggleStatus = async (post: AdminPostDTO) => {
    try {
      const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await PostsService.updateAdminPostStatus(post.id, newStatus);
      toast.success(`文章状态已更新为${newStatus === 'PUBLISHED' ? '已发布' : '草稿'}`);
      loadPosts();
    } catch (error) {
      console.error('更新文章状态失败:', error);
      toast.error('更新文章状态失败，请稍后重试');
    }
  };

  // 状态显示
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">已发布</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">草稿</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 分页组件
  const Pagination = () => (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        共 {totalCount} 篇文章，第 {currentPage} / {totalPages} 页
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <p className="text-gray-600 mt-1">管理所有用户发布的文章内容</p>
      </div>

      {/* 筛选和搜索 */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索文章标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as 'ALL' | 'DRAFT' | 'PUBLISHED')}
            options={[
              { value: 'ALL', label: '全部状态' },
              { value: 'PUBLISHED', label: '已发布' },
              { value: 'DRAFT', label: '草稿' }
            ]}
            className="w-36"
            size="md"
          />

          <Button
            onClick={handleSearch}
            variant="outline"
            size="md"
          >
            搜索
          </Button>
        </div>
      </Card>

      {/* 文章列表 */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL'
                ? '未找到符合条件的文章'
                : '还没有文章被发布'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 文章标题和状态 */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {post.title}
                      </h3>
                      {getStatusBadge(post.status)}
                      {post.isTop && <Badge variant="warning">置顶</Badge>}
                    </div>

                    {/* 文章摘要 */}
                    {post.summary && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.summary}
                      </p>
                    )}

                    {/* 文章信息 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{post.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(post.createTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(post)}
                    >
                      {post.status === 'PUBLISHED' ? '下架' : '发布'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingPost(post)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!isLoading && posts.length > 0 && <Pagination />}
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeletePost}
        title="删除文章"
        description={`确定要删除文章"${deletingPost?.title}"吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />

      {/* 文章详情预览（简单实现，可后续扩展为模态框） */}
      {selectedPost && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">文章详情预览</h2>
            <Button variant="outline" onClick={() => setSelectedPost(null)}>
              关闭
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{selectedPost.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>作者：{selectedPost.authorName}</span>
                <span>分类：{selectedPost.categoryName}</span>
                <span>创建时间：{new Date(selectedPost.createTime).toLocaleString()}</span>
              </div>
            </div>
            {selectedPost.summary && (
              <div>
                <h4 className="font-medium mb-2">摘要</h4>
                <p className="text-gray-600">{selectedPost.summary}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span>浏览：{selectedPost.viewCount}</span>
              <span>点赞：{selectedPost.likeCount}</span>
              <span>评论：{selectedPost.commentCount}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};