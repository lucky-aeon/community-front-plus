import { apiClient, type ApiResponse } from './config';
import type { AiToolSummaryDTO } from '@shared/types';

/**
 * 前台 AI 工具使用摘要（共享 Key）
 * - GET /app/ai-tool/summary
 */
export class AppAiToolService {
  static async getSummary(): Promise<AiToolSummaryDTO> {
    const resp = await apiClient.get<ApiResponse<AiToolSummaryDTO>>('/app/ai-tool/summary');
    const d = resp.data?.data as Partial<AiToolSummaryDTO> | undefined;
    return {
      apiKey: String(d?.apiKey || ''),
      todayUsed: Math.max(0, Number(d?.todayUsed || 0)),
      todayBudget: Math.max(0, Number(d?.todayBudget || 0)),
      weekUsed: Math.max(0, Number(d?.weekUsed || 0)),
      weekBudget: Math.max(0, Number(d?.weekBudget || 0)),
    };
  }
}

