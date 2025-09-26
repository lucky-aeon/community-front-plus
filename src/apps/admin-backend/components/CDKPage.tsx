import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Plus, Trash2, Copy, Search, XCircle } from 'lucide-react';

import { CDKService } from '@shared/services/api/cdk.service';
import AdminPagination from '@shared/components/AdminPagination';
import { SubscriptionPlanCoursesService } from '@shared/services/api/subscription-plan-courses.service';
import type {
  CDKDTO,
  CDKQueryRequest,
  CreateCDKRequest,
  CDKType,
  CDKStatus,
  CDKAcquisitionType,
  PageResponse,
  SimpleSubscriptionPlanDTO,
  SimpleCourseDTO,
} from '@shared/types';
import { showToast } from '@shared/utils/toast';

type FilterState = {
  pageNum: number;
  pageSize: number;
  cdkType?: CDKType;
  status?: CDKStatus;
  targetId?: string;
  acquisitionType?: CDKAcquisitionType;
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
    acquisitionType: CDKAcquisitionType | '';
    remark: string;
    result?: CDKDTO[];
    copyingBatch?: boolean;
  }>({
    open: false,
    submitting: false,
    cdkType: '',
    targetId: '',
    quantity: '1',
    acquisitionType: 'PURCHASE',
    remark: ''
  });

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

  const loadCdks = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const req: CDKQueryRequest = {
        pageNum: pageNum ?? filters.pageNum,
        pageSize: pageSize ?? filters.pageSize,
        ...(filters.cdkType && { cdkType: filters.cdkType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.targetId && { targetId: filters.targetId }),
        ...(filters.acquisitionType && { acquisitionType: filters.acquisitionType }),
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
  }, [filters.pageNum, filters.pageSize, filters.cdkType, filters.status, filters.targetId, filters.acquisitionType, loadCdks]);

  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10 });
  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, pageNum: page }));
  const handleRefresh = () => loadCdks(pagination.current, pagination.size);
  const handleQuery = () => { setFilters(prev => ({ ...prev, pageNum: 1 })); loadCdks(1, pagination.size); };

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
    setCreateDialog({
      open: true,
      submitting: false,
      cdkType: '',
      targetId: '',
      quantity: '1',
      acquisitionType: 'PURCHASE',
      remark: '',
      result: undefined
    });
  };
  const submitCreate = async () => {
    const { cdkType, targetId, quantity, acquisitionType, remark } = createDialog;

    if (!cdkType) return showToast.error('请选择CDK类型');
    if (!targetId) return showToast.error('请选择绑定目标');
    if (!acquisitionType) return showToast.error('请选择获取方式');

    const qty = parseInt(quantity || '0', 10);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) return showToast.error('数量取值范围 1-100');

    // 备注长度验证
    if (remark && remark.length > 500) return showToast.error('备注长度不能超过500字符');

    const payload: CreateCDKRequest = {
      cdkType,
      targetId,
      quantity: qty,
      acquisitionType,
      ...(remark.trim() && { remark: remark.trim() })
    };

    try {
      setCreateDialog(prev => ({ ...prev, submitting: true }));
      const created = await CDKService.createCDK(payload);
      setCreateDialog(prev => ({ ...prev, submitting: false, result: created }));
      await loadCdks();
    } catch (e) {
      console.error('创建CDK失败', e);
      setCreateDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const copyCodes = async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      showToast.success('已复制到剪贴板');
    } catch {
      showToast.error('复制失败');
    }
  };

  const statusBadge = (status: CDKStatus) => {
    const variant: 'default' | 'secondary' = status === 'ACTIVE' ? 'default' : 'secondary';
    const text = status === 'ACTIVE' ? '可用' : status === 'USED' ? '已使用' : '已禁用';
    return <Badge variant={variant}>{text}</Badge>;
  };

  const acquisitionTypeBadge = (type: CDKAcquisitionType) => {
    const variant: 'default' | 'secondary' = type === 'PURCHASE' ? 'default' : 'secondary';
    const text = type === 'PURCHASE' ? '购买' : '赠送';
    return <Badge variant={variant}>{text}</Badge>;
  };

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          {/* 筛选行 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mb-3 min-w-0">
            <Select
                value={filters.cdkType || 'all'}
                onValueChange={(v) => {
                  const type = v === 'all' ? undefined : (v as CDKType);
                  setFilters(prev => ({ ...prev, cdkType: type, targetId: undefined, pageNum: 1 }));
                  if (v !== 'all') loadTargets(v as CDKType);
                }}
              >
                <SelectTrigger><SelectValue placeholder="类型" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="SUBSCRIPTION_PLAN">套餐</SelectItem>
                  <SelectItem value="COURSE">课程</SelectItem>
                </SelectContent>
              </Select>
            <Select
                value={filters.targetId || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, targetId: v === 'all' ? undefined : v, pageNum: 1 }))}
                disabled={!filters.cdkType}
              >
                <SelectTrigger><SelectValue placeholder={filters.cdkType ? '目标' : '先选择类型'} /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  {(filters.cdkType === 'SUBSCRIPTION_PLAN' ? planOptions : courseOptions).map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {'name' in opt ? `${opt.name}（Lv.${(opt as SimpleSubscriptionPlanDTO).level}）` : (opt as SimpleCourseDTO).title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : (v as CDKStatus), pageNum: 1 }))}
              >
                <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="ACTIVE">可用</SelectItem>
                  <SelectItem value="USED">已使用</SelectItem>
                  <SelectItem value="DISABLED">已禁用</SelectItem>
                </SelectContent>
              </Select>
            <Select
                value={filters.acquisitionType || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, acquisitionType: v === 'all' ? undefined : (v as CDKAcquisitionType), pageNum: 1 }))}
              >
                <SelectTrigger><SelectValue placeholder="获取方式" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="PURCHASE">购买</SelectItem>
                  <SelectItem value="GIFT">赠送</SelectItem>
                </SelectContent>
              </Select>
          </div>
          {/* 操作按钮行：左生成，右重置/刷新/查询 */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> 生成CDK</Button>
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

          {/* 表格区域：内容自适应，不铺满；横向滚动放在外层容器，避免移动端拖动受限 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">兑换码</TableHead>
                  <TableHead className="min-w-[80px]">类型</TableHead>
                  <TableHead className="min-w-[160px]">目标</TableHead>
                  <TableHead className="min-w-[100px]">状态</TableHead>
                  <TableHead className="min-w-[100px]">获取方式</TableHead>
                  <TableHead className="min-w-[140px]">使用者</TableHead>
                  <TableHead className="min-w-[160px]">使用时间</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[120px]">备注</TableHead>
                  <TableHead className="text-right min-w-[140px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : cdks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  cdks.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell>{item.cdkType === 'SUBSCRIPTION_PLAN' ? '套餐' : '课程'}</TableCell>
                      <TableCell>{item.targetName}</TableCell>
                      <TableCell>{statusBadge(item.status)}</TableCell>
                      <TableCell>{acquisitionTypeBadge(item.acquisitionType)}</TableCell>
                      <TableCell className="text-xs">{item.usedByUserId || '-'}</TableCell>
                      <TableCell className="text-xs">{item.usedTime ? new Date(item.usedTime).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell className="text-xs">{new Date(item.createTime).toLocaleString('zh-CN')}</TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate" title={item.remark || ''}>{item.remark || '-'}</TableCell>
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
                  onChange={(p) => { handlePageChange(p); loadCdks(p, pagination.size); }}
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
          setCreateDialog(() => ({
            open,
            submitting: false,
            cdkType: '',
            targetId: '',
            quantity: '1',
            acquisitionType: 'PURCHASE',
            remark: '',
            result: undefined
          }));
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
              <Label>获取方式</Label>
              <Select
                value={createDialog.acquisitionType || ''}
                onValueChange={(v) => setCreateDialog(prev => ({ ...prev, acquisitionType: v as CDKAcquisitionType }))}
              >
                <SelectTrigger><SelectValue placeholder="选择获取方式" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="PURCHASE">购买</SelectItem>
                  <SelectItem value="GIFT">赠送</SelectItem>
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
            <div className="space-y-2 md:col-span-2">
              <Label>备注（可选）</Label>
              <Textarea
                value={createDialog.remark}
                onChange={(e) => setCreateDialog(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="最多500字符"
                maxLength={500}
                rows={3}
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
            <Button variant="outline" onClick={() => setCreateDialog({
              open: false,
              submitting: false,
              cdkType: '',
              targetId: '',
              quantity: '1',
              acquisitionType: 'PURCHASE',
              remark: '',
              result: undefined
            })} disabled={createDialog.submitting}>取消</Button>
            <Button onClick={submitCreate} disabled={createDialog.submitting}>{createDialog.submitting ? '生成中...' : '生成'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
