import React, { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DataTable, DataTableColumn } from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { TableActions, TableAction } from '@shared/components/ui/TableActions';
import { SubscriptionPlansService } from '@shared/services/api';
import {
  SubscriptionPlanDTO,
  SubscriptionPlanQueryRequest,
  SubscriptionPlanStatus,
  PageResponse
} from '@shared/types';
import { SubscriptionPlanModal } from './SubscriptionPlanModal';
import { SubscriptionPlanCourseBindingModal } from './SubscriptionPlanCourseBindingModal';

export const SubscriptionPlansPage: React.FC = () => {
  // 状态管理
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDTO | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlanDTO | null>(null);

  // 课程绑定模态框状态
  const [isCourseBindingModalOpen, setIsCourseBindingModalOpen] = useState(false);
  const [courseBindingPlan, setCourseBindingPlan] = useState<SubscriptionPlanDTO | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 加载套餐列表
  const loadSubscriptionPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: SubscriptionPlanQueryRequest = {
        pageNum: currentPage,
        pageSize
      };

      const response: PageResponse<SubscriptionPlanDTO> = await SubscriptionPlansService.getPagedSubscriptionPlans(params);

      setSubscriptionPlans(response.records || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('加载套餐列表失败:', error);
      setSubscriptionPlans([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  // 编辑套餐
  const handleEdit = useCallback((plan: SubscriptionPlanDTO) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  }, []);

  // 创建套餐
  const handleCreate = useCallback(() => {
    setEditingPlan(null);
    setIsModalOpen(true);
  }, []);

  // 删除套餐
  const handleDelete = useCallback(async () => {
    if (!deletingPlan) return;

    try {
      await SubscriptionPlansService.deleteSubscriptionPlan(deletingPlan.id);
      setDeletingPlan(null);
      loadSubscriptionPlans();
    } catch (error) {
      console.error('删除套餐失败:', error);
    }
  }, [deletingPlan, loadSubscriptionPlans]);

  // 模态框保存成功回调
  const handleModalSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingPlan(null);
    loadSubscriptionPlans();
  }, [loadSubscriptionPlans]);

  // 课程绑定
  const handleCourseBinding = useCallback((plan: SubscriptionPlanDTO) => {
    setCourseBindingPlan(plan);
    setIsCourseBindingModalOpen(true);
  }, []);

  // 课程绑定模态框成功回调
  const handleCourseBindingSuccess = useCallback(() => {
    setIsCourseBindingModalOpen(false);
    setCourseBindingPlan(null);
    // 课程绑定不需要重新加载套餐列表，因为不影响套餐数据本身
  }, []);

  // 格式化价格显示
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  // 格式化有效期显示
  const formatValidityMonths = (months: number) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years}年`;
      }
      return `${years}年${remainingMonths}个月`;
    }
    return `${months}个月`;
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取状态变体
  const getStatusVariant = (status: SubscriptionPlanStatus) => {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  };

  // 获取状态文本
  const getStatusText = (status: SubscriptionPlanStatus) => {
    return status === 'ACTIVE' ? '激活' : '停用';
  };

  // 定义表格列
  const columns: DataTableColumn<SubscriptionPlanDTO>[] = [
    {
      key: 'planInfo',
      title: '套餐信息',
      render: (_, plan) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {plan.name}
          </div>
          {plan.benefits && plan.benefits.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {plan.benefits.length} 个权益
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'level',
      title: '级别',
      render: (_, plan) => (
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
            {plan.level}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      title: '价格',
      render: (_, plan) => (
        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
          {formatPrice(plan.price)}
        </div>
      ),
    },
    {
      key: 'validity',
      title: '有效期',
      render: (_, plan) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-white">
          <Calendar className="w-4 h-4 mr-1 text-blue-600" />
          {formatValidityMonths(plan.validityMonths)}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_, plan) => (
        <Badge variant={getStatusVariant(plan.status)}>
          {getStatusText(plan.status)}
        </Badge>
      ),
    },
    {
      key: 'createTime',
      title: '创建时间',
      render: (_, plan) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(plan.createTime)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, plan) => {
        const actions: TableAction[] = [
          {
            key: 'edit',
            type: 'edit',
            onClick: () => handleEdit(plan),
          },
          {
            key: 'courses',
            type: 'courses',
            onClick: () => handleCourseBinding(plan),
          },
          {
            key: 'delete',
            type: 'delete',
            onClick: () => setDeletingPlan(plan),
          },
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  // 初始加载
  useEffect(() => {
    loadSubscriptionPlans();
  }, [currentPage, loadSubscriptionPlans]);

  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">套餐管理</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          创建套餐
        </Button>
      </div>

      {/* 数据表格 */}
      <DataTable
        columns={columns}
        data={subscriptionPlans}
        loading={isLoading}
        rowKey="id"
        emptyText="没有找到套餐"
        emptyIcon={<Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onChange={setCurrentPage}
            mode="complex"
          />
        }
      />

      {/* 创建/编辑模态框 */}
      <SubscriptionPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingPlan={editingPlan}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={!!deletingPlan}
        title="确认删除"
        message={`确定要删除套餐"${deletingPlan?.name}"吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPlan(null)}
        variant="danger"
      />

      {/* 课程绑定模态框 */}
      <SubscriptionPlanCourseBindingModal
        isOpen={isCourseBindingModalOpen}
        onClose={() => setIsCourseBindingModalOpen(false)}
        onSuccess={handleCourseBindingSuccess}
        plan={courseBindingPlan}
      />
    </div>
  );
};