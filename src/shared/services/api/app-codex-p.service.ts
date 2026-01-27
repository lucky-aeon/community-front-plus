import { apiClient, type ApiResponse } from './config';
import type { CodexPublicInstanceDTO, AiToolSummaryDTO } from '@shared/types';

/**
 * 前台 Codex 多实例公共信息
 * - GET /app/codex-p/info  兼容默认实例
 * - GET /app/codex-p/infos 列表
 */
export class AppCodexPersistentService {
  private static readonly BASE = '/app/codex-p';

  static async getInfo(): Promise<AiToolSummaryDTO> {
    const resp = await apiClient.get<ApiResponse<any>>(`${this.BASE}/info`);
    const body = resp.data as ApiResponse<any> | undefined;
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

  static async listInfos(): Promise<CodexPublicInstanceDTO[]> {
    const resp = await apiClient.get<ApiResponse<any[]>>(`${this.BASE}/infos`);
    const list = Array.isArray(resp.data?.data) ? resp.data!.data! : [];
    const parse = (s?: string) => {
      const n = Number(String(s || '').trim());
      return isNaN(n) ? 0 : n;
    };
    return list.map((d) => ({
      id: String(d.id || ''),
      name: String(d.name || ''),
      apiKey: String(d.apiKey || ''),
      todayUsed: parse(d.dailySpentUsd),
      todayBudget: parse(d.dailyBudgetUsd),
      weekUsed: parse(d.weeklySpentUsd),
      weekBudget: parse(d.weeklyBudgetUsd),
      usageDocUrl: d.usageDocUrl ? String(d.usageDocUrl) : undefined,
      usageFetchFailed: Boolean(d.usageFetchFailed === true),
      weeklyWindowStart: d.weeklyWindowStart ? String(d.weeklyWindowStart) : undefined,
      weeklyWindowEnd: d.weeklyWindowEnd ? String(d.weeklyWindowEnd) : undefined,
    }));
  }
}

