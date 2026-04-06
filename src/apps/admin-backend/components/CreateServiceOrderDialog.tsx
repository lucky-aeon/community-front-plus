import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IndependentServicesService } from '@shared/services/api/independent-services.service';
import type {
  CreateServiceOrderRequest,
  IndependentServiceConfig,
  OrderDTO
} from '@shared/types';
import { showToast } from '@shared/utils/toast';

interface CreateServiceOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (order: OrderDTO) => Promise<void> | void;
}

type ServiceOrderFormState = {
  serviceCode: string;
  amount: string;
  remark: string;
};

const createFormState = (service?: IndependentServiceConfig | null): ServiceOrderFormState => {
  return {
    serviceCode: service?.serviceCode ?? '',
    amount: service?.price ?? '',
    remark: ''
  };
};

const DEFAULT_FORM: ServiceOrderFormState = {
  serviceCode: '',
  amount: '',
  remark: ''
};

export const CreateServiceOrderDialog: React.FC<CreateServiceOrderDialogProps> = ({
  open,
  onOpenChange,
  onCreated
}) => {
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<IndependentServiceConfig[]>([]);
  const [form, setForm] = useState<ServiceOrderFormState>(DEFAULT_FORM);
  const [initialForm, setInitialForm] = useState<ServiceOrderFormState>(DEFAULT_FORM);

  const loadConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      const config = await IndependentServicesService.getAdminIndependentServicesConfig();
      const list = Array.isArray(config.services) ? config.services : [];
      setServices(list);
      const initialService = list[0] ?? null;
      const next = createFormState(initialService);
      setForm(next);
      setInitialForm(next);
    } catch (error) {
      console.error('加载独立服务配置失败', error);
      setServices([]);
      const next = createFormState();
      setForm(next);
      setInitialForm(next);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setServices([]);
      setForm(DEFAULT_FORM);
      setInitialForm(DEFAULT_FORM);
      return;
    }

    void loadConfig();
  }, [open, loadConfig]);

  const handleServiceChange = (serviceCode: string) => {
    const service = services.find((item) => item.serviceCode === serviceCode);
    setForm((prev) => ({
      ...prev,
      serviceCode,
      amount: service?.price ?? ''
    }));
  };

  const validate = (): CreateServiceOrderRequest | null => {
    if (!form.serviceCode.trim()) {
      showToast.error('请选择服务');
      return null;
    }
    if (!form.amount.trim() || Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      showToast.error('请输入有效金额');
      return null;
    }

    return {
      serviceCode: form.serviceCode.trim(),
      amount: Number(form.amount),
      remark: form.remark.trim() || undefined
    };
  };

  const handleSubmit = async () => {
    const request = validate();
    if (!request) {
      return;
    }

    try {
      setSubmitting(true);
      const created = await IndependentServicesService.createIndependentServiceOrder(request);
      await onCreated?.(created);
      onOpenChange(false);
    } catch (error) {
      console.error('创建服务订单失败', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>手工新增服务订单</DialogTitle>
          <DialogDescription>
            录入站外沟通确认后的独立服务订单，按当前服务和金额直接创建。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>服务选择</Label>
              <Select
                value={form.serviceCode}
                onValueChange={handleServiceChange}
                disabled={loadingConfig || submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingConfig ? '加载中...' : '请选择服务'} />
                </SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  {services.map((service) => (
                    <SelectItem key={service.serviceCode} value={service.serviceCode}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                选择服务后会自动带出金额，可按实际情况调整。
              </p>
              {!loadingConfig && services.length === 0 && (
                <p className="text-xs text-amber-600">暂无可用独立服务，请先配置服务后再录单。</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">金额</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="service-remark">备注</Label>
              <Textarea
                id="service-remark"
                value={form.remark}
                onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
                placeholder="可填写沟通背景、交付说明等"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              取消
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loadingConfig || submitting || !isDirty}
            >
              重置
            </Button>
            <Button onClick={handleSubmit} disabled={loadingConfig || submitting}>
              {submitting ? '提交中...' : '创建订单'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
