import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Send, Archive, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PostsService } from '@shared/services/api/posts.service';
import { PostDTO, PageResponse } from '@shared/types';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { ROUTES, routeUtils } from '@shared/routes/routes';
import AdminPagination from '@shared/components/AdminPagination';

export const MyArticlesPage: React.FC = () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文章
  const handleDeleteArticle = async (articleId: string) => {
    try {
      await PostsService.deletePost(articleId);
      fetchArticles(currentPage, statusFilter !== 'all' ? statusFilter : undefined);
    } catch (error) {
      console.error('删除文章失败:', error);
    }
  };

  // 切换文章状态
  const handleToggleStatus = async (articleId: string, currentStatus: 'DRAFT' | 'PUBLISHED') => {
    try {
      const newStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
      await PostsService.updatePostStatus(articleId, newStatus);
      
      fetchArticles(currentPage, statusFilter !== 'all' ? statusFilter : undefined);
    } catch (error) {
      console.error('更新文章状态失败:', error);
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

  return (
    <div className="h-full flex flex-col">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的文章</h1>
          <p className="text-gray-600 mt-1">管理你发布的所有文章内容</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center space-x-2" 
          onClick={() => navigate(ROUTES.USER_BACKEND_ARTICLES_CREATE)}
        >
          <Plus className="h-4 w-4" />
          <span>写文章</span>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* 筛选区 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 min-w-0">
            <div className="relative">
              <Input
                placeholder="搜索标题/内容关键字"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as 'all' | 'DRAFT' | 'PUBLISHED'); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="文章状态" />
              </SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
              </SelectContent>
            </Select>

            {/* 页大小选择已移除，统一使用底部分页组件 */}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCurrentPage(1); }} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={() => fetchArticles(currentPage, statusFilter !== 'all' ? statusFilter : undefined)} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
          </div>

          {/* 表格 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[280px]">标题</TableHead>
                  <TableHead className="min-w-[90px]">状态</TableHead>
                  <TableHead className="min-w-[80px]">阅读</TableHead>
                  <TableHead className="min-w-[80px]">点赞</TableHead>
                  <TableHead className="min-w-[80px]">评论</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[160px]">更新时间</TableHead>
                  <TableHead className="text-right min-w-[220px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">加载中...</TableCell>
                  </TableRow>
                ) : filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-[560px] truncate" title={article.title}>{article.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(article.status)}
                          {article.isTop && <Badge variant="warning">置顶</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{article.viewCount ?? 0}</TableCell>
                      <TableCell>{article.likeCount ?? 0}</TableCell>
                      <TableCell>{article.commentCount ?? 0}</TableCell>
                      <TableCell>{article.createTime ? new Date(article.createTime).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell>{article.updateTime ? new Date(article.updateTime).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(routeUtils.getArticleEditRoute(article.id))}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>编辑</span>
                          </Button>
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="pt-4">
            {pageInfo && (
              <AdminPagination
                current={pageInfo.current}
                totalPages={pageInfo.pages}
                total={pageInfo.total}
                onChange={(p) => setCurrentPage(p)}
                mode="full"
                alwaysShow
              />
            )}
          </div>
        </CardContent>
      </Card>

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
