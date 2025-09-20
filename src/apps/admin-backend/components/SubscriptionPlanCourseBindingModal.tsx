import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, BookOpen } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { PortalModal } from '@shared/components/ui/PortalModal';
import { Transfer, TransferItem } from '@shared/components/ui/Transfer';
import { SubscriptionPlanCoursesService } from '@shared/services/api';
import {
  SubscriptionPlanDTO,
  SimpleCourseDTO,
  UpdateSubscriptionPlanCoursesRequest
} from '@shared/types';

interface SubscriptionPlanCourseBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: SubscriptionPlanDTO | null;
}

export const SubscriptionPlanCourseBindingModal: React.FC<SubscriptionPlanCourseBindingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan
}) => {
  const [courses, setCourses] = useState<SimpleCourseDTO[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 加载数据
  const loadData = useCallback(async () => {
    if (!plan || !isOpen) return;

    setIsLoading(true);
    try {
      // 并行加载课程列表和已绑定的课程ID
      const [coursesData, boundCourseIds] = await Promise.all([
        SubscriptionPlanCoursesService.getSimpleCourses(),
        SubscriptionPlanCoursesService.getSubscriptionPlanCourseIds(plan.id)
      ]);

      setCourses(coursesData);
      setTargetKeys(boundCourseIds);
    } catch (error) {
      console.error('加载课程数据失败:', error);
      setCourses([]);
      setTargetKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, [plan, isOpen]);

  // 保存绑定关系
  const handleSave = useCallback(async () => {
    if (!plan) return;

    setIsSaving(true);
    try {
      const request: UpdateSubscriptionPlanCoursesRequest = {
        courseIds: targetKeys
      };

      await SubscriptionPlanCoursesService.updateSubscriptionPlanCourses(plan.id, request);
      onSuccess();
    } catch (error) {
      console.error('保存课程绑定失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [plan, targetKeys, onSuccess]);

  // 处理Transfer组件的变化
  const handleTransferChange = useCallback((newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);
  }, []);

  // 转换课程数据为Transfer组件需要的格式
  const transferDataSource: TransferItem[] = courses.map(course => ({
    key: course.id,
    label: course.title
  }));

  // 重置状态
  const handleClose = useCallback(() => {
    setCourses([]);
    setTargetKeys([]);
    onClose();
  }, [onClose]);

  // 监听打开状态变化，加载数据
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!plan) return null;

  return (
    <PortalModal isOpen={isOpen} onClose={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  课程绑定管理
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  为套餐 "{plan.name}" 配置可访问的课程
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 套餐信息 */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">套餐名称:</span>
                <span className="text-sm text-gray-900 dark:text-white">{plan.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">级别:</span>
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
                  {plan.level}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">有效期:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {plan.validityMonths >= 12
                    ? `${Math.floor(plan.validityMonths / 12)}年${plan.validityMonths % 12 ? `${plan.validityMonths % 12}个月` : ''}`
                    : `${plan.validityMonths}个月`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="h-full">
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    左侧为可选课程，右侧为已绑定课程。用户购买此套餐后，只能访问右侧已绑定的课程。
                  </span>
                </div>

                <Transfer
                  dataSource={transferDataSource}
                  targetKeys={targetKeys}
                  titles={['可选课程', '已绑定课程']}
                  showSearch={true}
                  searchPlaceholder="搜索课程..."
                  height={400}
                  onChange={handleTransferChange}
                  className="h-full"
                />
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 {courses.length} 个课程，已绑定 {targetKeys.length} 个
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSaving}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalModal>
  );
};