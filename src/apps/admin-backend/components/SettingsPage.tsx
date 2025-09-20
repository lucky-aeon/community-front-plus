import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemConfigService } from '@shared/services/api/system-config.service';
import { SubscriptionPlanCoursesService } from '@shared/services/api/subscription-plan-courses.service';
import type { SimpleSubscriptionPlanDTO, SystemConfigDTO } from '@shared/types';
import { RefreshCw, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  // 默认套餐配置 - 数据与状态
  const [plans, setPlans] = useState<SimpleSubscriptionPlanDTO[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);

  const [initialPlanId, setInitialPlanId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const isDirty = useMemo(() => selectedPlanId !== initialPlanId, [selectedPlanId, initialPlanId]);

  // 加载所有套餐（用于绑定）
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const list = await SubscriptionPlanCoursesService.getSimpleSubscriptionPlans();
      setPlans(list);
    } catch (e) {
      // 错误已由拦截器提示
    } finally {
      setLoadingPlans(false);
    }
  };

  // 加载默认套餐配置
  const fetchDefaultConfig = async () => {
    try {
      setLoadingConfig(true);
      const cfg: SystemConfigDTO = await SystemConfigService.getDefaultSubscriptionConfig();
      const planId = (cfg?.data as any)?.subscriptionPlanId ?? '';
      setInitialPlanId(planId);
      setSelectedPlanId(planId);
    } catch (e) {
      // 不存在配置时可能返回404，忽略即可
      setInitialPlanId('');
      setSelectedPlanId('');
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchDefaultConfig();
  }, []);

  const handleSave = async () => {
    if (!selectedPlanId) return toast.error('请选择一个默认套餐');
    try {
      setSaving(true);
      await SystemConfigService.updateDefaultSubscriptionConfig(selectedPlanId);
      setInitialPlanId(selectedPlanId);
      toast.success('默认套餐已更新');
    } catch (e) {
      // 错误由拦截器提示
    } finally {
      setSaving(false);
    }
  };

  const loading = loadingPlans || loadingConfig;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">系统配置</h1>
        <p className="text-muted-foreground mt-1">管理系统全局设置和配置</p>
      </div>

      {/* 默认套餐配置 */}
      <Card>
        <CardHeader>
          <CardTitle>默认套餐配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
            <div className="space-y-2">
              <Label htmlFor="default-plan">默认套餐</Label>
              <Select
                value={selectedPlanId}
                onValueChange={(v) => setSelectedPlanId(v)}
                disabled={loading || saving}
              >
                <SelectTrigger id="default-plan">
                  <SelectValue placeholder={loading ? '加载中...' : '请选择默认套餐'} />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}（Level {p.level}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loading && plans.length === 0 && (
                <p className="text-sm text-muted-foreground">暂无可选套餐，请先在“套餐管理”中创建。</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  fetchPlans();
                  fetchDefaultConfig();
                }}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />刷新
              </Button>
              <Button onClick={handleSave} disabled={!isDirty || !selectedPlanId || saving}>
                <Save className="mr-2 h-4 w-4" />保存配置
              </Button>
            </div>
          </div>

          {initialPlanId && (
            <p className="text-sm text-muted-foreground mt-4">
              当前默认：{plans.find(p => p.id === initialPlanId)?.name ?? '未知套餐'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
