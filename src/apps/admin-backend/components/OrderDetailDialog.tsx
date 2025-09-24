import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Package, User, CreditCard, Gift } from 'lucide-react';
import { AdminOrderService } from '@shared/services/api/admin-order.service';
import { OrderDTO } from '@shared/types';
import { showToast } from '@shared/utils/toast';

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  open,
  onOpenChange,
  orderId
}) => {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载订单详情
  const loadOrderDetail = async (id: string) => {
    try {
      setLoading(true);
      const orderData = await AdminOrderService.getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error('加载订单详情失败:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // 当orderId变化时重新加载
  useEffect(() => {
    if (open && orderId) {
      loadOrderDetail(orderId);
    } else if (!open) {
      setOrder(null);
    }
  }, [open, orderId]);

  // 复制到剪贴板
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success(`已复制${label}`);
    } catch {
      showToast.error('复制失败');
    }
  };

  // 渲染订单类型徽章
  const renderOrderTypeBadge = (orderType: 'PURCHASE' | 'GIFT') => {
    return (
      <Badge variant={orderType === 'PURCHASE' ? 'default' : 'secondary'} className="flex items-center gap-1">
        {orderType === 'PURCHASE' ? (
          <>
            <CreditCard className="w-3 h-3" />
            购买订单
          </>
        ) : (
          <>
            <Gift className="w-3 h-3" />
            赠送订单
          </>
        )}
      </Badge>
    );
  };

  // 渲染产品类型徽章
  const renderProductTypeBadge = (productType: 'SUBSCRIPTION_PLAN' | 'COURSE') => {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Package className="w-3 h-3" />
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            订单详情
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          // 加载状态
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32 col-span-3" />
                </div>
              ))}
            </div>
          </div>
        ) : order ? (
          // 订单详情内容
          <div className="space-y-6">
            {/* 订单基本信息 */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">订单号</div>
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
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">订单类型</div>
                  <div>{renderOrderTypeBadge(order.orderType)}</div>
                </div>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                用户信息
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                <div>
                  <div className="text-sm text-muted-foreground">用户ID</div>
                  <div className="font-mono text-sm">{order.userId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">用户名称</div>
                  <div className="text-sm">{order.userName}</div>
                </div>
              </div>
            </div>

            {/* 产品信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="w-4 h-4" />
                产品信息
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                <div>
                  <div className="text-sm text-muted-foreground">产品类型</div>
                  <div>{renderProductTypeBadge(order.productType)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">产品名称</div>
                  <div className="text-sm">{order.productName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">产品ID</div>
                  <div className="font-mono text-sm">{order.productId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CDK代码</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{order.cdkCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(order.cdkCode, 'CDK代码')}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 订单详情 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="w-4 h-4" />
                订单详情
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                <div>
                  <div className="text-sm text-muted-foreground">订单金额</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatAmount(order.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">创建时间</div>
                  <div className="text-sm">{formatDateTime(order.createTime)}</div>
                </div>
                {order.activatedTime && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-muted-foreground">激活时间</div>
                    <div className="text-sm">{formatDateTime(order.activatedTime)}</div>
                  </div>
                )}
                {order.remark && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-muted-foreground">备注</div>
                    <div className="text-sm bg-muted/50 rounded p-2">{order.remark}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // 错误或空状态
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>订单详情加载失败</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
