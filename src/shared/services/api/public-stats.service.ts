import { apiClient } from './config';

/**
 * 公开统计服务
 */
export class PublicStatsService {
  /** 获取活跃学员/用户总数 */
  static async getUsersTotalCount(): Promise<number> {
    const resp = await apiClient.get('/public/stats/users', {
      // 避免未登录触发全局401处理
      headers: { 'X-Skip-Auth-Logout': 'true' },
    } as unknown as { headers: Record<string, string> });
    const raw = resp?.data;
    // 兼容 { success, data: { totalCount } } 或 { code, data: { totalCount } }
    const total = raw?.data?.totalCount;
    return typeof total === 'number' ? total : 0;
  }
}

