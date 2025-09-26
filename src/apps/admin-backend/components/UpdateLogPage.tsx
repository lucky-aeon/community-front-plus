import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
// 描述使用共享的 Cherry Markdown 编辑器
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { RefreshCw, Plus, Pencil, Trash2, ArrowUpToLine, ArrowDownToLine, Search, XCircle } from 'lucide-react';
import AdminPagination from '@shared/components/AdminPagination';
import { showToast } from '@shared/utils/toast';

import { UpdateLogService } from '@shared/services/api/update-log.service';
import type {
  UpdateLogDTO,
  CreateUpdateLogRequest,
  UpdateUpdateLogRequest,
  AdminUpdateLogQueryRequest,
  PageResponse,
  ChangeType,
  UpdateLogStatus,
  ChangeDetailDTO,
} from '@shared/types';

type Filters = { pageNum: number; pageSize: number; status?: UpdateLogStatus; version?: string; title?: string };

export const UpdateLogPage: React.FC = () => {
  const [logs, setLogs] = useState<UpdateLogDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<Filters>({ pageNum: 1, pageSize: 10 });

  // 创建/编辑
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    submitting: boolean;
    id?: string;
    form: { version: string; title: string; description: string; isImportant: boolean; changeDetails: ChangeDetailDTO[] };
  }>({ open: false, mode: 'create', submitting: false, form: { version: '', title: '', description: '', isImportant: false, changeDetails: [] } });

  // 删除
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: UpdateLogDTO }>({ open: false });
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const loadLogs = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const req: AdminUpdateLogQueryRequest = {
        pageNum: pageNum ?? filters.pageNum,
        pageSize: pageSize ?? filters.pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.version && { version: filters.version }),
        ...(filters.title && { title: filters.title })
      };
      const res: PageResponse<UpdateLogDTO> = await UpdateLogService.getUpdateLogs(req);
      setLogs(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载更新日志失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters.pageNum, filters.pageSize, filters.status, filters.version, filters.title]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handlePageChange = (p: number) => setFilters(prev => ({ ...prev, pageNum: p }));
  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10 });
  const handleRefresh = () => loadLogs(pagination.current, pagination.size);
  const handleQuery = () => {
    setFilters(prev => ({ ...prev, pageNum: 1 }));
    loadLogs(1, pagination.size);
  };

  const openCreate = () => setEditDialog({ open: true, mode: 'create', submitting: false, form: { version: '', title: '', description: '', isImportant: false, changeDetails: [] } });
  const openEdit = (item: UpdateLogDTO) => {
    // 优先使用 changes 字段，兼容 changeDetails
    const changeDetails = item.changes || item.changeDetails || [];
    setEditDialog({
      open: true,
      mode: 'edit',
      id: item.id,
      submitting: false,
      form: {
        version: item.version,
        title: item.title,
        description: item.description,
        isImportant: item.isImportant || false,
        changeDetails
      }
    });
  };

  const addChange = () => setEditDialog(prev => ({ ...prev, form: { ...prev.form, changeDetails: [...prev.form.changeDetails, { type: 'FEATURE' as ChangeType, title: '', description: '' }] } }));
  const updateChange = (index: number, patch: Partial<ChangeDetailDTO>) => setEditDialog(prev => {
    const next = [...prev.form.changeDetails];
    next[index] = { ...next[index], ...patch } as ChangeDetailDTO;
    return { ...prev, form: { ...prev.form, changeDetails: next } };
  });
  const removeChange = (index: number) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, changeDetails: prev.form.changeDetails.filter((_, i) => i !== index) } }));

  const submitEdit = async () => {
    const { mode, id, form } = editDialog;

    // 基础校验
    if (!form.version.trim()) {
      showToast.error('请输入版本号');
      return;
    }
    if (!form.title.trim()) {
      showToast.error('请输入更新标题');
      return;
    }
    if (!form.description.trim()) {
      showToast.error('请输入更新描述');
      return;
    }
    if (!form.changeDetails || form.changeDetails.length === 0) {
      showToast.error('请至少添加一项变更明细');
      return;
    }

    // 检查变更明细的完整性
    const invalidChanges = form.changeDetails.filter(cd => !cd.title?.trim() || !cd.description?.trim());
    if (invalidChanges.length > 0) {
      showToast.error('变更明细的标题和描述不能为空');
      return;
    }

    const payload: CreateUpdateLogRequest | UpdateUpdateLogRequest = {
      version: form.version.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      isImportant: form.isImportant,
      changeDetails: form.changeDetails.map(cd => ({
        type: cd.type,
        title: cd.title.trim(),
        description: cd.description.trim()
      })),
    };

    try {
      setEditDialog(prev => ({ ...prev, submitting: true }));

      if (mode === 'create') {
        await UpdateLogService.createUpdateLog(payload as CreateUpdateLogRequest);
      } else if (id) {
        await UpdateLogService.updateUpdateLog(id, payload as UpdateUpdateLogRequest);
      }

      setEditDialog({
        open: false,
        mode: 'create',
        submitting: false,
        form: { version: '', title: '', description: '', isImportant: false, changeDetails: [] }
      });
      await loadLogs();
    } catch (error) {
      console.error('保存更新日志失败', error);
      setEditDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const toggleStatus = async (item: UpdateLogDTO) => {
    try {
      await UpdateLogService.toggleUpdateLogStatus(item.id);
      const action = item.status === 'PUBLISHED' ? '撤回' : '发布';
      await loadLogs();
    } catch (error) {
      console.error('切换状态失败', error);
    }
  };

  const confirmDelete = (item: UpdateLogDTO) => setDeleteDialog({ open: true, item });
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await UpdateLogService.deleteUpdateLog(deleteDialog.item.id);
      setDeleteDialog({ open: false });
      await loadLogs();
    } catch (error) {
      console.error('删除更新日志失败', error);
    }
  };

  const statusBadge = (status: UpdateLogStatus) => <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>{status === 'PUBLISHED' ? '已发布' : '草稿'}</Badge>;

  return (
    <div className="h-full flex flex-col">
      {/* 顶部标题删除，根据要求合并到筛选区 */}
      {/* 统一布局：单卡片包含筛选、表格、分页 */}
      <Card>
        <CardContent className="pt-6">
          {/* 顶部筛选和操作区域 */}
          <div className="flex-shrink-0">
            {/* 筛选行：placeholder，无标签，统一栅格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : (v as UpdateLogStatus) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="PUBLISHED">已发布</SelectItem>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="版本号（如 1.2.3）"
                value={filters.version || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, version: e.target.value }))}
              />
              <Input
                placeholder="标题关键词"
                value={filters.title || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* 操作按钮行：左侧新建，右侧重置/刷新/查询 */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> 新建更新</Button>
              </div>
              <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* 表格区域：内容自适应，不铺满；横向滚动放在外层容器，避免移动端拖动受限 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">版本</TableHead>
                    <TableHead className="min-w-[220px]">标题</TableHead>
                    <TableHead className="min-w-[100px]">状态</TableHead>
                    <TableHead className="min-w-[100px]">重要</TableHead>
                    <TableHead className="min-w-[160px]">发布时间</TableHead>
                    <TableHead className="min-w-[160px]">更新时间</TableHead>
                    <TableHead className="text-right min-w-[220px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-[120px]" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    logs.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.version}</TableCell>
                        <TableCell className="line-clamp-1" title={item.title}>{item.title}</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell>{item.isImportant ? <Badge variant="destructive">是</Badge> : <Badge variant="secondary">否</Badge>}</TableCell>
                        <TableCell className="text-xs">{item.publishTime ? new Date(item.publishTime).toLocaleString('zh-CN') : '-'}</TableCell>
                        <TableCell className="text-xs">{new Date(item.updateTime).toLocaleString('zh-CN')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4 mr-2" /> 编辑</Button>
                            <Button variant="outline" size="sm" onClick={() => toggleStatus(item)}>
                              {item.status === 'PUBLISHED' ? (<><ArrowDownToLine className="w-4 h-4 mr-2" /> 撤回</>) : (<><ArrowUpToLine className="w-4 h-4 mr-2" /> 发布</>)}
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => confirmDelete(item)}><Trash2 className="w-4 h-4 mr-2" /> 删除</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>

          {/* 分页：始终展示统计信息；页数>1 时展示按钮 */}
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页
              </div>
              {pagination.pages > 1 && (
                <AdminPagination
                  current={pagination.current}
                  totalPages={pagination.pages}
                  onChange={(p) => { handlePageChange(p); loadLogs(p, pagination.size); }}
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
            <AlertDialogDescription>删除后不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 创建/编辑对话框 */}
      <Dialog open={editDialog.open} onOpenChange={(open) => {
        if (!editDialog.submitting && !open) {
          setEditDialog(prev => ({ ...prev, open }));
          if (!open) setEditDialog({ open: false, mode: 'create', submitting: false, form: { version: '', title: '', description: '', isImportant: false, changeDetails: [] } });
        }
      }}>
        <DialogContent
          className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-4xl max-h-[90vh] flex flex-col"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editDialog.mode === 'create' ? '新建更新' : '编辑更新'}</DialogTitle>
            <DialogDescription>填写版本、标题、描述与变更明细</DialogDescription>
          </DialogHeader>

          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>版本</Label>
                <Input value={editDialog.form.version} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, version: e.target.value } }))} placeholder="如 1.2.3" />
              </div>
              <div className="space-y-2">
                <Label>重要更新</Label>
                <div className="h-10 flex items-center gap-3 px-2 border rounded-md">
                  <Switch checked={editDialog.form.isImportant} onCheckedChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, isImportant: !!v } }))} />
                  <span className="text-sm text-muted-foreground">标记为重要</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>标题</Label>
                <Input value={editDialog.form.title} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, title: e.target.value } }))} placeholder="更新标题" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>描述（Markdown）</Label>
                <MarkdownEditor
                  ref={editorRef}
                  value={editDialog.form.description}
                  onChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, description: v } }))}
                  height={200}
                  onOpenResourcePicker={() => setShowResourcePicker(true)}
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>变更明细</Label>
                  <Button variant="secondary" size="sm" onClick={addChange}>
                    <Plus className="w-4 h-4 mr-2" /> 添加一项
                  </Button>
                </div>

                {editDialog.form.changeDetails.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                    暂无变更项，请点击上方按钮添加
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {/* 表格头 */}
                    <div className="bg-gray-50 border-b grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
                      <div className="col-span-2">类型</div>
                      <div className="col-span-4">标题</div>
                      <div className="col-span-5">描述</div>
                      <div className="col-span-1 text-center">操作</div>
                    </div>

                    {/* 变更列表 */}
                    <div className="max-h-60 overflow-y-auto">
                      {editDialog.form.changeDetails.map((cd, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                          <div className="col-span-2">
                            <Select value={cd.type} onValueChange={(v) => updateChange(idx, { type: v as ChangeType })}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="类型" />
                              </SelectTrigger>
                              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                                <SelectItem value="FEATURE">功能</SelectItem>
                                <SelectItem value="IMPROVEMENT">改进</SelectItem>
                                <SelectItem value="BUGFIX">修复</SelectItem>
                                <SelectItem value="BREAKING">兼容性变更</SelectItem>
                                <SelectItem value="SECURITY">安全</SelectItem>
                                <SelectItem value="OTHER">其他</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-4">
                            <Input
                              value={cd.title}
                              onChange={(e) => updateChange(idx, { title: e.target.value })}
                              placeholder="变更标题"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-5">
                            <Input
                              value={cd.description}
                              onChange={(e) => updateChange(idx, { description: e.target.value })}
                              placeholder="简要描述"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeChange(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, mode: 'create', submitting: false, form: { version: '', title: '', description: '', isImportant: false, changeDetails: [] } })} disabled={editDialog.submitting}>取消</Button>
            <Button onClick={submitEdit} disabled={editDialog.submitting}>{editDialog.submitting ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ResourcePicker
        open={showResourcePicker}
        onClose={() => setShowResourcePicker(false)}
        onInsert={(snippet) => {
          editorRef.current?.insertMarkdown(snippet);
          setShowResourcePicker(false);
        }}
      />
    </div>
  );
};
