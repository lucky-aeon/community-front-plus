import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { PortalModal } from '@shared/components/ui/PortalModal';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { SubscriptionPlansService } from '@shared/services/api';
import {
  SubscriptionPlanDTO,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest
} from '@shared/types';

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPlan?: SubscriptionPlanDTO | null;
}

interface FormData {
  name: string;
  level: string;
  validityMonths: string;
  price: string;
  benefits: string[];
}

interface FormErrors {
  name?: string;
  level?: string;
  validityMonths?: string;
  price?: string;
  benefits?: string;
}

export const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingPlan
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    level: '',
    validityMonths: '',
    price: '',
    benefits: ['']
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingPlan;

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (editingPlan) {
        setFormData({
          name: editingPlan.name,
          level: editingPlan.level.toString(),
          validityMonths: editingPlan.validityMonths.toString(),
          price: editingPlan.price.toString(),
          benefits: editingPlan.benefits.length > 0 ? editingPlan.benefits : ['']
        });
      } else {
        setFormData({
          name: '',
          level: '',
          validityMonths: '',
          price: '',
          benefits: ['']
        });
      }
      setErrors({});
    }
  }, [isOpen, editingPlan]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 套餐名称验证
    if (!formData.name.trim()) {
      newErrors.name = '套餐名称不能为空';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '套餐名称至少需要2个字符';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '套餐名称不能超过100个字符';
    }

    // 套餐级别验证
    if (!formData.level.trim()) {
      newErrors.level = '套餐级别不能为空';
    } else {
      const levelNum = parseInt(formData.level);
      if (isNaN(levelNum) || levelNum <= 0) {
        newErrors.level = '套餐级别必须是大于0的整数';
      }
    }

    // 有效期验证
    if (!formData.validityMonths.trim()) {
      newErrors.validityMonths = '有效期不能为空';
    } else {
      const validityNum = parseInt(formData.validityMonths);
      if (isNaN(validityNum) || validityNum <= 0) {
        newErrors.validityMonths = '有效期必须是大于0的整数';
      }
    }

    // 价格验证
    if (!formData.price.trim()) {
      newErrors.price = '价格不能为空';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = '价格不能为负数';
      }
    }

    // 权益验证
    const validBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
    if (validBenefits.length === 0) {
      newErrors.benefits = '至少需要添加一个套餐权益';
    } else if (validBenefits.length > 20) {
      newErrors.benefits = '套餐权益最多20个';
    } else {
      // 检查权益内容长度
      const invalidBenefit = validBenefits.find(benefit => benefit.trim().length > 200);
      if (invalidBenefit) {
        newErrors.benefits = '权益描述不能超过200个字符';
      }
      // 检查重复权益
      const uniqueBenefits = new Set(validBenefits.map(b => b.trim().toLowerCase()));
      if (uniqueBenefits.size !== validBenefits.length) {
        newErrors.benefits = '权益内容不能重复';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'benefits') return; // benefits通过专门的函数处理
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 权益管理函数
  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
    // 清除权益相关错误
    if (errors.benefits) {
      setErrors(prev => ({ ...prev, benefits: undefined }));
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validBenefits = formData.benefits.filter(benefit => benefit.trim() !== '').map(benefit => benefit.trim());

      const requestData = {
        name: formData.name.trim(),
        level: parseInt(formData.level),
        validityMonths: parseInt(formData.validityMonths),
        price: parseFloat(formData.price),
        benefits: validBenefits
      };

      if (isEditing && editingPlan) {
        await SubscriptionPlansService.updateSubscriptionPlan(
          editingPlan.id,
          requestData as UpdateSubscriptionPlanRequest
        );
      } else {
        await SubscriptionPlansService.createSubscriptionPlan(
          requestData as CreateSubscriptionPlanRequest
        );
      }

      onSuccess();
    } catch (error) {
      console.error('保存套餐失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <PortalModal isOpen={isOpen} onClose={handleClose} closeOnEscape={false}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? '编辑套餐' : '创建套餐'}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：基本信息 */}
            <div className="space-y-6">
              {/* 套餐名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  套餐名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="请输入套餐名称（2-100字符）"
                  error={errors.name}
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>

              {/* 套餐级别 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  套餐级别 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  placeholder="请输入套餐级别（正整数）"
                  error={errors.level}
                  disabled={isSubmitting}
                  min="1"
                />
              </div>

              {/* 有效期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  有效期（月） <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.validityMonths}
                  onChange={(e) => handleInputChange('validityMonths', e.target.value)}
                  placeholder="请输入有效期月数"
                  error={errors.validityMonths}
                  disabled={isSubmitting}
                  min="1"
                />
              </div>

              {/* 价格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  价格（元） <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="请输入套餐价格"
                  error={errors.price}
                  disabled={isSubmitting}
                  min="0"
                />
              </div>
            </div>

            {/* 右侧：套餐权益 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  套餐权益 <span className="text-red-500">*</span>
                </label>
                {errors.benefits && (
                  <div className="text-sm text-red-500 mb-2">{errors.benefits}</div>
                )}

                <div className="space-y-3">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          value={benefit}
                          onChange={(e) => updateBenefit(index, e.target.value)}
                          placeholder={`权益 ${index + 1}（最多200字符）`}
                          disabled={isSubmitting}
                          maxLength={200}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (benefit.trim() && index === formData.benefits.length - 1) {
                                addBenefit();
                              }
                            }
                          }}
                        />
                      </div>
                      {formData.benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => removeBenefit(index)}
                          disabled={isSubmitting}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addBenefit}
                    disabled={isSubmitting || formData.benefits.length >= 20}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加权益
                  </Button>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.benefits.filter(b => b.trim()).length}/20 权益
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end gap-3 pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? '更新套餐' : '创建套餐'}
            </Button>
          </div>
        </form>
      </div>
    </PortalModal>
  );
};