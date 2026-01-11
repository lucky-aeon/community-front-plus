import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminCodexService } from '@shared/services/api';
import type { CodexConfigDTO } from '@shared/types';
import { Loader2, Save } from 'lucide-react';

export const CodexPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CodexConfigDTO>({ enabled: true });

  const load = async () => {
    setLoading(true);
    try {
      const cfg = await AdminCodexService.getConfig();
      setForm({ enabled: true, ...cfg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload: CodexConfigDTO = { ...form };
      await AdminCodexService.updateConfig(payload);
      // 成功提示由 axios 拦截器统一处理
    } finally {
      setSaving(false);
    }
  };

  const onChange = (patch: Partial<CodexConfigDTO>) => setForm(prev => ({ ...prev, ...patch }));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Codex 配置</h1>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} 刷新
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} 保存
          </Button>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        {/* 表单 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>启用</Label>
              <div className="text-xs text-warm-gray-500">关闭后，前台将不可用</div>
            </div>
            <Switch checked={!!form.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input id="baseUrl" placeholder="https://api.example.com" value={form.baseUrl || ''} onChange={(e) => onChange({ baseUrl: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" type="text" value={form.apiKey || ''} onChange={(e) => onChange({ apiKey: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="authorization">Authorization</Label>
                <Input id="authorization" placeholder="Bearer xxx" value={form.authorization || ''} onChange={(e) => onChange({ authorization: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cookieToken">Cookie Token</Label>
                <Input id="cookieToken" value={form.cookieToken || ''} onChange={(e) => onChange({ cookieToken: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="usageDocUrl">使用文档 URL</Label>
                <Input id="usageDocUrl" placeholder="https://..." value={form.usageDocUrl || ''} onChange={(e) => onChange({ usageDocUrl: e.target.value })} />
              </div>
            </div>

          {(form.expiresAt || form.lastUpdatedAt) && (
            <div className="text-xs text-warm-gray-500 space-x-4">
              {form.expiresAt && <span>过期时间：{form.expiresAt}</span>}
              {form.lastUpdatedAt && <span>最后更新：{form.lastUpdatedAt}</span>}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CodexPage;
