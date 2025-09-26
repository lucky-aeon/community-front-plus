import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Plus, Pencil, Link2, Trash2, GripVertical, Search, XCircle, ListChecks, ShieldCheck } from 'lucide-react';
import AdminPagination from '@shared/components/AdminPagination';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SubscriptionPlansService } from '@shared/services/api/subscription-plans.service';
import { SubscriptionPlanCoursesService } from '@shared/services/api/subscription-plan-courses.service';
import { SubscriptionPlanMenusService } from '@shared/services/api/subscription-plan-menus.service';
import { SubscriptionPlanPermissionsService } from '@shared/services/api/subscription-plan-permissions.service';
import { Transfer, type TransferItem } from '@/components/ui/transfer';
import type {
  SubscriptionPlanDTO,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlanQueryRequest,
  PageResponse,
  SimpleCourseDTO,
  MenuOptionDTO,
  PermissionOptionDTO,
  UpdateSubscriptionPlanMenusRequest,
  UpdateSubscriptionPlanPermissionsRequest
} from '@shared/types';
import { showToast } from '@shared/utils/toast';

export const SubscriptionPlansPage: React.FC = () => {
  // 列表与分页
  const [plans, setPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [searchParams, setSearchParams] = useState<SubscriptionPlanQueryRequest>({ pageNum: 1, pageSize: 10, name: '', level: undefined });

  // 创建/编辑对话框
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    submitting: boolean;
    planId?: string;
    form: {
      name: string;
      level: string;
      validityMonths: string;
      price: string;
      originalPrice: string;
      recommended: boolean;
      benefits: string[];
    }
  }>({
    open: false,
    mode: 'create',
    submitting: false,
    form: { name: '', level: '', validityMonths: '', price: '', originalPrice: '', recommended: false, benefits: [] }
  });

  // 删除确认
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; plan?: SubscriptionPlanDTO }>({ open: false });

  // 绑定课程对话框
  const [bindDialog, setBindDialog] = useState<{
    open: boolean;
    plan?: SubscriptionPlanDTO;
    loading: boolean;
    saving: boolean;
    items: TransferItem[];
    selected: string[];
  }>({ open: false, loading: false, saving: false, items: [], selected: [] });

  // 绑定菜单对话框
  const [bindMenusDialog, setBindMenusDialog] = useState<{
    open: boolean;
    plan?: SubscriptionPlanDTO;
    loading: boolean;
    saving: boolean;
    items: TransferItem[];
    selected: string[];
  }>({ open: false, loading: false, saving: false, items: [], selected: [] });

  // 绑定权限对话框
  const [bindPermsDialog, setBindPermsDialog] = useState<{
    open: boolean;
    plan?: SubscriptionPlanDTO;
    loading: boolean;
    saving: boolean;
    items: TransferItem[];
    selected: string[];
  }>({ open: false, loading: false, saving: false, items: [], selected: [] });

  // 加载套餐列表
  const loadPlans = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const req = { ...searchParams, pageNum: pageNum ?? searchParams.pageNum, pageSize: pageSize ?? searchParams.pageSize };
      const res: PageResponse<SubscriptionPlanDTO> = await SubscriptionPlansService.getPagedSubscriptionPlans(req);
      setPlans(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载套餐失败', e);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 初次加载 + 依赖变化
  useEffect(() => {
    loadPlans();
  }, [searchParams.pageNum, searchParams.pageSize, searchParams.level, loadPlans]);

  // 名称搜索防抖
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchParams.name && searchParams.name.trim() !== '') {
        loadPlans();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchParams.name, loadPlans]);

  const handleReset = () => {
    setSearchParams({ pageNum: 1, pageSize: 10, name: '', level: undefined });
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, pageNum: page }));
  };
  // 查询/刷新直接在按钮处调用 loadPlans

  // 打开创建对话框
  const openCreateDialog = () => {
    setEditDialog({
      open: true,
      mode: 'create',
      submitting: false,
      form: { name: '', level: '', validityMonths: '', price: '', originalPrice: '', recommended: false, benefits: [] }
    });
  };

  // 打开编辑对话框
  const openEditDialog = (plan: SubscriptionPlanDTO) => {
    setEditDialog({
      open: true,
      mode: 'edit',
      planId: plan.id,
      submitting: false,
      form: {
        name: plan.name,
        level: String(plan.level),
        validityMonths: String(plan.validityMonths),
        price: String(plan.price),
        originalPrice: plan.originalPrice !== undefined && plan.originalPrice !== null ? String(plan.originalPrice) : '',
        recommended: Boolean(plan.recommended),
        benefits: [...plan.benefits]
      }
    });
  };

  // 提交创建/编辑
  const handleSubmitPlan = async () => {
    const { mode, planId, form } = editDialog;
    // 校验
    const level = parseInt(form.level, 10);
    const validityMonths = parseInt(form.validityMonths, 10);
    const price = Number(form.price);
    const originalPrice = form.originalPrice.trim() === '' ? undefined : Number(form.originalPrice);
    if (!form.name || form.name.trim().length < 2) return showToast.error('套餐名称至少2个字符');
    if (!Number.isInteger(level) || level <= 0) return showToast.error('套餐级别必须为正整数');
    if (!Number.isInteger(validityMonths) || validityMonths <= 0) return showToast.error('有效期必须为正整数');
    if (!Number.isFinite(price) || price < 0) return showToast.error('价格必须为非负数');
    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice < 0)) return showToast.error('原价不能为负数');
    if (originalPrice !== undefined && originalPrice < price) return showToast.error('原价不能低于售价');
    if (!form.benefits || form.benefits.length === 0) return showToast.error('至少添加1个套餐权益');

    const payload: CreateSubscriptionPlanRequest | UpdateSubscriptionPlanRequest = {
      name: form.name.trim(),
      level,
      validityMonths,
      price,
      originalPrice,
      recommended: form.recommended,
      benefits: form.benefits
    };

    try {
      setEditDialog(prev => ({ ...prev, submitting: true }));
      if (mode === 'create') {
        await SubscriptionPlansService.createSubscriptionPlan(payload as CreateSubscriptionPlanRequest);
      } else if (planId) {
        await SubscriptionPlansService.updateSubscriptionPlan(planId, payload as UpdateSubscriptionPlanRequest);
      }
      setEditDialog({ open: false, mode: 'create', submitting: false, form: { name: '', level: '', validityMonths: '', price: '', originalPrice: '', recommended: false, benefits: [] } });
      await loadPlans();
    } catch (e) {
      console.error('保存套餐失败', e);
      setEditDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // 打开删除确认
  const openDeleteConfirm = (plan: SubscriptionPlanDTO) => setDeleteDialog({ open: true, plan });

  // 删除套餐
  const handleDeletePlan = async () => {
    if (!deleteDialog.plan) return;
    try {
      await SubscriptionPlansService.deleteSubscriptionPlan(deleteDialog.plan.id);
      setDeleteDialog({ open: false });
      await loadPlans();
    } catch (e) {
      console.error('删除套餐失败', e);
    }
  };

  // 绑定课程
  const openBindCoursesDialog = async (plan: SubscriptionPlanDTO) => {
    try {
      setBindDialog({ open: true, plan, loading: true, saving: false, items: [], selected: [] });
      const [allCourses, selectedIds] = await Promise.all<[
        SimpleCourseDTO[],
        string[]
      ]>([
        SubscriptionPlanCoursesService.getSimpleCourses(),
        SubscriptionPlanCoursesService.getSubscriptionPlanCourseIds(plan.id)
      ]);
      const items: TransferItem[] = allCourses.map(c => ({ key: c.id, label: c.title }));
      setBindDialog({ open: true, plan, loading: false, saving: false, items, selected: selectedIds });
    } catch (e) {
      console.error('加载课程绑定数据失败', e);
      setBindDialog({ open: false, loading: false, saving: false, items: [], selected: [] });
    }
  };

  const handleSaveBindCourses = async () => {
    if (!bindDialog.plan) return;
    try {
      setBindDialog(prev => ({ ...prev, saving: true }));
      await SubscriptionPlanCoursesService.updateSubscriptionPlanCourses(bindDialog.plan.id, { courseIds: bindDialog.selected });
      setBindDialog({ open: false, loading: false, saving: false, plan: undefined, items: [], selected: [] });
      showToast.success('已更新套餐课程绑定');
    } catch (e) {
      console.error('更新绑定失败', e);
      setBindDialog(prev => ({ ...prev, saving: false }));
    }
  };

  // 绑定菜单
  const openBindMenusDialog = async (plan: SubscriptionPlanDTO) => {
    try {
      setBindMenusDialog({ open: true, plan, loading: true, saving: false, items: [], selected: [] });
      const [options, selectedCodes] = await Promise.all<[
        MenuOptionDTO[],
        string[]
      ]>([
        SubscriptionPlanMenusService.getMenuOptions(),
        SubscriptionPlanMenusService.getSubscriptionPlanMenuCodes(plan.id)
      ]);
      const items: TransferItem[] = options.map(o => ({ key: o.code, label: `${o.label}` }));
      setBindMenusDialog({ open: true, plan, loading: false, saving: false, items, selected: selectedCodes });
    } catch (e) {
      console.error('加载菜单绑定数据失败', e);
      setBindMenusDialog({ open: false, loading: false, saving: false, items: [], selected: [] });
    }
  };

  const handleSaveBindMenus = async () => {
    if (!bindMenusDialog.plan) return;
    try {
      setBindMenusDialog(prev => ({ ...prev, saving: true }));
      const payload: UpdateSubscriptionPlanMenusRequest = { menus: bindMenusDialog.selected };
      await SubscriptionPlanMenusService.updateSubscriptionPlanMenus(bindMenusDialog.plan.id, payload);
      setBindMenusDialog({ open: false, loading: false, saving: false, plan: undefined, items: [], selected: [] });
    } catch (e) {
      console.error('更新菜单绑定失败', e);
      setBindMenusDialog(prev => ({ ...prev, saving: false }));
    }
  };

  // 绑定权限
  const openBindPermissionsDialog = async (plan: SubscriptionPlanDTO) => {
    try {
      setBindPermsDialog({ open: true, plan, loading: true, saving: false, items: [], selected: [] });
      const [options, selectedCodes] = await Promise.all<[
        PermissionOptionDTO[],
        string[]
      ]>([
        SubscriptionPlanPermissionsService.getPermissionOptions(),
        SubscriptionPlanPermissionsService.getSubscriptionPlanPermissionCodes(plan.id)
      ]);
      const items: TransferItem[] = options.map(o => ({ key: o.code, label: `${o.label}` }));
      setBindPermsDialog({ open: true, plan, loading: false, saving: false, items, selected: selectedCodes });
    } catch (e) {
      console.error('加载权限绑定数据失败', e);
      setBindPermsDialog({ open: false, loading: false, saving: false, items: [], selected: [] });
    }
  };

  const handleSaveBindPermissions = async () => {
    if (!bindPermsDialog.plan) return;
    try {
      setBindPermsDialog(prev => ({ ...prev, saving: true }));
      const payload: UpdateSubscriptionPlanPermissionsRequest = { permissions: bindPermsDialog.selected };
      await SubscriptionPlanPermissionsService.updateSubscriptionPlanPermissions(bindPermsDialog.plan.id, payload);
      setBindPermsDialog({ open: false, loading: false, saving: false, plan: undefined, items: [], selected: [] });
    } catch (e) {
      console.error('更新权限绑定失败', e);
      setBindPermsDialog(prev => ({ ...prev, saving: false }));
    }
  };

  const statusBadge = (status: 'ACTIVE' | 'INACTIVE') => (
    <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
      {status === 'ACTIVE' ? '激活' : '禁用'}
    </Badge>
  );

  const columnsLoadingSkeleton = useMemo(() => (
    Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={idx}>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
      </TableRow>
    ))
  ), []);

  // 本地 Benefits 列表（支持拖拽排序）
  const [benefitDraft, setBenefitDraft] = useState('');
  const addBenefit = () => {
    const v = benefitDraft.trim();
    if (!v) return;
    setEditDialog(prev => ({ ...prev, form: { ...prev.form, benefits: [...(prev.form.benefits || []), v] } }));
    setBenefitDraft('');
  };
  const removeBenefit = (idx: number) => {
    setEditDialog(prev => ({ ...prev, form: { ...prev.form, benefits: prev.form.benefits.filter((_, i) => i !== idx) } }));
  };
  const updateBenefit = (idx: number, value: string) => {
    setEditDialog(prev => {
      const next = [...prev.form.benefits];
      next[idx] = value;
      return { ...prev, form: { ...prev.form, benefits: next } };
    });
  };
  const onBenefitDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = parseInt(String(active.id).split('-').pop() || '0', 10);
    const to = parseInt(String(over.id).split('-').pop() || '0', 10);
    setEditDialog(prev => {
      const next = arrayMove(prev.form.benefits, from, to);
      return { ...prev, form: { ...prev.form, benefits: next } };
    });
  };

  const SortableBenefitItem: React.FC<{ id: string; index: number; value: string }>
    = ({ id, index, value }) => {
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
      const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
      };
      return (
        <div ref={setNodeRef} style={style}
          className={`flex items-center gap-3 p-2 rounded-md border ${isDragging ? 'shadow ring-2 ring-primary' : ''}`}
        >
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex-shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-md border cursor-grab active:cursor-grabbing"
            aria-label="拖拽排序"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <Input
            value={value}
            onChange={(e) => updateBenefit(index, e.target.value)}
            placeholder="输入套餐权益"
          />
          <Button
            type="button"
            variant="outline"
            className="text-red-600"
            onClick={() => removeBenefit(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    };

  // 课程穿梭框由 src/components/ui/transfer 抽象提供

  return (
    <div className="h-full flex flex-col">
      {/* 筛选 + 操作 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="按名称搜索" value={searchParams.name || ''} onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="按级别筛选（数字）" value={searchParams.level?.toString() || ''} onChange={(e) => setSearchParams(prev => ({ ...prev, level: e.target.value ? Number(e.target.value) : undefined }))} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" /> 新建套餐</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset} disabled={loading}>
                <XCircle className="mr-2 h-4 w-4" /> 重置
              </Button>
              <Button variant="outline" onClick={() => loadPlans(pagination.current, pagination.size)} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" /> 刷新
              </Button>
              <Button onClick={() => { setSearchParams(prev => ({ ...prev, pageNum: 1 })); loadPlans(1, pagination.size); }} disabled={loading}>
                <Search className="mr-2 h-4 w-4" /> 查询
              </Button>
            </div>
          </div>

          {/* 表格区域：内容自适应，不铺满；横向滚动放在外层容器，避免移动端拖动受限 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">套餐名称</TableHead>
                  <TableHead className="min-w-[80px]">级别</TableHead>
                  <TableHead className="min-w-[100px]">有效期(月)</TableHead>
                  <TableHead className="min-w-[100px]">价格</TableHead>
                  <TableHead className="min-w-[100px]">原价</TableHead>
                  <TableHead className="min-w-[80px]">推荐</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="text-right min-w-[360px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  columnsLoadingSkeleton
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      暂无套餐数据
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map(plan => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">权益：{plan.benefits.join('、')}</div>
                      </TableCell>
                      <TableCell>{plan.level}</TableCell>
                      <TableCell>{plan.validityMonths}</TableCell>
                      <TableCell>¥{plan.price.toFixed(2)}</TableCell>
                      <TableCell>{plan.originalPrice !== undefined ? `¥${plan.originalPrice.toFixed(2)}` : '—'}</TableCell>
                      <TableCell>{plan.recommended ? <Badge>推荐</Badge> : '否'}</TableCell>
                      <TableCell>{statusBadge(plan.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => openBindCoursesDialog(plan)}>
                            <Link2 className="w-4 h-4 mr-2" /> 绑定课程
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openBindMenusDialog(plan)}>
                            <ListChecks className="w-4 h-4 mr-2" /> 绑定菜单
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openBindPermissionsDialog(plan)}>
                            <ShieldCheck className="w-4 h-4 mr-2" /> 绑定权限
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)}>
                            <Pencil className="w-4 h-4 mr-2" /> 编辑
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => openDeleteConfirm(plan)}>
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
                  onChange={(p) => { handlePageChange(p); loadPlans(p, pagination.size); }}
                  mode="full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={editDialog.open} onOpenChange={(open) => {
        if (!editDialog.submitting) {
          setEditDialog(prev => ({ ...prev, open }));
          if (!open) {
            setEditDialog({ open: false, mode: 'create', submitting: false, form: { name: '', level: '', validityMonths: '', price: '', originalPrice: '', recommended: false, benefits: [] } });
          }
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editDialog.mode === 'create' ? '新建套餐' : '编辑套餐'}</DialogTitle>
            <DialogDescription>填写套餐基础信息和权益</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planName">名称</Label>
              <Input id="planName" value={editDialog.form.name} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, name: e.target.value } }))} placeholder="如：专业版" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planLevel">级别</Label>
              <Input id="planLevel" type="number" min={1} value={editDialog.form.level} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, level: e.target.value } }))} placeholder="正整数" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planValidity">有效期(月)</Label>
              <Input id="planValidity" type="number" min={1} value={editDialog.form.validityMonths} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, validityMonths: e.target.value } }))} placeholder="正整数" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planPrice">价格(¥)</Label>
              <Input id="planPrice" type="number" min={0} step="0.01" value={editDialog.form.price} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, price: e.target.value } }))} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planOriginalPrice">原价(¥)</Label>
              <Input id="planOriginalPrice" type="number" min={0} step="0.01" value={editDialog.form.originalPrice} onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, originalPrice: e.target.value } }))} placeholder="可选，0.00" />
            </div>
            <div className="space-y-2 flex items-center gap-3">
              <Label htmlFor="planRecommended" className="mb-0">是否推荐</Label>
              <Switch id="planRecommended" checked={editDialog.form.recommended} onCheckedChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, recommended: v } }))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>套餐权益</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={benefitDraft}
                  onChange={(e) => setBenefitDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                  placeholder="输入权益，回车添加；如：访问全部课程"
                />
                <Button variant="secondary" type="button" onClick={addBenefit}>添加</Button>
              </div>
              <div className="space-y-2">
                <DndContext onDragEnd={onBenefitDragEnd}>
                  <SortableContext
                    // 以当前位置索引生成 id，格式 benefit-0, benefit-1 ...
                    items={editDialog.form.benefits.map((_, idx) => `benefit-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {editDialog.form.benefits.length === 0 ? (
                      <div className="text-sm text-muted-foreground">暂无权益，请添加</div>
                    ) : (
                      editDialog.form.benefits.map((b, i) => (
                        <SortableBenefitItem key={`benefit-${i}`} id={`benefit-${i}`} index={i} value={b} />
                      ))
                    )}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, mode: 'create', submitting: false, form: { name: '', level: '', validityMonths: '', price: '', originalPrice: '', recommended: false, benefits: [] } })} disabled={editDialog.submitting}>取消</Button>
            <Button onClick={handleSubmitPlan} disabled={editDialog.submitting}>{editDialog.submitting ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              将删除套餐 "{deleteDialog.plan?.name}"，该操作为软删除，可在后端恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeletePlan}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 绑定课程对话框 */}
      <Dialog open={bindDialog.open} onOpenChange={(open) => {
        if (!bindDialog.saving) {
          setBindDialog(prev => ({ ...prev, open }));
          if (!open) setBindDialog({ open: false, loading: false, saving: false, items: [], selected: [] });
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-4xl">
          <DialogHeader>
            <DialogTitle>绑定课程 - {bindDialog.plan?.name}</DialogTitle>
            <DialogDescription>从左侧选择课程并移动到右侧以绑定到该套餐</DialogDescription>
          </DialogHeader>
          {bindDialog.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Transfer
                dataSource={bindDialog.items}
                targetKeys={bindDialog.selected}
                onChange={(next) => setBindDialog(prev => ({ ...prev, selected: next }))}
                height={360}
                titles={["所有课程", "已绑定课程"]}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindDialog({ open: false, loading: false, saving: false, items: [], selected: [] })} disabled={bindDialog.saving}>取消</Button>
            <Button onClick={handleSaveBindCourses} disabled={bindDialog.saving || bindDialog.loading}>{bindDialog.saving ? '保存中...' : '保存绑定'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 绑定菜单对话框 */}
      <Dialog open={bindMenusDialog.open} onOpenChange={(open) => {
        if (!bindMenusDialog.saving) {
          setBindMenusDialog(prev => ({ ...prev, open }));
          if (!open) setBindMenusDialog({ open: false, loading: false, saving: false, items: [], selected: [] });
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-4xl">
          <DialogHeader>
            <DialogTitle>绑定菜单 - {bindMenusDialog.plan?.name}</DialogTitle>
            <DialogDescription>从左侧选择菜单并移动到右侧以绑定到该套餐</DialogDescription>
          </DialogHeader>
          {bindMenusDialog.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Transfer
                dataSource={bindMenusDialog.items}
                targetKeys={bindMenusDialog.selected}
                onChange={(next) => setBindMenusDialog(prev => ({ ...prev, selected: next }))}
                height={360}
                titles={["所有菜单", "已绑定菜单"]}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindMenusDialog({ open: false, loading: false, saving: false, items: [], selected: [] })} disabled={bindMenusDialog.saving}>取消</Button>
            <Button onClick={handleSaveBindMenus} disabled={bindMenusDialog.saving || bindMenusDialog.loading}>{bindMenusDialog.saving ? '保存中...' : '保存绑定'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 绑定权限对话框 */}
      <Dialog open={bindPermsDialog.open} onOpenChange={(open) => {
        if (!bindPermsDialog.saving) {
          setBindPermsDialog(prev => ({ ...prev, open }));
          if (!open) setBindPermsDialog({ open: false, loading: false, saving: false, items: [], selected: [] });
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-4xl">
          <DialogHeader>
            <DialogTitle>绑定权限 - {bindPermsDialog.plan?.name}</DialogTitle>
            <DialogDescription>从左侧选择权限并移动到右侧以绑定到该套餐</DialogDescription>
          </DialogHeader>
          {bindPermsDialog.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Transfer
                dataSource={bindPermsDialog.items}
                targetKeys={bindPermsDialog.selected}
                onChange={(next) => setBindPermsDialog(prev => ({ ...prev, selected: next }))}
                height={360}
                titles={["所有权限", "已绑定权限"]}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindPermsDialog({ open: false, loading: false, saving: false, items: [], selected: [] })} disabled={bindPermsDialog.saving}>取消</Button>
            <Button onClick={handleSaveBindPermissions} disabled={bindPermsDialog.saving || bindPermsDialog.loading}>{bindPermsDialog.saving ? '保存中...' : '保存绑定'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
