import { apiClient, ApiResponse } from './config';
import type { AuthorizeUrlDTO, OAuthAuthDTO, UserSocialBindStatusDTO } from '@shared/types/oauth';

export class GithubOAuthService {
  static async getAuthorizeUrl(): Promise<AuthorizeUrlDTO> {
    const resp = await apiClient.get<ApiResponse<AuthorizeUrlDTO>>('/public/oauth/github/url');
    return resp.data.data;
  }

  static async startAuthorizeRedirect(): Promise<void> {
    const { url } = await this.getAuthorizeUrl();
    window.location.assign(url);
  }

  static async publicCallback(code: string, state: string): Promise<OAuthAuthDTO> {
    const resp = await apiClient.get<ApiResponse<OAuthAuthDTO>>('/public/oauth/github/callback', {
      params: { code, state },
      // 回调阶段不要触发登出副作用
      headers: { 'X-Skip-Auth-Logout': 'true' },
    } as any);
    return resp.data.data;
  }

  static async getBindStatus(): Promise<UserSocialBindStatusDTO> {
    const resp = await apiClient.get<ApiResponse<UserSocialBindStatusDTO>>('/user/oauth/github/status');
    return resp.data.data;
  }

  static async bindGithub(code: string, state: string): Promise<UserSocialBindStatusDTO> {
    const resp = await apiClient.post<ApiResponse<UserSocialBindStatusDTO>>('/user/oauth/github/bind', { code, state });
    return resp.data.data;
  }

  static async unbindGithub(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/user/oauth/github/unbind');
  }
}
