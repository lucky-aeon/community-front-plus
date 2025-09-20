import React, { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
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

  // 分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {startPage > 1 && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setCurrentPage(1)}>1</Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="secondary" size="sm" onClick={() => setCurrentPage(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

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
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      套餐信息
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      级别
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      有效期
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {subscriptionPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {plan.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                          {formatPrice(plan.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                          {formatValidityMonths(plan.validityMonths)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(plan.status)}>
                          {getStatusText(plan.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(plan.createTime)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(plan)}
                            title="编辑套餐"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCourseBinding(plan)}
                            title="课程绑定"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeletingPlan(plan)}
                            title="删除套餐"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 空状态 */}
            {subscriptionPlans.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  没有找到套餐
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  暂无套餐数据，可以创建新的套餐
                </p>
              </div>
            )}

            {/* 分页和统计信息 */}
            {subscriptionPlans.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    共 {totalCount} 条记录，第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  {renderPagination()}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

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