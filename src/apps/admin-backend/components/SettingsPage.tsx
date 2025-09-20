import React, { useState, useEffect } from 'react';
import { Settings, Save, Package } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { SystemConfigService } from '@shared/services/api/system-config.service';
import { SubscriptionPlansService } from '@shared/services/api/subscription-plans.service';
import {
  DefaultSubscriptionConfig,
  SubscriptionPlanDTO
} from '@shared/types';

/**
 * 系统配置页面
 * 提供系统各项配置的管理功能
 */
export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 默认套餐配置状态
  const [defaultSubscriptionConfig, setDefaultSubscriptionConfig] = useState<DefaultSubscriptionConfig>({
    subscriptionPlanId: ''
  });

  // 套餐选项
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDTO[]>([]);

  // 加载配置数据
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);

      // 并行加载默认套餐配置和套餐列表
      const [configResponse, plansResponse] = await Promise.all([
        SystemConfigService.getDefaultSubscriptionConfig(),
        SubscriptionPlansService.getPagedSubscriptionPlans({ pageNum: 1, pageSize: 100 })
      ]);

      // 设置默认套餐配置
      if (configResponse.data) {
        const config = configResponse.data as DefaultSubscriptionConfig;
        setDefaultSubscriptionConfig(config);
      }

      // 设置套餐选项
      setSubscriptionPlans(plansResponse.records);

    } catch (error) {
      console.error('加载系统配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);

      await SystemConfigService.updateDefaultSubscriptionConfig(
        defaultSubscriptionConfig.subscriptionPlanId
      );

      setShowConfirmDialog(false);

    } catch (error) {
      console.error('保存配置失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const subscriptionPlanOptions = subscriptionPlans.map(plan => ({
    value: plan.id,
    label: `${plan.name} (等级${plan.level}, ${plan.validityMonths}个月)`
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          系统配置
        </h1>
      </div>

      {/* 默认套餐配置卡片 */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            新用户默认套餐配置
          </h2>
        </div>

        <div className="space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            配置新用户注册后自动获得的默认套餐，用于提供基础权益。
          </div>

          {/* 套餐选择 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              默认套餐 <span className="text-red-500">*</span>
            </label>
            <Select
              options={subscriptionPlanOptions}
              value={defaultSubscriptionConfig.subscriptionPlanId}
              onChange={(value) => setDefaultSubscriptionConfig(prev => ({
                ...prev,
                subscriptionPlanId: value
              }))}
              placeholder="请选择默认套餐"
            />
          </div>

          {/* 配置预览 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              配置预览:
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                当前默认套餐: {subscriptionPlans.find(p => p.id === defaultSubscriptionConfig.subscriptionPlanId)?.name || '未选择'}
              </div>
              {defaultSubscriptionConfig.subscriptionPlanId && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  新用户注册后将自动获得此套餐权益
                </div>
              )}
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={() => setShowConfirmDialog(true)}
              disabled={
                !defaultSubscriptionConfig.subscriptionPlanId ||
                saving
              }
              icon={Save}
              loading={saving}
            >
              保存配置
            </Button>
          </div>
        </div>
      </Card>

      {/* 其他配置模块占位卡片 */}
      <Card className="p-6">
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            更多配置模块
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            邮件模板配置、系统维护配置等功能即将上线
          </p>
        </div>
      </Card>

      {/* 确认保存对话框 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="确认保存配置"
        message="确定要保存当前的系统配置吗？配置保存后将立即生效。"
        confirmText="保存"
        onConfirm={handleSaveConfiguration}
        onCancel={() => setShowConfirmDialog(false)}
        variant="primary"
        loading={saving}
      />
    </div>
  );
};