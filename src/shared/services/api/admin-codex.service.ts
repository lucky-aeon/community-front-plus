import { apiClient, type ApiResponse } from './config';
import type { CodexConfigDTO } from '@shared/types';

/** 管理端 Codex 配置服务 */
export class AdminCodexService {
  private static readonly BASE = '/admin/codex';

  /** 获取配置 */
  static async getConfig(): Promise<CodexConfigDTO> {
    const resp = await apiClient.get<ApiResponse<CodexConfigDTO>>(`${this.BASE}/config`);
    return resp.data?.data || {};
  }

  /** 更新配置 */
  static async updateConfig(payload: CodexConfigDTO): Promise<CodexConfigDTO> {
    const resp = await apiClient.put<ApiResponse<CodexConfigDTO>>(`${this.BASE}/config`, payload);
    return resp.data?.data || {};
  }
}

