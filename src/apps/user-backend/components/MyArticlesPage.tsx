import React, { useState, useEffect } from 'react';
import { Edit, Trash2, MoreVertical, Plus, Search, Filter, AlertCircle, Send, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Select } from '@shared/components/ui/Select';
import { PostsService } from '@shared/services/api/posts.service';
import { PostDTO, PageResponse } from '@shared/types';
import { showToast } from '@shared/components/ui/Toast';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { ROUTES, routeUtils } from '@shared/routes/routes';

interface MyArticlesPageProps {
  onArticleClick?: (articleId: string) => void;
}

export const MyArticlesPage: React.FC<MyArticlesPageProps> = ({ onArticleClick }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<PostDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<PostDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; articleId: string | null }>({ isOpen: false, articleId: null });

  // 获取文章列表
  const fetchArticles = async (page: number = 1, status?: 'DRAFT' | 'PUBLISHED') => {
    try {
      setIsLoading(true);
      const response = await PostsService.getUserPosts({
        pageNum: page,
        pageSize: 10,
        ...(status && { status })
      });
      setPageInfo(response);
      setArticles(response.records);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      showToast.error('获取文章列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文章
  const handleDeleteArticle = async (articleId: string) => {
    try {
      await PostsService.deletePost(articleId);
      showToast.success('🗑️ 文章已删除');
      fetchArticles(currentPage, statusFilter !== 'all' ? statusFilter : undefined);
    } catch (error) {
      console.error('删除文章失败:', error);
      showToast.error('删除失败，请稍后再试');
    }
  };

  // 切换文章状态
  const handleToggleStatus = async (articleId: string, currentStatus: 'DRAFT' | 'PUBLISHED') => {
    try {
      const newStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
      await PostsService.updatePostStatus(articleId, newStatus);
      
      // 更清晰的成功提示
      if (newStatus === 'PUBLISHED') {
        showToast.success('🎉 文章已成功发布！读者现在可以看到您的文章了');
      } else {
        showToast.success('📝 文章已撤回为草稿，只有您能看到');
      }
      
      fetchArticles(currentPage, statusFilter !== 'all' ? statusFilter : undefined);
    } catch (error) {
      console.error('更新文章状态失败:', error);
      const operation = currentStatus === 'DRAFT' ? '发布' : '撤回';
      showToast.error(`${operation}失败，请稍后再试`);
    }
  };

  // 初始化和状态变化时获取数据
  useEffect(() => {
    fetchArticles(currentPage, statusFilter !== 'all' ? statusFilter : undefined);
  }, [currentPage, statusFilter]);

  // 搜索处理
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: 'DRAFT' | 'PUBLISHED') => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge variant="success" className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>已发布</span>
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span>草稿</span>
          </Badge>
        );
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'PUBLISHED', label: '已发布' },
    { value: 'DRAFT', label: '草稿' }
  ];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的文章</h1>
          <p className="text-gray-600 mt-1">管理你发布的所有文章内容</p>
        </div>
        <Button 
          variant="primary" 
          useCustomTheme={true} 
          className="flex items-center space-x-2" 
          onClick={() => navigate(ROUTES.USER_BACKEND_ARTICLES_CREATE)}
        >
          <Plus className="h-4 w-4" />
          <span>写文章</span>
        </Button>
      </div>

          {/* 搜索和筛选 */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="搜索文章标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as 'all' | 'DRAFT' | 'PUBLISHED')}
                  options={statusOptions}
                  size="sm"
                  className="min-w-[120px]"
                />
              </div>
            </div>
          </Card>

          {/* 文章列表 */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无文章</p>
              <p className="text-gray-400 text-sm mt-2">开始创作您的第一篇文章吧！</p>
              <Button 
                variant="primary" 
                useCustomTheme={true} 
                className="mt-4" 
                onClick={() => navigate(ROUTES.USER_BACKEND_ARTICLES_CREATE)}
              >
                写文章
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className={`p-6 transition-all duration-300 cursor-pointer border-l-4 ${
                    article.status === 'PUBLISHED' 
                      ? 'border-l-green-500 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-green-50/30 to-transparent'
                      : 'border-l-gray-300 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-gray-50/50 to-transparent'
                  }`}
                  onClick={() => onArticleClick?.(article.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {article.title}
                        </h3>
                        {getStatusBadge(article.status)}
                        {article.isTop && <Badge variant="warning">置顶</Badge>}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.summary || article.content.substring(0, 200) + '...'}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>{article.viewCount} 阅读</span>
                        <span>{article.likeCount} 点赞</span>
                        <span>{article.commentCount} 评论</span>
                        <span>创建于 {new Date(article.createTime).toLocaleDateString()}</span>
                        {article.updateTime !== article.createTime && (
                          <span>更新于 {new Date(article.updateTime).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4" onClick={(e) => e.stopPropagation()}>
                      {/* 编辑按钮 */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(routeUtils.getArticleEditRoute(article.id))}
                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                        <span>编辑</span>
                      </Button>
                      
                      {/* 状态切换按钮 - 新设计 */}
                      {article.status === 'DRAFT' ? (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleToggleStatus(article.id, article.status)}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-4 w-4" />
                          <span>发布</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(article.id, article.status)}
                          className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                        >
                          <Archive className="h-4 w-4" />
                          <span>撤回</span>
                        </Button>
                      )}
                      
                      {/* 删除按钮 */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeleteConfirm({ isOpen: true, articleId: article.id })}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>删除</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 分页 */}
          {pageInfo && pageInfo.pages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="neutral" 
                  size="sm" 
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </Button>
                {Array.from({ length: Math.min(5, pageInfo.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button 
                      key={page}
                      variant={currentPage === page ? 'primary' : 'neutral'} 
                      useCustomTheme={currentPage === page}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button 
                  variant="neutral" 
                  size="sm" 
                  disabled={currentPage >= pageInfo.pages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}

          {/* 删除确认对话框 */}
          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onCancel={() => setDeleteConfirm({ isOpen: false, articleId: null })}
            onConfirm={() => {
              if (deleteConfirm.articleId) {
                handleDeleteArticle(deleteConfirm.articleId);
                setDeleteConfirm({ isOpen: false, articleId: null });
              }
            }}
            title="确认删除文章"
            message="删除后文章将无法恢复，您确定要继续吗？"
            confirmText="确认删除"
            cancelText="取消"
            variant="danger"
          />
    </div>
  );
};