import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Save, Plus, Trash2 } from 'lucide-react';
import { IndependentServicesService } from '@shared/services/api/independent-services.service';
import type { IndependentServiceConfig, IndependentServicesConfigData } from '@shared/types';
import { showToast } from '@shared/utils/toast';

const createServiceDraft = (index: number): IndependentServiceConfig => ({
  serviceCode: index === 0 ? 'MOCK_INTERVIEW' : `SERVICE_${index + 1}`,
  enabled: true,
  visibleInHome: true,
  sortOrder: index,
  title: index === 0 ? '模拟面试' : '',
  price: index === 0 ? '150' : '',
  priceUnit: index === 0 ? '/h' : '',
  summary: '围绕目标岗位提供一对一支持',
  description: '',
  highlights: ['围绕目标需求提供个性化支持'],
  ctaText: '立即咨询',
  wechatNumber: '',
  wechatTip: '',
  serviceProcess: [],
  targetUsers: [],
  topics: [],
  notes: []
});

const normalizeList = (items: string[]): string[] =>
  items
    .map((item) => item.trim())
    .filter(Boolean);

const formatList = (items: string[]): string => items.join('\n');

const trimText = (value: string): string => value.trim();

export const IndependentServicesConfigCard: React.FC = () => {
  const [services, setServices] = useState<IndependentServiceConfig[]>([createServiceDraft(0)]);
  const [initialServices, setInitialServices] = useState<IndependentServiceConfig[]>([createServiceDraft(0)]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(services) !== JSON.stringify(initialServices),
    [services, initialServices]
  );

  const updateService = (index: number, patch: Partial<IndependentServiceConfig>) => {
    setServices((prev) =>
      prev.map((service, currentIndex) => (currentIndex === index ? { ...service, ...patch } : service))
    );
  };

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const config = await IndependentServicesService.getAdminIndependentServicesConfig();
      const list = Array.isArray(config.services) && config.services.length > 0 ? config.services : [createServiceDraft(0)];
      setServices(list);
      setInitialServices(list);
    } catch (error) {
      console.error('加载独立服务配置失败', error);
      const fallback = [createServiceDraft(0)];
      setServices(fallback);
      setInitialServices(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const validateAndNormalize = (): IndependentServicesConfigData | null => {
    if (services.length === 0) {
      showToast.error('请至少配置一个独立服务');
      return null;
    }

    const seenCodes = new Set<string>();
    const normalizedServices = services.map((service, index) => {
      const normalized: IndependentServiceConfig = {
        serviceCode: trimText(service.serviceCode),
        enabled: service.enabled,
        visibleInHome: service.visibleInHome,
        sortOrder: Math.max(0, Number(service.sortOrder) || 0),
        title: trimText(service.title),
        price: trimText(service.price),
        priceUnit: trimText(service.priceUnit),
        summary: trimText(service.summary),
        description: trimText(service.description),
        highlights: normalizeList(service.highlights),
        ctaText: trimText(service.ctaText),
        wechatNumber: trimText(service.wechatNumber),
        wechatTip: trimText(service.wechatTip),
        serviceProcess: normalizeList(service.serviceProcess),
        targetUsers: normalizeList(service.targetUsers),
        topics: normalizeList(service.topics),
        notes: normalizeList(service.notes)
      };

      if (!normalized.serviceCode) {
        showToast.error(`第 ${index + 1} 个服务的编码不能为空`);
        return null;
      }
      if (!normalized.title || !normalized.price || !normalized.priceUnit || !normalized.summary || !normalized.ctaText) {
        showToast.error(`第 ${index + 1} 个服务的必填字段未填写完整`);
        return null;
      }
      if (normalized.highlights.length === 0) {
        showToast.error(`第 ${index + 1} 个服务的卖点列表至少需要填写 1 条`);
        return null;
      }
      if (seenCodes.has(normalized.serviceCode)) {
        showToast.error(`服务编码重复：${normalized.serviceCode}`);
        return null;
      }
      seenCodes.add(normalized.serviceCode);
      return normalized;
    });

    if (normalizedServices.some((item) => item === null)) {
      return null;
    }

    return {
      services: normalizedServices as IndependentServiceConfig[]
    };
  };

  const handleSave = async () => {
    const payload = validateAndNormalize();
    if (!payload) {
      return;
    }

    try {
      setSaving(true);
      const next = await IndependentServicesService.updateAdminIndependentServicesConfig(payload);
      setServices(next.services);
      setInitialServices(next.services);
    } catch (error) {
      console.error('保存独立服务配置失败', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = () => {
    setServices((prev) => [...prev, createServiceDraft(prev.length)]);
  };

  const handleRemoveService = (index: number) => {
    setServices((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const updateListText = (index: number, field: 'highlights' | 'serviceProcess' | 'targetUsers' | 'topics' | 'notes', value: string) => {
    updateService(index, {
      [field]: value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    } as Partial<IndependentServiceConfig>);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>独立服务配置</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">管理独立服务的基础展示信息、排序和首页可见性</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadConfig} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />刷新
          </Button>
          <Button variant="outline" onClick={handleAddService} disabled={saving}>
            <Plus className="mr-2 h-4 w-4" />新增服务
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || saving}>
            <Save className="mr-2 h-4 w-4" />保存配置
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service, index) => (
          <details key={service.serviceCode || index} className="rounded-lg border bg-muted/20 p-4" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  {service.title || `服务 ${index + 1}`}
                  <span className="ml-2 text-xs text-muted-foreground">({service.serviceCode || '未命名'})</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {service.enabled ? '启用' : '停用'} · {service.visibleInHome ? '首页可见' : '首页隐藏'} · 排序 {service.sortOrder}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {services.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveService(index); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </summary>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={service.enabled}
                    onChange={(e) => updateService(index, { enabled: e.target.checked })}
                  />
                  启用
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={service.visibleInHome}
                    onChange={(e) => updateService(index, { visibleInHome: e.target.checked })}
                  />
                  首页可见
                </label>
                <div className="space-y-2">
                  <Label>排序权重</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.sortOrder}
                    onChange={(e) => updateService(index, { sortOrder: Math.max(0, Number(e.target.value || 0)) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>服务编码</Label>
                  <Input
                    value={service.serviceCode}
                    onChange={(e) => updateService(index, { serviceCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>标题</Label>
                  <Input value={service.title} onChange={(e) => updateService(index, { title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>价格</Label>
                  <Input value={service.price} onChange={(e) => updateService(index, { price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>价格单位</Label>
                  <Input value={service.priceUnit} onChange={(e) => updateService(index, { priceUnit: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>摘要文案</Label>
                  <Textarea value={service.summary} onChange={(e) => updateService(index, { summary: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CTA 文案</Label>
                  <Input value={service.ctaText} onChange={(e) => updateService(index, { ctaText: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>卖点列表（每行一条）</Label>
                  <Textarea
                    value={formatList(service.highlights)}
                    onChange={(e) => updateListText(index, 'highlights', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </details>
        ))}
      </CardContent>
    </Card>
  );
};
