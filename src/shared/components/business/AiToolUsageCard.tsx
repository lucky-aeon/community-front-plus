import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Key, Copy, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { showToast } from '@shared/utils/toast';
import { cn } from '@shared/utils/cn';
import type { AiToolSummaryDTO } from '@shared/types';
import { AppCodexService } from '@shared/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AiToolUsageCardProps {
  className?: string;
  // 预留：可通过 props 注入数据，方便单元测试或服务端渲染
  initialData?: Partial<AiToolSummaryDTO>;
  // 使用文档链接（提供则显示按钮）
  docsUrl?: string;
}

/**
 * 首页卡片：AI 工具使用（共享 Key）
 * - 目前使用本地 mock 数据演示布局
 * - 后端接口就绪后，替换为 AppAiToolService.getSummary()
 */
export const AiToolUsageCard: React.FC<AiToolUsageCardProps> = ({ className, initialData, docsUrl }) => {
  const [loading, setLoading] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [data, setData] = useState<AiToolSummaryDTO>(() => ({
    apiKey: initialData?.apiKey || '',
    todayUsed: Number(initialData?.todayUsed ?? 0),
    todayBudget: Number(initialData?.todayBudget ?? 0),
    weekUsed: Number(initialData?.weekUsed ?? 0),
    weekBudget: Number(initialData?.weekBudget ?? 0),
    usageDocUrl: initialData?.usageDocUrl,
    usageFetchFailed: initialData?.usageFetchFailed,
  }));

  // 计算占比及状态色
  const todayPct = useMemo(() => Math.min(100, Math.round((data.todayUsed / Math.max(1, data.todayBudget)) * 100)), [data]);
  const weekPct = useMemo(() => Math.min(100, Math.round((data.weekUsed / Math.max(1, data.weekBudget)) * 100)), [data]);
  const pctTone = (pct: number) => pct >= 95 ? 'text-red-600' : pct >= 80 ? 'text-orange-600' : 'text-honey-700';

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(data.apiKey);
      showToast.success('API Key 已复制');
    } catch (e) {
      console.error('复制 API Key 失败', e);
      showToast.error('复制失败，请手动复制');
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const next = await AppCodexService.getInfo();
      setData(next);
      setFatal(null);
    } catch (e: any) {
      if ((e && e.__codexErrorCode) === 9503) {
        // 9503：后端调用异常，友好提示
        setFatal('AI 工具用量数据获取异常，请稍后再试或联系管理员修复');
      } else {
        // 其他错误：静默失败（toast 由拦截器兜底）
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初次渲染拉一次（mock）
    // 后端就绪后替换为真实请求
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtUsd = (n: number) => `$${(Number(n) || 0).toFixed(2)}`;
  const showUsage = !data.usageFetchFailed && !fatal;

  return (
    <Card className={cn('p-5 border-0 shadow-lg bg-gradient-to-br from-honey-50 to-honey-100/40', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-honey-200">
            <Key className="h-4 w-4 text-honey-700" />
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">AI 工具使用</div>
            <div className="text-xs text-warm-gray-600">社区共享 Key，请勿外传</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(docsUrl || data.usageDocUrl) && (
            <Button size="sm" variant="outline" asChild>
              <a href={docsUrl || data.usageDocUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> 使用文档
              </a>
            </Button>
          )}
          <Button size="sm" variant="honeySoft" onClick={refresh} disabled={loading} className="shrink-0">
            <RefreshCw className={cn('h-4 w-4 mr-1', loading ? 'animate-spin' : '')} /> 刷新
          </Button>
        </div>
      </div>

      {/* Key 行 */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm">
          <span className="text-warm-gray-500 mr-2">API Key</span>
          <span className="font-mono bg-white/70 border border-honey-border px-2 py-0.5 rounded-md shadow-sm">
            {data.apiKey}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyKey}>
            <Copy className="h-4 w-4 mr-1" /> 复制
          </Button>
        </div>
      </div>

      {/* 用量 */}
      {showUsage ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="text-warm-gray-600">今日用量 / 日预算</div>
              <div className={cn('font-semibold', pctTone(todayPct))}>{fmtUsd(data.todayUsed)} / {fmtUsd(data.todayBudget)}</div>
            </div>
            <Progress value={todayPct} className="h-2 bg-honey-200" />
            <div className="text-xs text-warm-gray-500">已用 {todayPct}%</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="text-warm-gray-600">本周用量 / 周预算</div>
              <div className={cn('font-semibold', pctTone(weekPct))}>{fmtUsd(data.weekUsed)} / {fmtUsd(data.weekBudget)}</div>
            </div>
            <Progress value={weekPct} className="h-2 bg-honey-200" />
            <div className="text-xs text-warm-gray-500">已用 {weekPct}%</div>
          </div>
        </div>
      ) : (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>用量暂不可用</AlertTitle>
          <AlertDescription className="text-xs text-warm-gray-600">
            后端用量查询暂时不可用，但 API Key 正常。您仍可按文档使用；我们会尽快修复展示。
          </AlertDescription>
        </Alert>
      )}

      {fatal && (
        <Alert variant="destructive" className="mt-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>数据获取异常</AlertTitle>
          <AlertDescription className="text-xs text-warm-gray-600">{fatal}</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
