import { apiClient, type ApiResponse } from './config';

/**
 * 用户访问相关能力：拉取当前用户可见的菜单码
 */
export class UserAccessService {
  // 获取当前用户菜单码（并集）
  static async getUserMenuCodes(): Promise<string[]> {
    const resp = await apiClient.get<ApiResponse<string[]>>('/user/menu-codes');
    return resp.data.data || [];
  }
}

