import type { AiToolSummaryDTO } from '@shared/types';
import { AppCodexPersistentService } from './app-codex-p.service';

/**
 * 前台 AI 工具使用摘要（共享 Key）
 * - 使用真实的 /app/codex-p/infos 与 /app/codex-p/info
 */
export class AppAiToolService {
  static async getSummary(): Promise<AiToolSummaryDTO> {
    const list = await AppCodexPersistentService.listInfos();
    const summary = list[0] || await AppCodexPersistentService.getInfo();
    return summary || {
      apiKey: '',
      todayUsed: 0,
      todayBudget: 0,
      weekUsed: 0,
      weekBudget: 0,
    };
  }
}
