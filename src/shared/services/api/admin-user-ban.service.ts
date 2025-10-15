import { apiClient, type ApiResponse } from './config';
import type { BannedUserDTO } from '@shared/types';

/**
 * 管理员 用户封禁 管理服务
 * 对应后端 AdminUserBanController
 * 路由前缀：/api/admin/user-ban
 */
export class AdminUserBanService {
  /**
   * 获取当前被封禁的用户列表（非分页）
   * GET /api/admin/user-ban
   */
  static async getBannedUsers(): Promise<BannedUserDTO[]> {
    const response = await apiClient.get<ApiResponse<BannedUserDTO[]>>('/admin/user-ban');
    return response.data.data;
  }

  /**
   * 解除指定用户的封禁
   * DELETE /api/admin/user-ban/{userId}
   */
  static async unbanUser(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/user-ban/${encodeURIComponent(userId)}`);
  }
}

