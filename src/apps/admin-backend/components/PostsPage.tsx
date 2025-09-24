import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AdminPagination from '@shared/components/AdminPagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, XCircle } from 'lucide-react';
import { PostsService } from '@shared/services/api/posts.service';
import type { AdminPostDTO, AdminPostQueryRequest, PageResponse } from '@shared/types';

type PostStatus = 'DRAFT' | 'PUBLISHED';

export const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<AdminPostDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });

  // 筛选（标题关键词仅前端过滤；状态尝试透传到后端，若不支持则前端过滤当前页）
  const [filters, setFilters] = useState<{ pageNum: number; pageSize: number; keyword: string; status?: PostStatus }>(
    { pageNum: 1, pageSize: 10, keyword: '', status: undefined }
  );

  // 删除对话框
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: AdminPostDTO }>({ open: false });

  const loadPosts = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const req: AdminPostQueryRequest = { pageNum: pageNum ?? filters.pageNum, pageSize: pageSize ?? filters.pageSize };
      // 透传额外字段（后端如果支持将生效）
      const params: Record<string, unknown> = { ...req };
      if (filters.keyword?.trim()) params.keyword = filters.keyword.trim();
      if (filters.status) params.status = filters.status;
      const res: PageResponse<AdminPostDTO> = await PostsService.getAdminPosts(params as unknown as AdminPostQueryRequest);
      setPosts(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载文章失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters.pageNum, filters.pageSize, filters.keyword, filters.status]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 前端过滤（用于当后端不支持时对当前页结果做精简展示）
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (filters.keyword.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(kw) || p.summary?.toLowerCase().includes(kw));
    }
    if (filters.status) {
      list = list.filter(p => p.status === filters.status);
    }
    return list;
  }, [posts, filters.keyword, filters.status]);

  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, pageNum: page }));
  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10, keyword: '', status: undefined });
  const handleRefresh = () => loadPosts(pagination.current, pagination.size);
  const handleQuery = () => { setFilters(prev => ({ ...prev, pageNum: 1 })); loadPosts(1, pagination.size); };

  // 操作：删除（当前无触发入口，仅保留处理逻辑）
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await PostsService.deletePost(deleteDialog.item.id);
      setDeleteDialog({ open: false });
      await loadPosts();
    } catch (e) {
      console.error('删除文章失败', e);
    }
  };

  const statusBadge = (status: PostStatus) => (
    <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
      {status === 'PUBLISHED' ? '已发布' : '草稿'}
    </Badge>
  );

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          {/* 筛选行：placeholder，无标签 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="按标题/摘要搜索" value={filters.keyword} onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))} />
            <Select value={filters.status || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : (v as PostStatus) }))}>
              <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* 操作按钮行 */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button onClick={handleQuery} disabled={loading}>
              <Search className="mr-2 h-4 w-4" /> 查询
            </Button>
          </div>

          {/* 列表 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[280px]">标题/摘要</TableHead>
                  <TableHead className="min-w-[120px]">作者</TableHead>
                  <TableHead className="min-w-[120px]">分类</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[80px]">点赞</TableHead>
                  <TableHead className="min-w-[80px]">浏览</TableHead>
                  <TableHead className="min-w-[80px]">评论</TableHead>
                  <TableHead className="min-w-[160px]">发布时间</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium line-clamp-1" title={item.title}>{item.title}</div>
                        {item.summary && (
                          <div className="text-sm text-muted-foreground line-clamp-1" title={item.summary}>{item.summary}</div>
                        )}
                      </TableCell>
                      <TableCell>{item.authorName}</TableCell>
                      <TableCell>{item.categoryName}</TableCell>
                      <TableCell>{statusBadge(item.status)}</TableCell>
                      <TableCell>{item.likeCount}</TableCell>
                      <TableCell>{item.viewCount}</TableCell>
                      <TableCell>{item.commentCount}</TableCell>
                      <TableCell>{item.publishTime ? new Date(item.publishTime).toLocaleString('zh-CN') : '-'}</TableCell>
                      
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页：统计始终可见；多页时显示按钮 */}
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页</div>
              {pagination.pages > 1 && (
                <AdminPagination
                  current={pagination.current}
                  totalPages={pagination.pages}
                  onChange={(p) => { handlePageChange(p); loadPosts(p, pagination.size); }}
                  mode="full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
