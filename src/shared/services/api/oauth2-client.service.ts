/**
 * OAuth2 客户端管理服务
 */
import { apiClient } from './config';
import type {
  OAuth2ClientDTO,
  CreateOAuth2ClientRequest,
  UpdateOAuth2ClientRequest,
  OAuth2ClientQueryRequest,
  PageResponse,
  ApiResponse,
} from '@shared/types';

export class OAuth2ClientService {
  /**
   * 创建 OAuth2 客户端
   * @param request 创建请求参数
   * @returns 包含客户端信息和密钥的响应（密钥仅此一次返回）
   */
  static async createClient(request: CreateOAuth2ClientRequest): Promise<{ client: OAuth2ClientDTO; clientSecret: string }> {
    const response = await apiClient.post<ApiResponse<{ client: OAuth2ClientDTO; clientSecret: string }>>(
      '/admin/oauth2/clients',
      request
    );
    return response.data.data;
  }

  /**
   * 更新 OAuth2 客户端
   * @param clientId 客户端主键ID
   * @param request 更新请求参数
   * @returns 更新后的客户端信息
   */
  static async updateClient(clientId: string, request: UpdateOAuth2ClientRequest): Promise<OAuth2ClientDTO> {
    const response = await apiClient.put<ApiResponse<OAuth2ClientDTO>>(
      `/admin/oauth2/clients/${clientId}`,
      request
    );
    return response.data.data;
  }

  /**
   * 重新生成客户端密钥
   * @param clientId 客户端主键ID
   * @returns 包含新密钥的响应（新密钥仅此一次返回）
   */
  static async regenerateClientSecret(clientId: string): Promise<{ clientId: string; clientSecret: string }> {
    const response = await apiClient.post<ApiResponse<{ clientId: string; clientSecret: string }>>(
      `/admin/oauth2/clients/${clientId}/regenerate-secret`
    );
    return response.data.data;
  }

  /**
   * 获取 OAuth2 客户端详情
   * @param clientId 客户端主键ID
   * @returns 客户端详情
   */
  static async getClientById(clientId: string): Promise<OAuth2ClientDTO> {
    const response = await apiClient.get<ApiResponse<OAuth2ClientDTO>>(
      `/admin/oauth2/clients/${clientId}`
    );
    return response.data.data;
  }

  /**
   * 分页查询 OAuth2 客户端列表
   * @param request 查询请求参数
   * @returns 分页结果
   */
  static async getPagedClients(request: OAuth2ClientQueryRequest): Promise<PageResponse<OAuth2ClientDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<OAuth2ClientDTO>>>(
      '/admin/oauth2/clients',
      { params: request }
    );
    return response.data.data;
  }

  /**
   * 删除 OAuth2 客户端
   * @param clientId 客户端主键ID
   */
  static async deleteClient(clientId: string): Promise<void> {
    await apiClient.delete(`/admin/oauth2/clients/${clientId}`);
  }

  /**
   * 激活 OAuth2 客户端
   * @param clientId 客户端主键ID
   */
  static async activateClient(clientId: string): Promise<void> {
    await apiClient.post(`/admin/oauth2/clients/${clientId}/activate`);
  }

  /**
   * 暂停 OAuth2 客户端
   * @param clientId 客户端主键ID
   */
  static async suspendClient(clientId: string): Promise<void> {
    await apiClient.post(`/admin/oauth2/clients/${clientId}/suspend`);
  }

  /**
   * 撤销 OAuth2 客户端
   * @param clientId 客户端主键ID
   */
  static async revokeClient(clientId: string): Promise<void> {
    await apiClient.post(`/admin/oauth2/clients/${clientId}/revoke`);
  }
}
