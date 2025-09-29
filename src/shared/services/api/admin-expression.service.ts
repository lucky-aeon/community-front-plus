import { apiClient, type ApiResponse } from './config';
import type { AdminExpressionDTO, ExpressionQueryRequest, PageResponse, ExpressionStatus, CreateExpressionRequest, UpdateExpressionRequest } from '@shared/types';

/**
 * 管理员表情管理服务
 * 对接 AdminExpressionController
 * 约定接口：
 * - GET    /api/admin/expressions                      分页列表
 * - POST   /api/admin/expressions                      新建
 * - PUT    /api/admin/expressions/{id}                 更新
 * - DELETE /api/admin/expressions/{id}                 删除
 * - PUT    /api/admin/expressions/{id}/status          更新状态 { status }
 * - PUT    /api/admin/expressions/{id}/sort-order      更新排序 ?sortOrder=1
 */
export class AdminExpressionService {
  static async getExpressions(params: ExpressionQueryRequest = {}): Promise<PageResponse<AdminExpressionDTO>> {
    type RawPage = {
      records?: AdminExpressionDTO[];
      total?: number;
      pageNum?: number;
      pageSize?: number;
      pages?: number;
    };
    const res = await apiClient.get<ApiResponse<RawPage>>('/admin/expressions', { params });
    const data = res.data.data || {} as RawPage;
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

  static async createExpression(req: CreateExpressionRequest): Promise<AdminExpressionDTO> {
    const res = await apiClient.post<ApiResponse<AdminExpressionDTO>>('/admin/expressions', req);
    return res.data.data;
  }

  static async updateExpression(id: string, req: UpdateExpressionRequest): Promise<AdminExpressionDTO> {
    const res = await apiClient.put<ApiResponse<AdminExpressionDTO>>(`/admin/expressions/${encodeURIComponent(id)}`, req);
    return res.data.data;
  }

  static async deleteExpression(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/expressions/${encodeURIComponent(id)}`);
  }

  static async updateStatus(id: string, status: ExpressionStatus): Promise<AdminExpressionDTO> {
    const res = await apiClient.put<ApiResponse<AdminExpressionDTO>>(`/admin/expressions/${encodeURIComponent(id)}/status`, { status });
    return res.data.data;
  }

  static async updateSortOrder(id: string, sortOrder: number): Promise<AdminExpressionDTO> {
    const res = await apiClient.put<ApiResponse<AdminExpressionDTO>>(`/admin/expressions/${encodeURIComponent(id)}/sort-order`, null, { params: { sortOrder } });
    return res.data.data;
  }
}

