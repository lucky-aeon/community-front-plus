import { apiClient, type ApiResponse } from './config';
import type { ChatRoomDTO, CreateChatRoomRequest, PageResponse, ChatRoomMemberDTO, ChatUnreadInfoDTO } from '@shared/types';

/**
 * 聊天室 API（用户态）
 * - 列表：GET  /api/app/chat/rooms
 * - 创建：POST /api/app/chat/rooms
 */
export class ChatRoomsService {
  private static readonly BASE = '/app/chat-rooms';

  /** 获取聊天室列表（简单列表或分页，后端可兼容返回 PageResponse） */
  static async listRooms(params: { pageNum?: number; pageSize?: number; nameLike?: string } = {}): Promise<PageResponse<ChatRoomDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<ChatRoomDTO>>>(this.BASE, { params });
    return resp.data.data as unknown as PageResponse<ChatRoomDTO>;
  }

  /** 创建聊天室（管理员可选择可见套餐） */
  static async createRoom(request: CreateChatRoomRequest): Promise<ChatRoomDTO> {
    const resp = await apiClient.post<ApiResponse<ChatRoomDTO>>(this.BASE, request);
    return resp.data.data;
  }

  /** 加入聊天室 */
  static async joinRoom(roomId: string): Promise<void> {
    await apiClient.post(`${this.BASE}/${encodeURIComponent(roomId)}/join`);
  }

  /** 房间成员列表（含在线状态） */
  static async listMembers(roomId: string): Promise<ChatRoomMemberDTO[]> {
    const resp = await apiClient.get<ApiResponse<ChatRoomMemberDTO[]>>(`${this.BASE}/${encodeURIComponent(roomId)}/members`);
    return resp.data.data || [];
  }

  /** 获取房间未读消息数量 */
  static async getUnreadCount(roomId: string): Promise<number> {
    const resp = await apiClient.get<ApiResponse<number>>(`${this.BASE}/${encodeURIComponent(roomId)}/unread-count`);
    const n = Number(resp.data?.data ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  /** 访问房间（清零未读，更新 lastSeen）。可带锚点：anchorId 或 anchorTime */
  static async visitRoom(roomId: string, opts?: { anchorId?: string; anchorTime?: string }): Promise<void> {
    const params: Record<string, string> = {};
    if (opts?.anchorId) params.anchorId = opts.anchorId;
    if (opts?.anchorTime) params.anchorTime = opts.anchorTime;
    await apiClient.put(`${this.BASE}/${encodeURIComponent(roomId)}/visit`, undefined, { params });
  }

  /** 未读信息（数量 + 锚点） */
  static async getUnreadInfo(roomId: string): Promise<ChatUnreadInfoDTO> {
    const resp = await apiClient.get<ApiResponse<ChatUnreadInfoDTO>>(`${this.BASE}/${encodeURIComponent(roomId)}/unread-info`);
    const data = resp.data?.data || { count: 0 };
    return {
      count: Math.max(0, Number((data as any).count) || 0),
      firstUnreadId: (data as any).firstUnreadId || null,
      firstUnreadOccurredAt: (data as any).firstUnreadOccurredAt || null,
    };
  }

  /** 退出房间（与关闭对话框不同，真正离开房间） */
  static async leaveRoom(roomId: string): Promise<void> {
    await apiClient.post(`${this.BASE}/${encodeURIComponent(roomId)}/leave`);
  }

  /** 删除房间（仅房主） */
  static async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(`${this.BASE}/${encodeURIComponent(roomId)}`);
  }
}
