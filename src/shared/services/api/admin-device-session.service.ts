import { apiClient, ApiResponse } from './config';
import { PageResponse } from '@shared/types';
import type { AdminDeviceSessionQueryRequest, UserSessionSummaryDTO, TokenBlacklistStatsDTO, BlacklistQueryRequest, BlacklistedUserDTO } from '@shared/types';

/**
 * 管理端设备会话服务
 * 映射后端 AdminDeviceSessionController 接口
 */
export class AdminDeviceSessionService {
  /**
   * 分页查询用户设备会话
   * GET /api/admin/users/sessions
   */
  static async getUserSessions(params: AdminDeviceSessionQueryRequest = {}): Promise<PageResponse<UserSessionSummaryDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<UserSessionSummaryDTO>>>('/admin/users/sessions', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...params.userId && { userId: params.userId },
        ...params.username && { username: params.username },
        ...params.ip && { ip: params.ip }
      }
    });
    return response.data.data;
  }

  /**
   * 强制下线指定用户的某个 IP 会话
   * DELETE /api/admin/users/{userId}/sessions/ip/{ip}
   */
  static async forceRemoveUserSession(userId: string, ip: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/users/${encodeURIComponent(userId)}/sessions/ip/${encodeURIComponent(ip)}`);
  }

  /**
   * 强制下线指定用户的所有会话
   * DELETE /api/admin/users/{userId}/sessions/all
   */
  static async forceRemoveAllUserSessions(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/users/${encodeURIComponent(userId)}/sessions/all`);
  }

  /**
   * 获取 Token 黑名单统计信息
   * GET /api/admin/users/blacklist/stats
   */
  static async getTokenBlacklistStats(): Promise<TokenBlacklistStatsDTO> {
    const res = await apiClient.get<ApiResponse<TokenBlacklistStatsDTO>>('/admin/users/blacklist/stats');
    return res.data.data;
  }

  /**
   * 清空 Token 黑名单
   * DELETE /api/admin/users/blacklist/clear
   */
  static async clearTokenBlacklist(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>('/admin/users/blacklist/clear');
  }

  /**
   * 分页查询黑名单用户
   * GET /api/admin/users/blacklist
   */
  static async getBlacklistedUsers(params: BlacklistQueryRequest = {}): Promise<PageResponse<BlacklistedUserDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<BlacklistedUserDTO>>>('/admin/users/blacklist', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...params.username && { username: params.username },
        ...params.email && { email: params.email },
      }
    });
    return response.data.data;
  }

  /**
   * 从黑名单移除指定用户
   * DELETE /api/admin/users/blacklist/{userId}
   */
  static async removeUserFromBlacklist(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/users/blacklist/${encodeURIComponent(userId)}`);
  }
}
