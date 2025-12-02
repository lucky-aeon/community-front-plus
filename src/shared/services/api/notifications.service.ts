import { apiClient, ApiResponse } from './config';
import type {
  UserNotificationDTO,
  NotificationQueryRequest,
  PageResponse,
  UnreadCountResponse,
  NotificationType,
} from '@shared/types';

/**
 * 用户通知（消息中心）API
 * 对应后端 UserNotificationController
 */
export class NotificationsService {
  private static readonly BASE_PATH = '/user/notifications';

  /** 获取通知列表（分页） */
  static async getNotifications(params: NotificationQueryRequest = {}): Promise<PageResponse<UserNotificationDTO>> {
    // 服务端字段与前端DTO存在差异，这里统一做一次归一化
    const resp = await apiClient.get<ApiResponse<any>>(this.BASE_PATH, { params });
    const page = (resp.data?.data || {}) as Partial<PageResponse<unknown>> & { records?: any[] };
    const records = Array.isArray(page.records) ? page.records.map(this.normalizeRecord) : [];
    return {
      ...page,
      records,
    } as PageResponse<UserNotificationDTO>;
  }

  /** 未读数量 */
  static async getUnreadCount(): Promise<number> {
    const url = `${this.BASE_PATH}/unread-count`;
    const resp = await apiClient.get<ApiResponse<UnreadCountResponse>>(url);
    return Math.max(0, resp.data?.data?.unreadCount ?? 0);
  }

  /** 标记单条为已读 */
  static async markAsRead(id: string): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/${id}/read`);
    try { window.dispatchEvent(new CustomEvent('notifications:changed')); } catch { void 0; }
  }

  /** 全部标记已读 */
  static async markAllAsRead(): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/read-all`);
    try { window.dispatchEvent(new CustomEvent('notifications:changed')); } catch { void 0; }
  }

  /** 删除单条通知 */
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
    try { window.dispatchEvent(new CustomEvent('notifications:changed')); } catch { void 0; }
  }

  // 清空已读：后端未提供对应 API，移除此方法的对外使用

  // 将服务端记录结构映射为前端 UserNotificationDTO
  private static normalizeRecord(server: any): UserNotificationDTO {
    const status: string | undefined = server?.status;
    const read: boolean = typeof server?.read === 'boolean' ? server.read : status === 'READ';

    const typeMap: Record<string, NotificationType> = {
      COMMENT: 'COMMENT',
      REPLY: 'REPLY',
      LIKE: 'LIKE',
      FOLLOW: 'FOLLOW',
      SYSTEM: 'SYSTEM',
      NEW_FOLLOWER: 'FOLLOW',
    };
    const mappedType: NotificationType = typeMap[server?.type as string] ?? 'SYSTEM';

    return {
      id: String(server?.id ?? ''),
      type: mappedType,
      title: server?.title ?? '',
      content: server?.content ?? '',
      senderName: server?.senderName ?? undefined,
      senderAvatar: server?.senderAvatar ?? undefined,
      read,
      createTime: server?.createTime ?? new Date().toISOString(),
    };
  }
}
