import { apiClient, type ApiResponse } from './config';
import type { DashboardMetricsDTO, DashboardTimeRange } from '@shared/types';

export class AdminMetricsService {
  /**
   * 获取仪表盘聚合指标
   * GET /api/admin/metrics/dashboard?timeRange=DAY|WEEK|MONTH&days=30
   */
  static async getDashboardMetrics(params: { timeRange?: DashboardTimeRange; days?: number } = {}): Promise<DashboardMetricsDTO> {
    const response = await apiClient.get<ApiResponse<DashboardMetricsDTO>>('/admin/metrics/dashboard', {
      params: {
        ...(params.timeRange ? { timeRange: params.timeRange } : {}),
        ...(typeof params.days === 'number' ? { days: params.days } : {}),
      }
    });
    return response.data.data as DashboardMetricsDTO;
  }
}

export default AdminMetricsService;

