import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminCodexPersistentService } from '@shared/services/api';
import type { CodexInstanceDTO } from '@shared/types';
import { Loader2, Plus, Edit, Trash2, RefreshCcw, Save } from 'lucide-react';
import { showToast } from '@shared/utils/toast';

// 管理端 Codex：从单实例迁移为多实例列表 + 新建/编辑对话框
export const CodexPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CodexInstanceDTO[]>([]);
  const [query, setQuery] = useState('');

  // 创建/编辑对话框状态
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    submitting: boolean;
    data: CodexInstanceDTO;
  }>({ open: false, mode: 'create', submitting: false, data: { enabled: true } });

  // 删除确认
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; name?: string; submitting?: boolean }>({ open: false });

  const load = async () => {
    setLoading(true);
    try {
      const list = await AdminCodexPersistentService.listInstances();
      setItems(list || []);
    } catch (e) {
      console.error('加载 Codex 实例失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => [it.name, it.id, it.baseUrl].some(v => String(v || '').toLowerCase().includes(q)));
  }, [items, query]);

  const openCreate = () => {
    setFormDialog({ open: true, mode: 'create', submitting: false, data: { enabled: true } });
  };

  const openEdit = (item: CodexInstanceDTO) => {
    setFormDialog({ open: true, mode: 'edit', submitting: false, data: { ...item } });
  };

  const closeForm = () => {
    if (formDialog.submitting) return;
    setFormDialog(prev => ({ ...prev, open: false }));
  };

  const save = async () => {
    const payload = { ...formDialog.data };
    // 本地校验（允许在组件内弹错）
    if (!String(payload.name || '').trim()) {
      showToast.error('请输入实例名称');
      return;
    }
    setFormDialog(prev => ({ ...prev, submitting: true }));
    try {
      if (formDialog.mode === 'create') {
        await AdminCodexPersistentService.createInstance(payload);
      } else if (payload.id) {
        await AdminCodexPersistentService.updateInstance(String(payload.id), payload);
      }
      // 成功提示由 axios 拦截器统一处理（后端已返回 message）
      setFormDialog(prev => ({ ...prev, open: false }));
      await load();
    } catch (e) {
      console.error('保存失败', e);
    } finally {
      setFormDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const confirmDelete = (item: CodexInstanceDTO) => {
    setDeleteDialog({ open: true, id: item.id, name: item.name, submitting: false });
  };

  const doDelete = async () => {
    if (!deleteDialog.id) return;
    setDeleteDialog(prev => ({ ...prev, submitting: true }));
    try {
      await AdminCodexPersistentService.deleteInstance(deleteDialog.id);
      // 成功提示由拦截器统一处理
      setDeleteDialog({ open: false });
      await load();
    } catch (e) {
      console.error('删除失败', e);
    } finally {
      setDeleteDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Codex 实例</h1>
          <div className="text-xs text-muted-foreground">管理多个 Codex 实例，前台可按需选择使用</div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-1" />} 刷新
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> 新建实例
          </Button>
        </div>
      </div>

      {/* 搜索与列表 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <Input
              placeholder="搜索名称、ID、Base URL"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="text-xs text-muted-foreground">共 {items.length} 个</div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table enableVerticalScroll maxHeight="max-h-[60vh]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">名称 / 标识</TableHead>
                  <TableHead className="min-w-[200px]">Base URL</TableHead>
                  <TableHead className="min-w-[120px]">状态</TableHead>
                  <TableHead className="min-w-[160px]">过期时间</TableHead>
                  <TableHead className="min-w-[160px]">最后更新</TableHead>
                  <TableHead className="min-w-[200px]">使用文档</TableHead>
                  <TableHead className="text-right min-w-[160px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">加载中...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((it) => (
                    <TableRow key={it.id || it.name}>
                      <TableCell>
                        <div className="font-medium">{it.name || '-'}</div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate">{it.id || '-'}</div>
                      </TableCell>
                      <TableCell className="truncate max-w-[320px]">{it.baseUrl || '-'}</TableCell>
                      <TableCell>
                        {it.enabled ? (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">已启用</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">已禁用</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{it.expiresAt || '-'}</TableCell>
                      <TableCell className="text-xs">{it.lastUpdatedAt || '-'}</TableCell>
                      <TableCell className="truncate max-w-[260px]">
                        {it.usageDocUrl ? (
                          <a href={it.usageDocUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            {it.usageDocUrl}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button onClick={() => openEdit(it)} variant="ghost" size="sm" title="编辑">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => confirmDelete(it)} variant="ghost" size="sm" title="删除">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 新建/编辑对话框 */}
      <Dialog open={formDialog.open} onOpenChange={(open) => !formDialog.submitting && setFormDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" onEscapeKeyDown={(e) => formDialog.submitting && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{formDialog.mode === 'create' ? '新建 Codex 实例' : '编辑 Codex 实例'}</DialogTitle>
            <DialogDescription>配置基础连接信息与凭证</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">实例名称</Label>
                <Input id="name" placeholder="例如：OpenAI 主帐号" value={formDialog.data.name || ''} onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input id="baseUrl" placeholder="https://api.example.com" value={formDialog.data.baseUrl || ''} onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, baseUrl: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" value={formDialog.data.apiKey || ''} onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, apiKey: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="authorization">Authorization</Label>
                <Input id="authorization" placeholder="Bearer xxx" value={formDialog.data.authorization || ''} onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, authorization: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cookieToken">Cookie Token</Label>
                <Input id="cookieToken" value={formDialog.data.cookieToken || ''} onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, cookieToken: e.target.value } }))} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="usageDocUrl">使用文档 URL</Label>
                <Input id="usageDocUrl" placeholder="https://..." value={formDialog.data.usageDocUrl || ''} onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, usageDocUrl: e.target.value } }))} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>启用</Label>
                <div className="text-xs text-muted-foreground">关闭后，前台不可用此实例</div>
              </div>
              <Switch checked={!!formDialog.data.enabled} onCheckedChange={(v) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, enabled: v } }))} />
            </div>

            {(formDialog.data.expiresAt || formDialog.data.lastUpdatedAt) && (
              <div className="text-xs text-muted-foreground space-x-4">
                {formDialog.data.expiresAt && <span>过期时间：{formDialog.data.expiresAt}</span>}
                {formDialog.data.lastUpdatedAt && <span>最后更新：{formDialog.data.lastUpdatedAt}</span>}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={formDialog.submitting}>取消</Button>
            <Button onClick={save} disabled={formDialog.submitting}>
              {formDialog.submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} 保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              即将删除实例：{deleteDialog.name || deleteDialog.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDialog.submitting}>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={doDelete} disabled={deleteDialog.submitting}>
              {deleteDialog.submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} 删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CodexPage;
