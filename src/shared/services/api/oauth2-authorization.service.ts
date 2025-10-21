import { apiClient, ApiResponse } from './config';
import { OAuth2AuthorizeRequest, OAuth2ClientInfo } from '@shared/types';

/**
 * OAuth2 授权服务
 */
export class OAuth2AuthorizationService {
  /**
   * 生成授权码
   * 前端在用户同意授权后调用此接口
   */
  static async generateAuthorizationCode(
    request: OAuth2AuthorizeRequest
  ): Promise<string> {
    const response = await apiClient.post<ApiResponse<string>>('/public/oauth2/authorize', request);
    return response.data.data;
  }

  /**
   * 获取客户端信息
   * 用于在授权页面展示客户端详情
   */
  static async getClientInfo(clientId: string): Promise<OAuth2ClientInfo> {
    const response = await apiClient.get<ApiResponse<OAuth2ClientInfo>>(`/public/oauth2/clients/${clientId}`);
    return response.data.data;
  }

  /**
   * 检查用户是否已授权
   * 用于判断是否需要显示授权同意页面
   */
  static async checkConsent(clientId: string): Promise<{ consented: boolean; scopes: string[] }> {
    const response = await apiClient.get<ApiResponse<{ consented: boolean; scopes: string[] }>>(
      `/public/oauth2/consent?clientId=${clientId}`
    );
    return response.data.data;
  }
}
