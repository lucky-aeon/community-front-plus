import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Plus, RefreshCw, Edit, Trash2, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import AdminPagination from '@shared/components/AdminPagination';
import { AdminExpressionService } from '@shared/services/api/admin-expression.service';
import type { AdminExpressionDTO, ExpressionQueryRequest, PageResponse, CreateExpressionRequest, UpdateExpressionRequest } from '@shared/types';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
// 组件层不再直接弹出 axios 成功提示，统一交给拦截器
// 仅在本地校验失败等场景才使用 showToast
import { showToast } from '@shared/utils/toast';
import { ImageUpload } from '@shared/components/common/ImageUpload';

export const ExpressionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<AdminExpressionDTO[]>([]);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [query, setQuery] = useState<ExpressionQueryRequest>({ pageNum: 1, pageSize: 10 });
  const [keyword, setKeyword] = useState('');

  // 创建/编辑对话框
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AdminExpressionDTO | null>(null);
  const [form, setForm] = useState<{ name: string; code: string; imageUrl?: string; sortOrder?: string }>(
    { name: '', code: '', imageUrl: '', sortOrder: '0' }
  );
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 删除对话框
  const [delOpen, setDelOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AdminExpressionDTO | null>(null);

  // 加载列表
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page: PageResponse<AdminExpressionDTO> = await AdminExpressionService.getExpressions(query);
      setList(page.records);
      setPagination({ current: page.current, size: page.size, total: page.total, pages: page.pages });
    } catch (e) {
      console.error('加载表情列表失败:', e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [query.pageNum, query.pageSize, query.isActive, query.code, query.name]);

  const statusBadge = useCallback((isActive: boolean) => {
    const text = isActive ? '启用' : '停用';
    const variant = isActive ? 'default' : 'secondary';
    return <Badge variant={variant as any}>{text}</Badge>;
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', imageUrl: '', sortOrder: '0' });
    setEditOpen(true);
  };
  const openEdit = (row: AdminExpressionDTO) => {
    setEditing(row);
    setForm({ name: row.name, code: row.code, imageUrl: row.imageUrl, sortOrder: String(row.sortOrder ?? 0) });
    setEditOpen(true);
  };

  const valid = useMemo(() => form.name.trim().length > 0 && form.code.trim().length > 0, [form]);

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      const payload: CreateExpressionRequest | UpdateExpressionRequest = {
        name: form.name.trim(),
        code: form.code.trim(),
        imageUrl: form.imageUrl?.trim() || undefined,
        sortOrder: form.sortOrder && !isNaN(+form.sortOrder) ? +form.sortOrder : undefined,
      } as any;
      if (!editing) {
        await AdminExpressionService.createExpression(payload as CreateExpressionRequest);
        // 成功提示交给 Axios 拦截器根据后端返回的 message 统一弹出
      } else {
        await AdminExpressionService.updateExpression(editing.id, payload as UpdateExpressionRequest);
        // 成功提示交给 Axios 拦截器根据后端返回的 message 统一弹出
      }
      setEditOpen(false);
      await load();
    } catch (e) {
      console.error('提交失败:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (row: AdminExpressionDTO) => {
    try {
      const active = await AdminExpressionService.toggle(row.id);
      setList(prev => prev.map(it => it.id === row.id ? { ...it, isActive: active } : it));
    } catch (e) {
      console.error('更新状态失败:', e);
    }
  };

  const confirmDelete = (row: AdminExpressionDTO) => { setToDelete(row); setDelOpen(true); };
  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await AdminExpressionService.deleteExpression(toDelete.id);
      setDelOpen(false);
      setToDelete(null);
      // 若最后一条被删，回退一页
      if (list.length === 1 && pagination.current > 1) {
        setQuery(prev => ({ ...prev, pageNum: (prev.pageNum || 1) - 1 }));
      } else {
        await load();
      }
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  const onPickResource = (snippet: string) => {
    // 解析 ResourcePicker 返回的 Markdown 或 URL，抽取URL部分
    const match = snippet.match(/\(([^)]+)\)/);
    const url = match?.[1] || snippet;
    // 将URL反解为资源访问端点携带的资源ID（如果是我们的公共端点），否则直接存URL
    try {
      const idMatch = url.match(/\/api\/public\/resource\/(.*?)\//);
      const rid = idMatch?.[1];
      setForm(prev => ({ ...prev, imageUrl: rid || url }));
    } catch {
      setForm(prev => ({ ...prev, imageUrl: url }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input placeholder="名称/代码 关键字" value={keyword} onChange={(e) => { const v = e.target.value; setKeyword(v); setQuery(prev => ({ ...prev, code: v || undefined, name: v || undefined, pageNum: 1 })); }} />
            </div>
            <div>
              <Select value={typeof query.isActive === 'boolean' ? (query.isActive ? 'ENABLED' : 'DISABLED') : 'all'} onValueChange={(v) => setQuery(prev => ({ ...prev, isActive: v === 'all' ? undefined : v === 'ENABLED', pageNum: 1 }))}>
                <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="ENABLED">启用</SelectItem>
                  <SelectItem value="DISABLED">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => load()} disabled={loading}><RefreshCw className="h-4 w-4 mr-2" />刷新</Button>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />新增表情</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card className="mt-4 flex-1">
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">预览</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>代码</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-[100px]">排序</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right min-w-[200px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-12 w-16" /></TableCell>
                      <TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  list.map(row => {
                    const preview = row.imageUrl ? ResourceAccessService.toAccessUrl(row.imageUrl) : undefined;
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          {preview ? (
                            <img src={preview} alt={row.name} className="h-12 w-12 rounded object-cover border" />
                          ) : (
                            <div className="h-12 w-12 rounded border flex items-center justify-center text-gray-400"><ImageIcon className="h-5 w-5" /></div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.code}</TableCell>
                        <TableCell>{statusBadge(row.isActive)}</TableCell>
                        <TableCell>{row.sortOrder ?? 0}</TableCell>
                        <TableCell className="text-muted-foreground">{row.createTime?.replace('T', ' ')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => toggleStatus(row)}>
                              {row.isActive ? (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  停用
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  启用
                                </>
                              )}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                              <Edit className="h-3 w-3 mr-1" /> 编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmDelete(row)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> 删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="mt-4">
            <AdminPagination current={pagination.current} totalPages={pagination.pages} onChange={(p) => setQuery(prev => ({ ...prev, pageNum: p }))} />
          </div>
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) setEditOpen(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑表情' : '新增表情'}</DialogTitle>
            <DialogDescription>填写表情信息并保存</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">名称</Label>
              <Input className="col-span-3" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">代码</Label>
              <Input className="col-span-3" value={form.code} onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))} placeholder=":smile:" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">图片</Label>
              <div className="col-span-3 flex gap-2">
                <Input value={form.imageUrl || ''} onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))} placeholder="资源ID或图片URL" />
                <Button variant="secondary" onClick={() => setPickerOpen(true)} title="从资源库选择"><ArrowUpRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">上传</Label>
              <div className="col-span-3">
                <ImageUpload
                  value={form.imageUrl || ''}
                  onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
                  onUploadSuccess={(rid) => { if (rid) setForm(prev => ({ ...prev, imageUrl: rid })); }}
                  placeholder="点击上传或拖拽图片到此处"
                  previewSize="lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">排序</Label>
              <Input className="col-span-3" type="number" min={0} value={form.sortOrder || '0'} onChange={(e) => setForm(prev => ({ ...prev, sortOrder: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={submit} disabled={!valid || submitting}>{submitting ? '提交中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 资源选择器 */}
      <ResourcePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onInsert={onPickResource} />

      {/* 删除确认 */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除表情</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销，确定删除该表情吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDelOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpressionsPage;
