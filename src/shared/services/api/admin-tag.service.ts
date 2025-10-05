import { apiClient, type ApiResponse } from './config';
import type {
  PageResponse,
  TagDefinitionDTO,
  TagQueryRequest,
  CreateTagRequest,
  UpdateTagRequest,
  AddScopeRequest,
  ManualAssignRequest,
  ManualRevokeRequest,
  TagScopeDTO,
} from '@shared/types';

/**
 * 管理员标签管理服务
 * 对接 AdminTagController
 * 约定接口：
 * - GET    /api/admin/tags                      分页列表
 * - POST   /api/admin/tags                      新建
 * - PUT    /api/admin/tags/{id}                 更新
 * - POST   /api/admin/tags/{id}/scopes          添加作用域
 * - DELETE /api/admin/tags/scopes/{scopeId}     删除作用域
 * - POST   /api/admin/tags/assign               人工授予用户标签
 * - POST   /api/admin/tags/revoke               人工撤销用户标签
 */
export class AdminTagService {
  static async getTags(params: TagQueryRequest = {}): Promise<PageResponse<TagDefinitionDTO>> {
    const res = await apiClient.get<ApiResponse<PageResponse<TagDefinitionDTO>>>('/admin/tags', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...(params.name ? { name: params.name } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(typeof params.enabled === 'boolean' ? { enabled: params.enabled } : {}),
      },
    });
    return res.data.data as PageResponse<TagDefinitionDTO>;
  }

  static async createTag(req: CreateTagRequest): Promise<TagDefinitionDTO> {
    const res = await apiClient.post<ApiResponse<TagDefinitionDTO>>('/admin/tags', req);
    return res.data.data as TagDefinitionDTO;
  }

  static async updateTag(id: string, req: UpdateTagRequest): Promise<TagDefinitionDTO> {
    const res = await apiClient.put<ApiResponse<TagDefinitionDTO>>(`/admin/tags/${encodeURIComponent(id)}`, req);
    return res.data.data as TagDefinitionDTO;
  }

  static async addScope(id: string, req: AddScopeRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/admin/tags/${encodeURIComponent(id)}/scopes`, req);
  }

  static async getScopes(id: string): Promise<TagScopeDTO[]> {
    const res = await apiClient.get<ApiResponse<TagScopeDTO[]>>(`/admin/tags/${encodeURIComponent(id)}/scopes`);
    return (res.data?.data || []) as TagScopeDTO[];
  }

  static async removeScope(scopeId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/tags/scopes/${encodeURIComponent(scopeId)}`);
  }

  static async assign(req: ManualAssignRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/admin/tags/assign', req);
  }

  static async revoke(req: ManualRevokeRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/admin/tags/revoke', req);
  }
}

export default AdminTagService;
