import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Plus, Trash2, Copy } from 'lucide-react';

import { CDKService } from '@shared/services/api/cdk.service';
import AdminPagination from '@shared/components/AdminPagination';
import { SubscriptionPlanCoursesService } from '@shared/services/api/subscription-plan-courses.service';
import type {
  CDKDTO,
  CDKQueryRequest,
  CreateCDKRequest,
  CDKType,
  CDKStatus,
  PageResponse,
  SimpleSubscriptionPlanDTO,
  SimpleCourseDTO,
} from '@shared/types';
import { toast } from 'react-hot-toast';

type FilterState = {
  pageNum: number;
  pageSize: number;
  cdkType?: CDKType;
  status?: CDKStatus;
  targetId?: string;
};

export const CDKPage: React.FC = () => {
  // 列表 & 分页
  const [cdks, setCdks] = useState<CDKDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<FilterState>({ pageNum: 1, pageSize: 10 });

  // 目标选项（根据类型动态加载）
  const [planOptions, setPlanOptions] = useState<SimpleSubscriptionPlanDTO[]>([]);
  const [courseOptions, setCourseOptions] = useState<SimpleCourseDTO[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  // 创建对话框
  const [createDialog, setCreateDialog] = useState<{
    open: boolean;
    submitting: boolean;
    cdkType: CDKType | '';
    targetId: string;
    quantity: string;
    result?: CDKDTO[];
    copyingBatch?: boolean;
  }>({ open: false, submitting: false, cdkType: '', targetId: '', quantity: '1' });

  const loadTargets = useCallback(async (type: CDKType) => {
    try {
      setTargetsLoading(true);
      if (type === 'SUBSCRIPTION_PLAN') {
        const plans = await SubscriptionPlanCoursesService.getSimpleSubscriptionPlans();
        setPlanOptions(plans);
      } else if (type === 'COURSE') {
        const courses = await SubscriptionPlanCoursesService.getSimpleCourses();
        setCourseOptions(courses);
      }
    } catch (e) {
      console.error('加载目标选项失败', e);
    } finally {
      setTargetsLoading(false);
    }
  }, []);

  const loadCdks = useCallback(async () => {
    try {
      setLoading(true);
      const req: CDKQueryRequest = {
        pageNum: filters.pageNum,
        pageSize: filters.pageSize,
        ...(filters.cdkType && { cdkType: filters.cdkType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.targetId && { targetId: filters.targetId }),
      };
      const res: PageResponse<CDKDTO> = await CDKService.getPagedCDKs(req);
      setCdks(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载CDK失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCdks();
  }, [filters.pageNum, filters.pageSize, filters.cdkType, filters.status, filters.targetId, loadCdks]);

  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10 });
  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, pageNum: page }));

  // 删除
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: CDKDTO }>({ open: false });
  const confirmDelete = (item: CDKDTO) => setDeleteDialog({ open: true, item });
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await CDKService.deleteCDK(deleteDialog.item.id);
      setDeleteDialog({ open: false });
      await loadCdks();
    } catch (e) {
      console.error('删除CDK失败', e);
    }
  };

  // 创建
  const openCreate = () => {
    setCreateDialog({ open: true, submitting: false, cdkType: '', targetId: '', quantity: '1', result: undefined });
  };
  const submitCreate = async () => {
    const { cdkType, targetId, quantity } = createDialog;
    if (!cdkType) return toast.error('请选择CDK类型');
    if (!targetId) return toast.error('请选择绑定目标');
    const qty = parseInt(quantity || '0', 10);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) return toast.error('数量取值范围 1-100');

    const payload: CreateCDKRequest = { cdkType, targetId, quantity: qty };
    try {
      setCreateDialog(prev => ({ ...prev, submitting: true }));
      const created = await CDKService.createCDK(payload);
      setCreateDialog(prev => ({ ...prev, submitting: false, result: created }));
      toast.success(`成功生成 ${created.length} 个CDK`);
      await loadCdks();
    } catch (e) {
      console.error('创建CDK失败', e);
      setCreateDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const copyCodes = async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const statusBadge = (status: CDKStatus) => {
    const variant = status === 'ACTIVE' ? 'default' : status === 'USED' ? 'secondary' : 'secondary';
    const text = status === 'ACTIVE' ? '可用' : status === 'USED' ? '已使用' : '已禁用';
    return <Badge variant={variant as any}>{text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">CDK管理</h1>
          <p className="text-muted-foreground mt-1">管理系统激活码与绑定对象</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> 生成CDK
        </Button>
      </div>

      {/* 筛选区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            筛选
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>类型</Label>
              <Select
                value={filters.cdkType || 'all'}
                onValueChange={(v) => {
                  const type = v === 'all' ? undefined : (v as CDKType);
                  setFilters(prev => ({ ...prev, cdkType: type, targetId: undefined, pageNum: 1 }));
                  if (v !== 'all') loadTargets(v as CDKType);
                }}
              >
                <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="SUBSCRIPTION_PLAN">套餐</SelectItem>
                  <SelectItem value="COURSE">课程</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>目标</Label>
              <Select
                value={filters.targetId || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, targetId: v === 'all' ? undefined : v, pageNum: 1 }))}
                disabled={!filters.cdkType}
              >
                <SelectTrigger><SelectValue placeholder={filters.cdkType ? '选择目标' : '先选择类型'} /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  {(filters.cdkType === 'SUBSCRIPTION_PLAN' ? planOptions : courseOptions).map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {'name' in opt ? `${opt.name}（Lv.${(opt as SimpleSubscriptionPlanDTO).level}）` : (opt as SimpleCourseDTO).title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>状态</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : (v as CDKStatus), pageNum: 1 }))}
              >
                <SelectTrigger><SelectValue placeholder="选择状态" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="ACTIVE">可用</SelectItem>
                  <SelectItem value="USED">已使用</SelectItem>
                  <SelectItem value="DISABLED">已禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" /> 重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CDK列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">兑换码</TableHead>
                  <TableHead className="min-w-[80px]">类型</TableHead>
                  <TableHead className="min-w-[160px]">目标</TableHead>
                  <TableHead className="min-w-[100px]">状态</TableHead>
                  <TableHead className="min-w-[140px]">使用者</TableHead>
                  <TableHead className="min-w-[160px]">使用时间</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="text-right min-w-[140px]">操作</TableHead>
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
                ) : cdks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  cdks.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell>{item.cdkType === 'SUBSCRIPTION_PLAN' ? '套餐' : '课程'}</TableCell>
                      <TableCell>{item.targetName}</TableCell>
                      <TableCell>{statusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs">{item.usedByUserId || '-'}</TableCell>
                      <TableCell className="text-xs">{item.usedTime ? new Date(item.usedTime).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell className="text-xs">{new Date(item.createTime).toLocaleString('zh-CN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyCodes([item.code])}>
                            <Copy className="w-4 h-4 mr-2" /> 复制
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => confirmDelete(item)}
                            disabled={item.status === 'USED'}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> 删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页（统一使用 AdminPagination 适配 shadcn） */}
          {!loading && pagination.total > 0 && (
            <div className="pt-4">
              <AdminPagination
                current={pagination.current}
                totalPages={pagination.pages}
                total={pagination.total}
                onChange={handlePageChange}
                mode="simple"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后不可恢复，且已使用的CDK不可删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 创建对话框 */}
      <Dialog open={createDialog.open} onOpenChange={(open) => {
        if (!createDialog.submitting) {
          setCreateDialog(prev => ({ open, submitting: false, cdkType: '', targetId: '', quantity: '1', result: undefined }));
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>生成CDK</DialogTitle>
            <DialogDescription>选择类型、绑定目标与数量，支持批量生成（最多100个）。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select
                value={createDialog.cdkType || ''}
                onValueChange={async (v) => {
                  const type = v as CDKType;
                  setCreateDialog(prev => ({ ...prev, cdkType: type, targetId: '' }));
                  await loadTargets(type);
                }}
              >
                <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="SUBSCRIPTION_PLAN">套餐</SelectItem>
                  <SelectItem value="COURSE">课程</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>绑定目标</Label>
              <Select
                disabled={!createDialog.cdkType || targetsLoading}
                value={createDialog.targetId || ''}
                onValueChange={(v) => setCreateDialog(prev => ({ ...prev, targetId: v }))}
              >
                <SelectTrigger><SelectValue placeholder={createDialog.cdkType ? (targetsLoading ? '加载中...' : '选择目标') : '先选择类型'} /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  {(createDialog.cdkType === 'SUBSCRIPTION_PLAN' ? planOptions : courseOptions).map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {'name' in opt ? `${opt.name}（Lv.${(opt as SimpleSubscriptionPlanDTO).level}）` : (opt as SimpleCourseDTO).title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>数量</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={createDialog.quantity}
                onChange={(e) => setCreateDialog(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="1-100"
              />
            </div>
          </div>
          {createDialog.result && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已生成 {createDialog.result.length} 个CDK</span>
                <Button variant="outline" size="sm" onClick={() => copyCodes(createDialog.result!.map(i => i.code))}>
                  <Copy className="w-4 h-4 mr-2" /> 全部复制
                </Button>
              </div>
              <div className="rounded-md border p-3 max-h-40 overflow-auto bg-muted/30">
                <ul className="space-y-1 font-mono text-sm">
                  {createDialog.result.map(it => (
                    <li key={it.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{it.code}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyCodes([it.code])}><Copy className="w-4 h-4" /></Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog({ open: false, submitting: false, cdkType: '', targetId: '', quantity: '1', result: undefined })} disabled={createDialog.submitting}>取消</Button>
            <Button onClick={submitCreate} disabled={createDialog.submitting}>{createDialog.submitting ? '生成中...' : '生成'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
