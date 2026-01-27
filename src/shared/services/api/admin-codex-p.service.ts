import { apiClient, type ApiResponse } from './config';
import type { CodexConfigSetDTO, CodexInstanceDTO } from '@shared/types';

/** 管理端 Codex 持久化多实例服务 */
export class AdminCodexPersistentService {
  private static readonly BASE = '/admin/codex-p';

  /** 获取全部配置集（目前仅包含实例列表） */
  static async getAll(): Promise<CodexConfigSetDTO> {
    const resp = await apiClient.get<ApiResponse<CodexConfigSetDTO>>(`${this.BASE}/configs`);
    return resp.data?.data || { instances: [] };
  }

  /** 列出所有实例 */
  static async listInstances(): Promise<CodexInstanceDTO[]> {
    const resp = await apiClient.get<ApiResponse<CodexInstanceDTO[]>>(`${this.BASE}/instances`);
    return resp.data?.data || [];
  }

  /** 获取单个实例 */
  static async getInstance(id: string): Promise<CodexInstanceDTO> {
    const resp = await apiClient.get<ApiResponse<CodexInstanceDTO>>(`${this.BASE}/instances/${encodeURIComponent(id)}`);
    return resp.data?.data || {};
  }

  /** 创建实例 */
  static async createInstance(payload: CodexInstanceDTO): Promise<CodexInstanceDTO> {
    const resp = await apiClient.post<ApiResponse<CodexInstanceDTO>>(`${this.BASE}/instances`, payload);
    return resp.data?.data || {};
  }

  /** 更新实例 */
  static async updateInstance(id: string, payload: CodexInstanceDTO): Promise<CodexInstanceDTO> {
    const resp = await apiClient.put<ApiResponse<CodexInstanceDTO>>(`${this.BASE}/instances/${encodeURIComponent(id)}`, payload);
    return resp.data?.data || {};
  }

  /** 删除实例 */
  static async deleteInstance(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE}/instances/${encodeURIComponent(id)}`);
  }
}

