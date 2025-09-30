import { apiClient, type ApiResponse } from './config';
import type { AdminExpressionDTO, ExpressionQueryRequest, PageResponse, CreateExpressionRequest, UpdateExpressionRequest } from '@shared/types';

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
    const res = await apiClient.get<ApiResponse<PageResponse<AdminExpressionDTO>>>('/admin/expressions', { params });
    return res.data.data as PageResponse<AdminExpressionDTO>;
  }

  static async createExpression(req: CreateExpressionRequest): Promise<AdminExpressionDTO> {
    const body: any = {
      code: req.code,
      name: req.name,
      imageUrl: req.imageUrl,
    };
    if (typeof req.sortOrder === 'number') body.sortOrder = req.sortOrder;
    const res = await apiClient.post<ApiResponse<AdminExpressionDTO>>('/admin/expressions', body);
    return res.data.data;
  }

  static async updateExpression(id: string, req: UpdateExpressionRequest): Promise<AdminExpressionDTO> {
    const body: any = {};
    if (typeof req.code === 'string') body.code = req.code;
    if (typeof req.name === 'string') body.name = req.name;
    if (typeof req.imageUrl === 'string') body.imageUrl = req.imageUrl;
    if (typeof req.sortOrder === 'number') body.sortOrder = req.sortOrder;
    const res = await apiClient.put<ApiResponse<AdminExpressionDTO>>(`/admin/expressions/${encodeURIComponent(id)}`, body);
    return res.data.data;
  }

  static async deleteExpression(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/expressions/${encodeURIComponent(id)}`);
  }

  // 启停切换
  static async toggle(id: string): Promise<boolean> {
    const res = await apiClient.put<ApiResponse<boolean>>(`/admin/expressions/${encodeURIComponent(id)}/toggle`);
    return Boolean(res.data?.data);
  }
}
