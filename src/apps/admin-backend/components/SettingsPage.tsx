import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemConfigService } from '@shared/services/api/system-config.service';
import { SubscriptionPlanCoursesService } from '@shared/services/api/subscription-plan-courses.service';
import type { SimpleSubscriptionPlanDTO, SystemConfigDTO, UserSessionLimitConfigData } from '@shared/types';
import { RefreshCw, Save, Eye, EyeOff } from 'lucide-react';
import { showToast } from '@shared/utils/toast';
import { Input } from '@/components/ui/input';
import type { GithubOAuthConfig } from '@shared/types/system';

export const SettingsPage: React.FC = () => {
  // 默认套餐配置 - 数据与状态
  const [plans, setPlans] = useState<SimpleSubscriptionPlanDTO[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);

  const [initialPlanId, setInitialPlanId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const isDirty = useMemo(() => selectedPlanId !== initialPlanId, [selectedPlanId, initialPlanId]);

  // 会话限制配置
  const [sessionCfg, setSessionCfg] = useState<UserSessionLimitConfigData>({ maxActiveIps: 2, policy: 'EVICT_OLDEST', banTtlDays: 0 });
  const [initialSessionCfg, setInitialSessionCfg] = useState<UserSessionLimitConfigData>({ maxActiveIps: 2, policy: 'EVICT_OLDEST', banTtlDays: 0 });
  const [loadingSessionCfg, setLoadingSessionCfg] = useState(false);
  const [savingSessionCfg, setSavingSessionCfg] = useState(false);
  const sessionDirty = useMemo(() =>
    sessionCfg.maxActiveIps !== initialSessionCfg.maxActiveIps ||
    sessionCfg.policy !== initialSessionCfg.policy ||
    sessionCfg.banTtlDays !== initialSessionCfg.banTtlDays,
  [sessionCfg, initialSessionCfg]);

  // 加载所有套餐（用于绑定）
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const list = await SubscriptionPlanCoursesService.getSimpleSubscriptionPlans();
      setPlans(list);
    } catch {
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
      const planId = ((cfg?.data as Record<string, unknown> | undefined)?.subscriptionPlanId as string) ?? '';
      setInitialPlanId(planId);
      setSelectedPlanId(planId);
    } catch {
      // 不存在配置时可能返回404，忽略即可
      setInitialPlanId('');
      setSelectedPlanId('');
    } finally {
      setLoadingConfig(false);
    }
  };

  // 加载会话限制配置
  const fetchSessionLimitConfig = async () => {
    try {
      setLoadingSessionCfg(true);
      const cfg: SystemConfigDTO = await SystemConfigService.getUserSessionLimitConfig();
      const data = cfg?.data as Partial<UserSessionLimitConfigData> | undefined;
      const norm: UserSessionLimitConfigData = {
        maxActiveIps: Math.min(10, Math.max(1, Number(data?.maxActiveIps ?? 2))),
        policy: (data?.policy === 'DENY_NEW' || data?.policy === 'EVICT_OLDEST') ? data.policy : 'EVICT_OLDEST',
        banTtlDays: Math.max(0, Number(data?.banTtlDays ?? 0))
      };
      setInitialSessionCfg(norm);
      setSessionCfg(norm);
    } catch {
      // 404等情况：采用默认
      const defVal: UserSessionLimitConfigData = { maxActiveIps: 2, policy: 'EVICT_OLDEST', banTtlDays: 0 };
      setInitialSessionCfg(defVal);
      setSessionCfg(defVal);
    } finally {
      setLoadingSessionCfg(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchDefaultConfig();
    fetchSessionLimitConfig();
  }, []);

  useEffect(() => {
    fetchGithubOAuthConfig();
  }, []);

  const handleSave = async () => {
    if (!selectedPlanId) return showToast.error('请选择一个默认套餐');
    try {
      setSaving(true);
      await SystemConfigService.updateDefaultSubscriptionConfig(selectedPlanId);
      setInitialPlanId(selectedPlanId);
      showToast.success('默认套餐已更新');
    } catch {
      // 错误由拦截器提示
    } finally {
      setSaving(false);
    }
  };

  const loading = loadingPlans || loadingConfig;
  const sessionLoading = loadingSessionCfg;

  // ============== GitHub OAuth 配置 ==============
  const [ghCfg, setGhCfg] = useState<GithubOAuthConfig | null>(null);
  const [initialGhCfg, setInitialGhCfg] = useState<GithubOAuthConfig | null>(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghSaving, setGhSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const ghDefault: GithubOAuthConfig = {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    scopes: ['read:user', 'user:email'],
    authorizeBaseUri: 'https://github.com/login/oauth/authorize',
    tokenUri: 'https://github.com/login/oauth/access_token',
    userApi: 'https://api.github.com/user',
    emailApi: 'https://api.github.com/user/emails',
    requireVerifiedEmailForMerge: true,
    fetchEmailFromApi: true,
    updateUserProfileIfEmpty: true,
  };

  const fetchGithubOAuthConfig = async () => {
    try {
      setGhLoading(true);
      const cfg: SystemConfigDTO = await SystemConfigService.getGithubOAuthConfig();
      const raw = (cfg?.data as Partial<GithubOAuthConfig> | undefined) || {};
      const normalized: GithubOAuthConfig = {
        ...ghDefault,
        ...raw,
        scopes: Array.isArray(raw.scopes) ? raw.scopes : ghDefault.scopes,
      };
      setGhCfg(normalized);
      setInitialGhCfg(normalized);
    } catch {
      setGhCfg(ghDefault);
      setInitialGhCfg(ghDefault);
    } finally {
      setGhLoading(false);
    }
  };

  const ghDirty = useMemo(() => JSON.stringify(ghCfg) !== JSON.stringify(initialGhCfg), [ghCfg, initialGhCfg]);

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

      {/* 用户会话限制配置 */}
      <Card>
        <CardHeader>
          <CardTitle>会话与设备限制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxActiveIps">最大并发活跃IP数 (1-10)</Label>
              <Input
                id="maxActiveIps"
                type="number"
                min={1}
                max={10}
                value={sessionCfg.maxActiveIps}
                onChange={(e) => setSessionCfg(prev => ({ ...prev, maxActiveIps: Math.min(10, Math.max(1, Number(e.target.value || 0))) }))}
                disabled={sessionLoading || savingSessionCfg}
              />
            </div>

            <div className="space-y-2">
              <Label>超配额策略</Label>
              <Select
                value={sessionCfg.policy}
                onValueChange={(v) => setSessionCfg(prev => ({ ...prev, policy: v as UserSessionLimitConfigData['policy'] }))}
                disabled={sessionLoading || savingSessionCfg}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择策略" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DENY_NEW">拒绝新会话 (DENY_NEW)</SelectItem>
                  <SelectItem value="EVICT_OLDEST">驱逐最早会话 (EVICT_OLDEST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banTtlDays">封禁时长（天，0=永久）</Label>
              <Input
                id="banTtlDays"
                type="number"
                min={0}
                value={sessionCfg.banTtlDays}
                onChange={(e) => setSessionCfg(prev => ({ ...prev, banTtlDays: Math.max(0, Number(e.target.value || 0)) }))}
                disabled={sessionLoading || savingSessionCfg}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={fetchSessionLimitConfig}
              disabled={sessionLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />刷新
            </Button>
            <Button
              onClick={async () => {
                // 校验
                if (sessionCfg.maxActiveIps < 1 || sessionCfg.maxActiveIps > 10) {
                  return showToast.error('最大并发活跃IP数需在 1-10 范围内');
                }
                try {
                  setSavingSessionCfg(true);
                  await SystemConfigService.updateUserSessionLimitConfig(sessionCfg);
                  setInitialSessionCfg(sessionCfg);
                  showToast.success('会话限制配置已更新');
                } catch {
                  // 错误由拦截器提示
                } finally {
                  setSavingSessionCfg(false);
                }
              }}
              disabled={!sessionDirty || savingSessionCfg}
            >
              <Save className="mr-2 h-4 w-4" />保存配置
            </Button>
          </div>

          {/* 固定参数展示 */}
          <div className="mt-6 text-sm text-muted-foreground space-y-1">
            <div>会话TTL：30天</div>
            <div>历史滑窗：30天</div>
            <div>封禁阈值：10个IP</div>
            <div>续活间隔：60秒</div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub OAuth 配置 */}
      <Card>
        <CardHeader>
          <CardTitle>GitHub OAuth 配置</CardTitle>
        </CardHeader>
        <CardContent>
          {!ghCfg ? (
            <div className="text-sm text-muted-foreground">加载中...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gh-client-id">Client ID</Label>
                  <Input
                    id="gh-client-id"
                    value={ghCfg.clientId}
                    onChange={(e) => setGhCfg(prev => prev && ({ ...prev, clientId: e.target.value }))}
                    disabled={ghLoading || ghSaving}
                    placeholder="GitHub OAuth App Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gh-client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="gh-client-secret"
                      type={showSecret ? 'text' : 'password'}
                      value={ghCfg.clientSecret}
                      onChange={(e) => setGhCfg(prev => prev && ({ ...prev, clientSecret: e.target.value }))}
                      disabled={ghLoading || ghSaving}
                      placeholder="GitHub OAuth App Client Secret"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowSecret(s => !s)}
                      aria-label={showSecret ? '隐藏' : '显示'}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="gh-redirect-uri">Redirect URI</Label>
                  <Input
                    id="gh-redirect-uri"
                    value={ghCfg.redirectUri}
                    onChange={(e) => setGhCfg(prev => prev && ({ ...prev, redirectUri: e.target.value }))}
                    disabled={ghLoading || ghSaving}
                    placeholder="例如：http://localhost:5173/oauth/github/callback"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="gh-scopes">Scopes（以空格或逗号分隔）</Label>
                  <Input
                    id="gh-scopes"
                    value={ghCfg.scopes.join(' ')}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      const arr = v.split(/[\s,]+/).filter(Boolean);
                      setGhCfg(prev => prev && ({ ...prev, scopes: arr.length ? arr : [] }));
                    }}
                    disabled={ghLoading || ghSaving}
                  />
                </div>
              </div>

              <details className="p-3 rounded border bg-muted/30">
                <summary className="cursor-pointer text-sm text-muted-foreground">高级参数</summary>
                <div className="grid gap-3 mt-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="gh-authorize-base">Authorize Base URI</Label>
                    <Input id="gh-authorize-base" value={ghCfg.authorizeBaseUri} onChange={(e) => setGhCfg(prev => prev && ({ ...prev, authorizeBaseUri: e.target.value }))} disabled={ghLoading || ghSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gh-token-uri">Token URI</Label>
                    <Input id="gh-token-uri" value={ghCfg.tokenUri} onChange={(e) => setGhCfg(prev => prev && ({ ...prev, tokenUri: e.target.value }))} disabled={ghLoading || ghSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gh-user-api">User API</Label>
                    <Input id="gh-user-api" value={ghCfg.userApi} onChange={(e) => setGhCfg(prev => prev && ({ ...prev, userApi: e.target.value }))} disabled={ghLoading || ghSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gh-email-api">Email API</Label>
                    <Input id="gh-email-api" value={ghCfg.emailApi} onChange={(e) => setGhCfg(prev => prev && ({ ...prev, emailApi: e.target.value }))} disabled={ghLoading || ghSaving} />
                  </div>
                </div>

                <div className="grid gap-3 mt-3 md:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ghCfg.requireVerifiedEmailForMerge}
                      onChange={(e) => setGhCfg(prev => prev && ({ ...prev, requireVerifiedEmailForMerge: e.target.checked }))}
                      disabled={ghLoading || ghSaving}
                    />
                    仅验证邮箱时允许合并
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ghCfg.fetchEmailFromApi}
                      onChange={(e) => setGhCfg(prev => prev && ({ ...prev, fetchEmailFromApi: e.target.checked }))}
                      disabled={ghLoading || ghSaving}
                    />
                    从Email API拉取邮箱
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ghCfg.updateUserProfileIfEmpty}
                      onChange={(e) => setGhCfg(prev => prev && ({ ...prev, updateUserProfileIfEmpty: e.target.checked }))}
                      disabled={ghLoading || ghSaving}
                    />
                    资料为空时用GitHub资料填充
                  </label>
                </div>
              </details>

              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchGithubOAuthConfig} disabled={ghLoading}>
                  <RefreshCw className="mr-2 h-4 w-4" />刷新
                </Button>
                <Button
                  onClick={async () => {
                    if (!ghCfg.clientId || !ghCfg.clientSecret || !ghCfg.redirectUri) {
                      return showToast.error('请完整填写 Client ID、Client Secret 与 Redirect URI');
                    }
                    try {
                      setGhSaving(true);
                      await SystemConfigService.updateGithubOAuthConfig(ghCfg);
                      setInitialGhCfg(ghCfg);
                    } catch {
                      // 错误由拦截器提示
                    } finally {
                      setGhSaving(false);
                    }
                  }}
                  disabled={!ghDirty || ghSaving}
                >
                  <Save className="mr-2 h-4 w-4" />保存配置
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">提示：Redirect URI 应填写前端回调地址，如 http://localhost:5173/oauth/github/callback</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
