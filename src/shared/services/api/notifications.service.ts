import { apiClient, ApiResponse } from './config';
import type {
  UserNotificationDTO,
  NotificationQueryRequest,
  PageResponse,
  UnreadCountResponse,
} from '@shared/types';

/**
 * 用户通知（消息中心）API
 * 对应后端 UserNotificationController
 */
export class NotificationsService {
  private static readonly BASE_PATH = '/user/notifications';

  /** 获取通知列表（分页） */
  static async getNotifications(params: NotificationQueryRequest = {}): Promise<PageResponse<UserNotificationDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<UserNotificationDTO>>>(this.BASE_PATH, { params });
    return resp.data.data;
  }

  /** 未读数量 */
  static async getUnreadCount(): Promise<number> {
    const url = `${this.BASE_PATH}/unread-count`;
    const resp = await apiClient.get<ApiResponse<UnreadCountResponse>>(url);
    return resp.data.data?.unreadCount ?? 0;
  }

  /** 标记单条为已读 */
  static async markAsRead(id: string): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/${id}/read`);
  }

  /** 全部标记已读 */
  static async markAllAsRead(): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/read-all`);
  }

  /** 删除单条通知 */
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /** 清空所有已读通知（后端两种可能路径，优先 clear-read，失败则尝试 read） */
  static async clearRead(): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/clear-read`);
    } catch {
      await apiClient.delete(`${this.BASE_PATH}/read`);
    }
  }
}
