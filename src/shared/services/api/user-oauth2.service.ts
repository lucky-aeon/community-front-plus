import { apiClient, ApiResponse, PageResponse } from './config';
import type { UserAuthorizationDTO, GetUserAuthorizationsRequest } from '@shared/types';

/**
 * 用户 OAuth2 授权管理服务
 */
export class UserOAuth2Service {
  /**
   * 获取用户已授权的应用列表（分页）
   */
  static async getUserAuthorizations(
    params: GetUserAuthorizationsRequest
  ): Promise<PageResponse<UserAuthorizationDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<UserAuthorizationDTO>>>(
      '/user/oauth2/authorizations',
      { params }
    );
    return response.data.data;
  }

  /**
   * 撤销对某个应用的授权
   * @param clientId 客户端ID
   */
  static async revokeAuthorization(clientId: string): Promise<void> {
    await apiClient.delete(`/user/oauth2/authorizations/${clientId}`);
  }
}
