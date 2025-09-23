import { apiClient, type ApiResponse } from './config';
import type { ResourceDTO, ResourceQueryRequest, PageResponse } from '../../types';

/**
 * 管理员资源管理服务
 * GET /api/admin/resources
 */
export class AdminResourceService {
  static async getResources(
    params: ResourceQueryRequest = {}
  ): Promise<PageResponse<ResourceDTO>> {
    const res = await apiClient.get<ApiResponse<any>>('/admin/resources', {
      params,
    });
    const data = res.data.data as {
      records: ResourceDTO[];
      total: number;
      pageNum: number;
      pageSize: number;
      pages: number;
    };
    return {
      records: data.records || [],
      total: data.total || 0,
      size: data.pageSize || params.pageSize || 10,
      current: data.pageNum || params.pageNum || 1,
      pages: data.pages || 0,
      orders: [],
      optimizeCountSql: true,
      searchCount: true,
      optimizeJoinOfCountSql: false,
    };
  }
}

