import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Search, XCircle, Eye, Copy, ShoppingCart, Gift, CreditCard, TrendingUp, Package } from 'lucide-react';
import { AdminOrderService } from '@shared/services/api/admin-order.service';
import { OrderDTO, OrderQueryRequest, OrderStatisticsDTO, PageResponse } from '@shared/types';
import { showToast } from '@shared/utils/toast';
import AdminPagination from '@shared/components/AdminPagination';
import { StatsCard } from '../widgets/StatsCard';
import { OrderDetailDialog } from './OrderDetailDialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<OrderStatisticsDTO | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
  });

  // 搜索和筛选状态
  const [searchParams, setSearchParams] = useState<OrderQueryRequest>({
    pageNum: 1,
    pageSize: 10,
    userId: '',
    orderType: undefined,
    productType: undefined,
    productName: '',
    cdkCode: ''
  });

  // 时间范围选择器状态
  const [timeRange, setTimeRange] = useState<{ from?: Date; to?: Date }>();

  // 订单详情弹窗状态
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    orderId: string | null;
  }>({
    open: false,
    orderId: null
  });

  // 加载订单数据
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = { ...searchParams };
      if (timeRange?.from) {
        queryParams.startTime = format(timeRange.from, 'yyyy-MM-dd 00:00:00');
      }
      if (timeRange?.to) {
        queryParams.endTime = format(timeRange.to, 'yyyy-MM-dd 23:59:59');
      }
      const response: PageResponse<OrderDTO> = await AdminOrderService.getOrders(queryParams);
      setOrders(response.records);
      setPagination({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages
      });
    } catch (error) {
      console.error('加载订单数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, timeRange]);

  // 加载统计数据（支持按需时间筛选）
  const loadStatistics = useCallback(async (needTimeFilter = false) => {
    try {
      setStatsLoading(true);
      const statisticsParams: { startTime?: string; endTime?: string } = {};

      // 只有明确需要时间筛选时才传递时间参数
      if (needTimeFilter && timeRange?.from) {
        statisticsParams.startTime = format(timeRange.from, 'yyyy-MM-dd 00:00:00');
      }
      if (needTimeFilter && timeRange?.to) {
        statisticsParams.endTime = format(timeRange.to, 'yyyy-MM-dd 23:59:59');
      }

      const stats = await AdminOrderService.getOrderStatistics(statisticsParams);
      setStatistics(stats);
    } catch (error) {
      console.error('加载订单统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [timeRange]);

  // 仅在分页变化时加载数据
  useEffect(() => {
    loadOrders();
  }, [searchParams.pageNum, searchParams.pageSize]);

  // 初始化加载数据（统计接口不传时间参数，获取全量统计）
  useEffect(() => {
    loadStatistics(false); // 不需要时间筛选，获取全量统计
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      pageNum: 1,
      pageSize: 10,
      userId: '',
      orderType: undefined,
      productType: undefined,
      productName: '',
      cdkCode: ''
    });
    setTimeRange(undefined);
    loadOrders(); // 重新加载订单
    loadStatistics(false); // 恢复全量统计，不传时间参数
  };

  const handleRefresh = () => {
    loadOrders(); // 总是刷新订单数据

    // 根据当前状态决定是否更新统计
    if (timeRange?.from || timeRange?.to) {
      loadStatistics(true); // 有时间筛选时更新统计
    } else {
      loadStatistics(false); // 无时间筛选时获取全量统计
    }
  };

  const handleQuery = () => {
    setSearchParams(prev => ({ ...prev, pageNum: 1 }));
    loadOrders(); // 总是调用订单接口

    // 只有当选择了时间范围时，才更新统计数据
    if (timeRange?.from || timeRange?.to) {
      loadStatistics(true);
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      pageNum: page
    }));
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success(`已复制${label}`);
    } catch {
      showToast.error('复制失败');
    }
  };

  // 打开订单详情
  const openOrderDetail = (orderId: string) => {
    setDetailDialog({ open: true, orderId });
  };

  // 渲染订单类型徽章
  const renderOrderTypeBadge = (orderType: 'PURCHASE' | 'GIFT') => {
    return (
      <Badge variant={orderType === 'PURCHASE' ? 'default' : 'secondary'} className="flex items-center gap-1">
        {orderType === 'PURCHASE' ? (
          <>
            <CreditCard className="w-3 h-3" />
            购买
          </>
        ) : (
          <>
            <Gift className="w-3 h-3" />
            赠送
          </>
        )}
      </Badge>
    );
  };

  // 渲染产品类型徽章
  const renderProductTypeBadge = (productType: 'SUBSCRIPTION_PLAN' | 'COURSE') => {
    return (
      <Badge variant="outline">
        {productType === 'SUBSCRIPTION_PLAN' ? '套餐' : '课程'}
      </Badge>
    );
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* 统计看板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </Card>
          ))
        ) : statistics ? (
          <>
            <StatsCard
              title="总订单数"
              value={statistics.totalCount}
              icon={ShoppingCart}
              color="blue"
              description="累计订单数量"
            />
            <StatsCard
              title="购买订单"
              value={statistics.purchaseCount}
              icon={CreditCard}
              color="green"
              description="付费购买订单"
            />
            <StatsCard
              title="赠送订单"
              value={statistics.giftCount}
              icon={Gift}
              color="purple"
              description="免费赠送订单"
            />
            <StatsCard
              title="总成交金额"
              value={formatAmount(statistics.totalAmount)}
              icon={TrendingUp}
              color="indigo"
              description="累计收入金额"
            />
          </>
        ) : null}
      </div>

      {/* 筛选 + 操作 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-3 min-w-0">
            <Input
              placeholder="用户ID/用户名"
              value={searchParams.userId || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, userId: e.target.value }))}
            />
            <Input
              placeholder="产品名称"
              value={searchParams.productName || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, productName: e.target.value }))}
            />
            <Input
              placeholder="CDK代码"
              value={searchParams.cdkCode || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, cdkCode: e.target.value }))}
            />
            <Select
              value={searchParams.orderType || 'all'}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, orderType: value === 'all' ? undefined : (value as 'PURCHASE' | 'GIFT') }))}
            >
              <SelectTrigger><SelectValue placeholder="订单类型" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="PURCHASE">购买订单</SelectItem>
                <SelectItem value="GIFT">赠送订单</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={searchParams.productType || 'all'}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, productType: value === 'all' ? undefined : (value as 'SUBSCRIPTION_PLAN' | 'COURSE') }))}
            >
              <SelectTrigger><SelectValue placeholder="产品类型" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部产品</SelectItem>
                <SelectItem value="SUBSCRIPTION_PLAN">套餐</SelectItem>
                <SelectItem value="COURSE">课程</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 时间范围筛选 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <DateRangePicker
              value={timeRange}
              onChange={setTimeRange}
              placeholder="选择时间范围"
            />
          </div>

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

          {/* 表格区域 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">订单号</TableHead>
                  <TableHead className="min-w-[140px]">用户信息</TableHead>
                  <TableHead className="min-w-[180px]">产品信息</TableHead>
                  <TableHead className="min-w-[100px]">订单类型</TableHead>
                  <TableHead className="min-w-[100px]">金额</TableHead>
                  <TableHead className="min-w-[150px]">CDK代码</TableHead>
                  <TableHead className="min-w-[140px]">激活时间</TableHead>
                  <TableHead className="min-w-[140px]">创建时间</TableHead>
                  <TableHead className="text-right min-w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // 加载状态骨架屏
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  // 空数据状态
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div>暂无订单数据</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // 订单数据行
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{order.orderNo}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.orderNo, '订单号')}
                            className="h-6 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{order.userName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{order.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {renderProductTypeBadge(order.productType)}
                          </div>
                          <div className="text-sm font-medium">{order.productName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderOrderTypeBadge(order.orderType)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatAmount(order.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{order.cdkCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.cdkCode, 'CDK代码')}
                            className="h-6 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {order.activatedTime ? formatDateTime(order.activatedTime) : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {formatDateTime(order.createTime)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetail(order.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Button>
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
                  onChange={handlePageChange}
                  mode="full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单详情弹窗 */}
      <OrderDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ open, orderId: null })}
        orderId={detailDialog.orderId}
      />
    </div>
  );
};