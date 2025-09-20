import React, { useState, useEffect, useCallback } from 'react';
import { X, Key, Package, BookOpen, Copy } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { PortalModal } from '@shared/components/ui/PortalModal';
import { CDKService, SubscriptionPlanCoursesService } from '@shared/services/api';
import {
  CDKType,
  CreateCDKRequest,
  CDKDTO,
  SimpleSubscriptionPlanDTO,
  SimpleCourseDTO
} from '@shared/types';
import toast from 'react-hot-toast';

interface CreateCDKModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCDKModal: React.FC<CreateCDKModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateCDKRequest>({
    cdkType: 'SUBSCRIPTION_PLAN',
    targetId: '',
    quantity: 1
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<SimpleSubscriptionPlanDTO[]>([]);
  const [courses, setCourses] = useState<SimpleCourseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCDKs, setGeneratedCDKs] = useState<CDKDTO[]>([]);

  // 加载数据 - 一次性加载所有数据并缓存
  const loadData = useCallback(async () => {
    if (!isOpen) return;

    // 如果数据已经加载过，直接返回，避免重复请求
    if (subscriptionPlans.length > 0 && courses.length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // 一次性并行加载套餐和课程数据
      const [plansData, coursesData] = await Promise.all([
        SubscriptionPlanCoursesService.getSimpleSubscriptionPlans(),
        SubscriptionPlanCoursesService.getSimpleCourses()
      ]);

      setSubscriptionPlans(plansData);
      setCourses(coursesData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, subscriptionPlans.length, courses.length]);

  // 处理表单变化
  const handleFormChange = useCallback((field: keyof CreateCDKRequest, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // 当切换CDK类型时，重置目标ID
      if (field === 'cdkType') {
        newData.targetId = '';
      }

      return newData;
    });
  }, []);

  // 生成CDK
  const handleGenerate = useCallback(async () => {
    if (!formData.targetId) {
      toast.error('请选择绑定目标');
      return;
    }

    if (formData.quantity < 1 || formData.quantity > 100) {
      toast.error('生成数量必须在1-100之间');
      return;
    }

    setIsGenerating(true);
    try {
      const cdks = await CDKService.createCDK(formData);
      setGeneratedCDKs(cdks);
      toast.success(`成功生成 ${cdks.length} 个兑换码`);

      // 生成成功后通知父组件刷新列表
      // 延迟一小段时间确保用户能看到生成结果
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('生成CDK失败:', error);
      toast.error('生成CDK失败');
    } finally {
      setIsGenerating(false);
    }
  }, [formData, onSuccess]);

  // 复制单个CDK
  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('兑换码已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败，请手动复制');
    });
  }, []);

  // 重置状态
  const handleClose = useCallback(() => {
    setFormData({
      cdkType: 'SUBSCRIPTION_PLAN',
      targetId: '',
      quantity: 1
    });
    setGeneratedCDKs([]);
    onClose();
  }, [onClose]);

  // 完成并关闭
  const handleComplete = useCallback(() => {
    onSuccess();
    handleClose();
  }, [onSuccess, handleClose]);

  // 获取目标选项
  const getTargetOptions = () => {
    if (formData.cdkType === 'SUBSCRIPTION_PLAN') {
      return subscriptionPlans.map(plan => ({
        value: plan.id,
        label: `${plan.name} (级别 ${plan.level})`
      }));
    } else {
      return courses.map(course => ({
        value: course.id,
        label: course.title
      }));
    }
  };

  // CDK类型选项
  const cdkTypeOptions = [
    { value: 'SUBSCRIPTION_PLAN', label: '套餐' },
    { value: 'COURSE', label: '课程' }
  ];

  // 监听打开状态变化，加载数据
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // 当CDK类型变化或数据加载完成时，自动选择第一个目标
  useEffect(() => {
    if (formData.cdkType === 'SUBSCRIPTION_PLAN' && subscriptionPlans.length > 0 && !formData.targetId) {
      setFormData(prev => ({ ...prev, targetId: subscriptionPlans[0].id }));
    } else if (formData.cdkType === 'COURSE' && courses.length > 0 && !formData.targetId) {
      setFormData(prev => ({ ...prev, targetId: courses[0].id }));
    }
  }, [formData.cdkType, subscriptionPlans, courses, formData.targetId]);

  return (
    <PortalModal isOpen={isOpen} onClose={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  生成CDK
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  批量生成兑换码，绑定套餐或课程
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={isGenerating}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-auto">
            {generatedCDKs.length > 0 ? (
              /* 生成结果展示 */
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  生成结果 ({generatedCDKs.length} 个)
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {generatedCDKs.map((cdk, index) => (
                    <div
                      key={cdk.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                          {index + 1}.
                        </span>
                        <code className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm font-mono">
                          {cdk.code}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopy(cdk.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 生成表单 */
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    {/* CDK类型选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CDK类型 <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.cdkType}
                        onChange={(value) => handleFormChange('cdkType', value as CDKType)}
                        options={cdkTypeOptions}
                        placeholder="选择CDK类型"
                      />
                    </div>

                    {/* 绑定目标选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          {formData.cdkType === 'SUBSCRIPTION_PLAN' ? (
                            <Package className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                          绑定{formData.cdkType === 'SUBSCRIPTION_PLAN' ? '套餐' : '课程'} <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <Select
                        value={formData.targetId}
                        onChange={(value) => handleFormChange('targetId', value)}
                        options={getTargetOptions()}
                        placeholder={`选择${formData.cdkType === 'SUBSCRIPTION_PLAN' ? '套餐' : '课程'}`}
                      />
                    </div>

                    {/* 生成数量 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        生成数量 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.quantity}
                        onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 1)}
                        placeholder="输入生成数量 (1-100)"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        一次最多可生成100个兑换码
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {generatedCDKs.length > 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                已生成 {generatedCDKs.length} 个兑换码，请及时保存
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                生成的CDK将自动绑定到选择的目标
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isGenerating}
              >
                {generatedCDKs.length > 0 ? '关闭' : '取消'}
              </Button>

              {generatedCDKs.length > 0 ? (
                <Button
                  variant="primary"
                  onClick={handleComplete}
                >
                  完成
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={isGenerating || isLoading || !formData.targetId}
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      生成中...
                    </>
                  ) : (
                    `生成 ${formData.quantity} 个CDK`
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalModal>
  );
};