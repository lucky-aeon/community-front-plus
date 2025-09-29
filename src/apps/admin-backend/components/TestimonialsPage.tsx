import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Star, Trash2, ArrowUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { AdminTestimonialService } from '@shared/services/api/admin-testimonial.service';
import { AdminTestimonialDTO, QueryTestimonialRequest, PageResponse, TestimonialStatus } from '@shared/types';
import { showToast } from '@shared/utils/toast';
import AdminPagination from '@shared/components/AdminPagination';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<AdminTestimonialDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
  });

  // 搜索和筛选状态
  const [searchParams, setSearchParams] = useState<QueryTestimonialRequest>({
    pageNum: 1,
    pageSize: 10,
    status: undefined
  });

  // 对话框状态
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    testimonial: AdminTestimonialDTO | null;
    targetStatus: TestimonialStatus | null;
  }>({
    open: false,
    testimonial: null,
    targetStatus: null
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    testimonial: AdminTestimonialDTO | null;
  }>({
    open: false,
    testimonial: null
  });

  const [sortOrderDialog, setSortOrderDialog] = useState<{
    open: boolean;
    testimonial: AdminTestimonialDTO | null;
    newSortOrder: string;
    submitting: boolean;
  }>({
    open: false,
    testimonial: null,
    newSortOrder: '',
    submitting: false
  });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    testimonial: AdminTestimonialDTO | null;
  }>({
    open: false,
    testimonial: null
  });

  // 加载评价数据
  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const response: PageResponse<AdminTestimonialDTO> = await AdminTestimonialService.getAllTestimonials(searchParams);
      setTestimonials(response.records);
      setPagination({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages
      });
    } catch (error) {
      console.error('加载评价数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 页面初始化加载
  useEffect(() => {
    loadTestimonials();
  }, [searchParams.pageNum, searchParams.pageSize, searchParams.status, loadTestimonials]);

  const handleRefresh = () => loadTestimonials();

  // 打开状态修改确认对话框
  const openStatusDialog = (testimonial: AdminTestimonialDTO, targetStatus: TestimonialStatus) => {
    setStatusDialog({ open: true, testimonial, targetStatus });
  };

  // 修改评价状态
  const handleChangeStatus = async () => {
    if (!statusDialog.testimonial || !statusDialog.targetStatus) return;

    try {
      const updatedTestimonial = await AdminTestimonialService.changeTestimonialStatus(
        statusDialog.testimonial.id,
        statusDialog.targetStatus
      );

      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === statusDialog.testimonial?.id ? updatedTestimonial : testimonial
        )
      );

      setStatusDialog({ open: false, testimonial: null, targetStatus: null });
    } catch (error) {
      console.error('修改状态失败:', error);
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (testimonial: AdminTestimonialDTO) => {
    setDeleteDialog({ open: true, testimonial });
  };

  // 删除评价
  const handleDeleteTestimonial = async () => {
    if (!deleteDialog.testimonial) return;

    try {
      await AdminTestimonialService.deleteTestimonial(deleteDialog.testimonial.id);

      setTestimonials(prev =>
        prev.filter(testimonial => testimonial.id !== deleteDialog.testimonial?.id)
      );

      setDeleteDialog({ open: false, testimonial: null });

      // 如果当前页没有数据了，跳转到前一页
      if (testimonials.length === 1 && pagination.current > 1) {
        setSearchParams(prev => ({ ...prev, pageNum: pagination.current - 1 }));
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 打开排序权重设置对话框
  const openSortOrderDialog = (testimonial: AdminTestimonialDTO) => {
    setSortOrderDialog({
      open: true,
      testimonial,
      newSortOrder: testimonial.sortOrder.toString(),
      submitting: false
    });
  };

  // 更新排序权重
  const handleUpdateSortOrder = async () => {
    if (!sortOrderDialog.testimonial) return;

    const newOrder = parseInt(sortOrderDialog.newSortOrder);
    if (isNaN(newOrder) || newOrder < 0) {
      showToast.error('排序权重必须是非负整数');
      return;
    }

    try {
      setSortOrderDialog(prev => ({ ...prev, submitting: true }));
      const updatedTestimonial = await AdminTestimonialService.updateSortOrder(
        sortOrderDialog.testimonial.id,
        newOrder
      );

      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === sortOrderDialog.testimonial?.id ? updatedTestimonial : testimonial
        )
      );

      setSortOrderDialog({
        open: false,
        testimonial: null,
        newSortOrder: '',
        submitting: false
      });
      
    } catch (error) {
      console.error('设置排序权重失败:', error);
      setSortOrderDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // 打开详情对话框
  const openDetailDialog = (testimonial: AdminTestimonialDTO) => {
    setDetailDialog({ open: true, testimonial });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      pageNum: page
    }));
  };

  // 渲染评价状态徽章
  const renderStatusBadge = (status: TestimonialStatus) => {
    const variant = AdminTestimonialService.getStatusVariant(status);
    const description = AdminTestimonialService.getStatusDescription(status);

    return (
      <Badge variant={variant}>
        {description}
      </Badge>
    );
  };

  // 渲染星级评分
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 筛选 + 操作 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 min-w-0">
            <Select
              value={searchParams.status || 'all'}
              onValueChange={(value) => setSearchParams(prev => ({
                ...prev,
                status: value === 'all' ? undefined : (value as TestimonialStatus),
                pageNum: 1
              }))}
            >
              <SelectTrigger><SelectValue placeholder="状态筛选" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">待审核</SelectItem>
                <SelectItem value="APPROVED">已通过</SelectItem>
                <SelectItem value="REJECTED">已拒绝</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
          </div>

          {/* 表格区域 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">用户</TableHead>
                  <TableHead className="min-w-[300px]">评价内容</TableHead>
                  <TableHead className="min-w-[100px]">评分</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[80px]">权重</TableHead>
                  <TableHead className="min-w-[120px]">创建时间</TableHead>
                  <TableHead className="text-right min-w-[200px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // 加载状态骨架屏
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : testimonials.length === 0 ? (
                  // 空数据状态
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      暂无评价数据
                    </TableCell>
                  </TableRow>
                ) : (
                  // 评价数据行
                  testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div className="font-medium">{testimonial.userName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="text-sm line-clamp-2">{testimonial.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 mt-1 text-blue-600 hover:text-blue-800"
                            onClick={() => openDetailDialog(testimonial)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            查看详情
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderRating(testimonial.rating)}
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(testimonial.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{testimonial.sortOrder}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(testimonial.createTime).toLocaleDateString('zh-CN')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {/* 状态操作按钮 */}
                          {testimonial.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusDialog(testimonial, 'APPROVED')}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                通过
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusDialog(testimonial, 'REJECTED')}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                拒绝
                              </Button>
                            </>
                          )}
                          {testimonial.status === 'APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusDialog(testimonial, 'PUBLISHED')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              发布
                            </Button>
                          )}

                          {/* 排序权重设置 */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSortOrderDialog(testimonial)}
                          >
                            <ArrowUp className="w-3 h-3 mr-1" />
                            权重
                          </Button>

                          {/* 删除按钮 */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(testimonial)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页
              </div>
              {pagination.pages > 1 && (
                <AdminPagination
                  current={pagination.current}
                  totalPages={pagination.pages}
                  onChange={handlePageChange}
                  mode="full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态修改确认对话框 */}
      <AlertDialog open={statusDialog.open} onOpenChange={(open) => setStatusDialog({ open, testimonial: null, targetStatus: null })}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认操作</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将评价状态修改为 "{statusDialog.targetStatus ? AdminTestimonialService.getStatusDescription(statusDialog.targetStatus) : ''}" 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeStatus}>
              确认修改
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, testimonial: null })}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 "{deleteDialog.testimonial?.userName}" 的评价吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTestimonial}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 排序权重设置对话框 */}
      <Dialog open={sortOrderDialog.open} onOpenChange={(open) => {
        if (!sortOrderDialog.submitting) {
          setSortOrderDialog({ open, testimonial: null, newSortOrder: '', submitting: false });
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <DialogHeader>
            <DialogTitle>设置排序权重</DialogTitle>
            <DialogDescription>
              为用户 "{sortOrderDialog.testimonial?.userName}" 的评价设置排序权重，数值越大排序越靠前
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序权重</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={sortOrderDialog.newSortOrder}
                onChange={(e) => setSortOrderDialog(prev => ({ ...prev, newSortOrder: e.target.value }))}
                placeholder="请输入权重值"
                disabled={sortOrderDialog.submitting}
              />
              <p className="text-sm text-muted-foreground">
                当前权重: {sortOrderDialog.testimonial?.sortOrder || 0}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSortOrderDialog({ open: false, testimonial: null, newSortOrder: '', submitting: false })}
              disabled={sortOrderDialog.submitting}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateSortOrder}
              disabled={sortOrderDialog.submitting}
            >
              {sortOrderDialog.submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 评价详情对话框 */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, testimonial: null })}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>评价详情</DialogTitle>
          </DialogHeader>
          {detailDialog.testimonial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">用户名称</Label>
                  <p className="font-medium">{detailDialog.testimonial.userName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">评分</Label>
                  <div className="mt-1">
                    {renderRating(detailDialog.testimonial.rating)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">状态</Label>
                  <div className="mt-1">
                    {renderStatusBadge(detailDialog.testimonial.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">排序权重</Label>
                  <p className="font-mono">{detailDialog.testimonial.sortOrder}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">创建时间</Label>
                  <p>{new Date(detailDialog.testimonial.createTime).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">更新时间</Label>
                  <p>{new Date(detailDialog.testimonial.updateTime).toLocaleString('zh-CN')}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">评价内容</Label>
                <Textarea
                  value={detailDialog.testimonial.content}
                  readOnly
                  className="mt-2 min-h-[120px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog({ open: false, testimonial: null })}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
