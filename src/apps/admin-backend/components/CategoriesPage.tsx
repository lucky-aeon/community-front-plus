import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';

import { CategoriesService } from '@shared/services/api/categories.service';
import type { CategoryDTO, CategoryQueryRequest, PageResponse } from '@shared/types';

type CategoryType = 'ARTICLE' | 'QA';

export const CategoriesPage: React.FC = () => {
  const [list, setList] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<{ pageNum: number; pageSize: number; type?: CategoryType; parentId?: string; keyword: string }>({ pageNum: 1, pageSize: 10, keyword: '' });
  const [rootOptions, setRootOptions] = useState<CategoryDTO[]>([]);

  // 创建/编辑对话框
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    submitting: boolean;
    id?: string;
    form: { name: string; type: CategoryType | '' ; parentId?: string; sortOrder: string; description?: string };
  }>({ open: false, mode: 'create', submitting: false, form: { name: '', type: '', parentId: undefined, sortOrder: '1', description: '' } });

  // 删除对话框
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: CategoryDTO }>({ open: false });

  const loadRoots = useCallback(async (type?: CategoryType) => {
    try {
      const roots = await CategoriesService.getRootCategories(type);
      setRootOptions(roots);
    } catch (e) {
      console.error('加载主分类失败', e);
    }
  }, []);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const req: CategoryQueryRequest = {
        pageNum: filters.pageNum,
        pageSize: filters.pageSize,
        ...(filters.type && { type: filters.type }),
        ...(filters.parentId && { parentId: filters.parentId }),
      };
      const res: PageResponse<CategoryDTO> = await CategoriesService.getCategoriesList(req);
      setList(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载分类失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters.pageNum, filters.pageSize, filters.type, filters.parentId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // 当切换类型时同步刷新可选父级
  useEffect(() => {
    loadRoots(filters.type);
  }, [filters.type, loadRoots]);

  // 前端关键词过滤当前页
  const filtered = useMemo(() => {
    if (!filters.keyword.trim()) return list;
    const kw = filters.keyword.trim().toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw));
  }, [list, filters.keyword]);

  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10, keyword: '', type: undefined, parentId: undefined });
  const handlePageChange = (p: number) => setFilters(prev => ({ ...prev, pageNum: p }));

  // 创建/编辑
  const openCreate = () => setEditDialog({ open: true, mode: 'create', submitting: false, form: { name: '', type: filters.type || '', parentId: filters.parentId, sortOrder: '1', description: '' } });
  const openEdit = (item: CategoryDTO) => setEditDialog({ open: true, mode: 'edit', id: item.id, submitting: false, form: { name: item.name, type: item.type, parentId: item.parentId, sortOrder: String(item.sortOrder), description: item.description || '' } });
  const submitEdit = async () => {
    const { mode, id, form } = editDialog;
    if (!form.name.trim()) return;
    if (!form.type) return;
    const sortOrder = parseInt(form.sortOrder || '1', 10);
    const payload = { name: form.name.trim(), type: form.type as CategoryType, sortOrder, ...(form.parentId ? { parentId: form.parentId } : {}), ...(form.description ? { description: form.description } : {}) };
    try {
      setEditDialog(prev => ({ ...prev, submitting: true }));
      if (mode === 'create') {
        await CategoriesService.createCategory(payload as any);
      } else if (id) {
        await CategoriesService.updateCategory(id, payload as any);
      }
      setEditDialog({ open: false, mode: 'create', submitting: false, form: { name: '', type: '', sortOrder: '1', description: '' } });
      await loadList();
    } catch (e) {
      console.error('保存分类失败', e);
      setEditDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // 删除
  const confirmDelete = (item: CategoryDTO) => setDeleteDialog({ open: true, item });
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await CategoriesService.deleteCategory(deleteDialog.item.id);
      setDeleteDialog({ open: false });
      await loadList();
    } catch (e) {
      console.error('删除分类失败', e);
    }
  };

  const typeText = (t: CategoryType) => (t === 'ARTICLE' ? '文章' : '问答');
  const activeBadge = (active: boolean) => <Badge variant={active ? 'default' : 'secondary'}>{active ? '启用' : '停用'}</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">分类管理</h1>
          <p className="text-muted-foreground mt-1">管理文章与问答分类，支持多级结构</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> 新建分类</Button>
      </div>

      {/* 筛选区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">筛选 {loading && <RefreshCw className="w-4 h-4 animate-spin" />}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input placeholder="按名称/描述搜索..." value={filters.keyword} onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, pageNum: 1 }))} />
            </div>
            <div>
              <Label className="sr-only">类型</Label>
              <Select value={filters.type || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, type: v === 'all' ? undefined : (v as CategoryType), parentId: undefined, pageNum: 1 }))}>
                <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="ARTICLE">文章</SelectItem>
                  <SelectItem value="QA">问答</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="sr-only">父级</Label>
              <Select value={filters.parentId || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, parentId: v === 'all' ? undefined : v, pageNum: 1 }))} disabled={!filters.type}>
                <SelectTrigger><SelectValue placeholder={filters.type ? '选择父级分类（可选）' : '先选择类型'} /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部（不区分父级）</SelectItem>
                  {rootOptions.map(opt => (
                    <SelectItem value={opt.id} key={opt.id}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleReset} disabled={loading}><RefreshCw className="w-4 h-4 mr-2" /> 重置筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card>
        <CardHeader><CardTitle className="text-lg">分类列表</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[240px]">名称/描述</TableHead>
                  <TableHead className="min-w-[80px]">类型</TableHead>
                  <TableHead className="min-w-[80px]">层级</TableHead>
                  <TableHead className="min-w-[80px]">排序</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="text-right min-w-[160px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium line-clamp-1" title={item.name}>{item.name}</div>
                        {item.description && (<div className="text-sm text-muted-foreground line-clamp-1" title={item.description}>{item.description}</div>)}
                      </TableCell>
                      <TableCell>{typeText(item.type)}</TableCell>
                      <TableCell>{item.level}</TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      <TableCell>{activeBadge(item.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4 mr-2" /> 编辑</Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => confirmDelete(item)}><Trash2 className="w-4 h-4 mr-2" /> 删除</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {!loading && pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <div className="text-sm text-muted-foreground">共 {pagination.total} 条记录，第 {pagination.current} / {pagination.pages} 页</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.current <= 1} onClick={() => handlePageChange(1)}>首页</Button>
                <Button variant="outline" size="sm" disabled={pagination.current <= 1} onClick={() => handlePageChange(pagination.current - 1)}>上一页</Button>
                <span className="text-sm px-2">{pagination.current} / {pagination.pages}</span>
                <Button variant="outline" size="sm" disabled={pagination.current >= pagination.pages} onClick={() => handlePageChange(pagination.current + 1)}>下一页</Button>
                <Button variant="outline" size="sm" disabled={pagination.current >= pagination.pages} onClick={() => handlePageChange(pagination.pages)}>尾页</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>删除后不可恢复，子分类需先移除或编辑父级。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 创建/编辑对话框 */}
      <Dialog open={editDialog.open} onOpenChange={(open) => {
        if (!editDialog.submitting) {
          setEditDialog(prev => ({ ...prev, open }));
          if (!open) setEditDialog({ open: false, mode: 'create', submitting: false, form: { name: '', type: '', sortOrder: '1', description: '' } });
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editDialog.mode === 'create' ? '新建分类' : '编辑分类'}</DialogTitle>
            <DialogDescription>填写分类基本信息</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input value={editDialog.form.name} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, name: e.target.value } }))} placeholder="分类名称" />
            </div>
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={editDialog.form.type} onValueChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, type: v as CategoryType } }))}>
                <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="ARTICLE">文章</SelectItem>
                  <SelectItem value="QA">问答</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>父级分类（可选）</Label>
              <Select value={editDialog.form.parentId || ''} onValueChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, parentId: v || undefined } }))}>
                <SelectTrigger><SelectValue placeholder="不选择则为主分类" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  {rootOptions.filter(r => r.type === editDialog.form.type).map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>排序值</Label>
              <Input type="number" min={0} value={editDialog.form.sortOrder} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, sortOrder: e.target.value } }))} placeholder="数值越小越靠前" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>描述（可选）</Label>
              <Input value={editDialog.form.description || ''} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, description: e.target.value } }))} placeholder="简要描述" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, mode: 'create', submitting: false, form: { name: '', type: '', sortOrder: '1', description: '' } })} disabled={editDialog.submitting}>取消</Button>
            <Button onClick={submitEdit} disabled={editDialog.submitting}>{editDialog.submitting ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
