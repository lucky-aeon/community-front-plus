import { apiClient, type ApiResponse } from './config';
import type { AiToolSummaryDTO } from '@shared/types';

/**
 * 前台 Codex 公共信息
 * - GET /app/codex/info
 */
export class AppCodexService {
  static async getInfo(): Promise<AiToolSummaryDTO> {
    const resp = await apiClient.get<ApiResponse<{
      apiKey?: string;
      weeklySpentUsd?: string;
      weeklyBudgetUsd?: string;
      dailySpentUsd?: string;
      dailyBudgetUsd?: string;
      usageDocUrl?: string;
      weeklyWindowStart?: string;
      weeklyWindowEnd?: string;
    }>>('/app/codex/info');
    const body = resp.data as ApiResponse<any> | undefined;
    if (body && Number(body.code) === 9503) {
      const err = new Error(body.message || 'Codex 数据获取异常');
      (err as any).__codexErrorCode = 9503;
      throw err;
    }
    const d = body?.data || {};
    const parse = (s?: string) => {
      const n = Number(String(s || '').trim());
      return isNaN(n) ? 0 : n;
    };
    return {
      apiKey: String(d.apiKey || ''),
      todayUsed: parse(d.dailySpentUsd),
      todayBudget: parse(d.dailyBudgetUsd),
      weekUsed: parse(d.weeklySpentUsd),
      weekBudget: parse(d.weeklyBudgetUsd),
      usageDocUrl: d.usageDocUrl ? String(d.usageDocUrl) : undefined,
      usageFetchFailed: Boolean(d.usageFetchFailed === true),
      weeklyWindowStart: d.weeklyWindowStart ? String(d.weeklyWindowStart) : undefined,
      weeklyWindowEnd: d.weeklyWindowEnd ? String(d.weeklyWindowEnd) : undefined,
    };
  }
}
