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
    // 按规范将请求字段由驼峰转换为下划线
    const payload = {
      client_id: request.clientId,
      redirect_uri: request.redirectUri,
      response_type: request.responseType,
      scope: request.scope,
      state: request.state,
      code_challenge: request.codeChallenge,
      code_challenge_method: request.codeChallengeMethod,
      approved: request.approved,
    };
    const response = await apiClient.post<ApiResponse<string>>('/public/oauth2/authorize', payload);
    return response.data.data;
  }

  /**
   * 获取客户端信息
   * 用于在授权页面展示客户端详情
   */
  static async getClientInfo(clientId: string): Promise<OAuth2ClientInfo> {
    const response = await apiClient.get<ApiResponse<any>>(`/public/oauth2/clients/${clientId}`);
    const data = response.data.data || {};
    // 公开接口已切换为下划线命名，做统一映射为前端驼峰 DTO
    const mapped: OAuth2ClientInfo = {
      id: data.id ?? '',
      clientId: data.client_id ?? data.clientId ?? '',
      clientName: data.client_name ?? data.clientName ?? '',
      redirectUris: data.redirect_uris ?? data.redirectUris ?? [],
      scopes: Array.isArray(data.scopes) ? data.scopes : (typeof data.scopes === 'string' ? data.scopes.split(' ') : []),
      requireAuthorizationConsent: data.require_authorization_consent ?? data.requireAuthorizationConsent ?? false,
      createTime: data.create_time ?? data.createTime ?? '',
    };
    return mapped;
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
