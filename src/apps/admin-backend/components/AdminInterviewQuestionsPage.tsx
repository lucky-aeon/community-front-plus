import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminPagination from '@shared/components/AdminPagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, XCircle, Edit, Archive, Send, Trash2 } from 'lucide-react';
import type { InterviewQuestionDTO, InterviewQuestionQueryRequest, PageResponse } from '@shared/types';
import { AdminInterviewQuestionsService } from '@shared/services/api';
import { AdminInterviewQuestionEditor } from './AdminInterviewQuestionEditor';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';

type ProblemStatus = 'DRAFT' | 'PUBLISHED';

export const AdminInterviewQuestionsPage: React.FC = () => {
  const [list, setList] = useState<InterviewQuestionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<{ pageNum: number; pageSize: number; keyword: string; status?: ProblemStatus }>(
    { pageNum: 1, pageSize: 10, keyword: '', status: undefined }
  );

  const [editing, setEditing] = useState<InterviewQuestionDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; questionId: string | null }>({ isOpen: false, questionId: null });

  const load = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const params: InterviewQuestionQueryRequest = {
        pageNum: pageNum ?? filters.pageNum,
        pageSize: pageSize ?? filters.pageSize,
      };
      if (filters.keyword.trim()) params.title = filters.keyword.trim();
      if (filters.status) params.status = filters.status;
      const res: PageResponse<InterviewQuestionDTO> = await AdminInterviewQuestionsService.page(params);
      setList(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载题库失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters.pageNum, filters.pageSize, filters.keyword, filters.status]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let data = list;
    if (filters.keyword.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      data = data.filter(d => d.title.toLowerCase().includes(kw) || (d.description || '').toLowerCase().includes(kw));
    }
    if (filters.status) data = data.filter(d => d.status === filters.status);
    return data;
  }, [list, filters.keyword, filters.status]);

  const handlePageChange = (p: number) => setFilters(prev => ({ ...prev, pageNum: p }));
  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10, keyword: '', status: undefined });
  const handleRefresh = () => load(pagination.current, pagination.size);
  const handleQuery = () => { setFilters(prev => ({ ...prev, pageNum: 1 })); load(1, pagination.size); };

  const doChangeStatus = async (id: string, newStatus: ProblemStatus) => {
    try {
      await AdminInterviewQuestionsService.changeStatus(id, newStatus);
      await load();
    } catch (e) {
      console.error('修改状态失败', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AdminInterviewQuestionsService.delete(id);
      await load();
    } catch (e) {
      console.error('删除失败', e);
    }
  };

  const statusBadge = (s: ProblemStatus) => (
    <Badge variant={s === 'PUBLISHED' ? 'default' : 'secondary'}>
      {s === 'PUBLISHED' ? '已发布' : '草稿'}
    </Badge>
  );

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="按标题/描述搜索" value={filters.keyword} onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))} />
            <Select value={filters.status || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : (v as ProblemStatus) }))}>
              <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleReset} disabled={loading}><XCircle className="mr-2 h-4 w-4" />重置</Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />刷新</Button>
            <Button onClick={handleQuery} disabled={loading}><Search className="mr-2 h-4 w-4" />查询</Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[260px]">标题/描述</TableHead>
                  <TableHead className="min-w-[120px]">作者</TableHead>
                  <TableHead className="min-w-[120px]">分类</TableHead>
                  <TableHead className="min-w-[60px]">难度</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[120px]">发布时间</TableHead>
                  <TableHead className="text-right min-w-[280px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium line-clamp-1" title={item.title}>{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1" title={item.description}>{item.description}</div>
                        )}
                      </TableCell>
                      <TableCell>{item.authorName || '-'}</TableCell>
                      <TableCell>{item.categoryName || '-'}</TableCell>
                      <TableCell>{item.rating ?? '-'}</TableCell>
                      <TableCell>{statusBadge(item.status as ProblemStatus)}</TableCell>
                      <TableCell>{item.publishTime || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => setEditing(item)} className="flex items-center space-x-1">
                            <Edit className="h-4 w-4" />
                            <span>编辑</span>
                          </Button>
                          {item.status === 'DRAFT' ? (
                            <Button size="sm" onClick={() => doChangeStatus(item.id, 'PUBLISHED')} className="flex items-center space-x-1 bg-green-600 hover:bg-green-700">
                              <Send className="h-4 w-4" />
                              <span>发布</span>
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => doChangeStatus(item.id, 'DRAFT')} className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200">
                              <Archive className="h-4 w-4" />
                              <span>撤回</span>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ isOpen: true, questionId: item.id })} className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页</div>
              {pagination.pages > 1 && (
                <AdminPagination current={pagination.current} totalPages={pagination.pages} onChange={(p) => { handlePageChange(p); load(p, pagination.size); }} mode="full" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑面试题</DialogTitle>
          </DialogHeader>
          {editing && (
            <AdminInterviewQuestionEditor
              data={editing}
              onClose={() => setEditing(null)}
              onSaved={(q) => { setEditing(null); load(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, questionId: null })}
        onConfirm={() => {
          if (deleteConfirm.questionId) {
            handleDelete(deleteConfirm.questionId);
            setDeleteConfirm({ isOpen: false, questionId: null });
          }
        }}
        title="确认删除面试题"
        message="删除后面试题将无法恢复，您确定要继续吗？"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  );
};

export default AdminInterviewQuestionsPage;
