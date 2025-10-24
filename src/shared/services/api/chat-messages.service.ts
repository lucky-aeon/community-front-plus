import { apiClient, type ApiResponse } from './config';
import type { ChatMessageDTO, PageResponse, SendMessageRequest } from '@shared/types';

/**
 * 聊天消息 API
 * Base: /api/app/chat-rooms/{roomId}
 */
export class ChatMessagesService {
  /** 分页查询房间消息（后端按 create_time DESC, id DESC 返回） */
  static async pageMessages(
    roomId: string,
    params: { pageNum?: number; pageSize?: number } = {}
  ): Promise<PageResponse<ChatMessageDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<ChatMessageDTO>>>(
      `/app/chat-rooms/${encodeURIComponent(roomId)}/messages`,
      { params: { pageNum: params.pageNum ?? 1, pageSize: params.pageSize ?? 20 } }
    );
    return resp.data.data;
  }

  /** 发送消息 */
  static async sendMessage(roomId: string, request: SendMessageRequest): Promise<ChatMessageDTO> {
    const resp = await apiClient.post<ApiResponse<ChatMessageDTO>>(`/app/chat-rooms/${encodeURIComponent(roomId)}/messages`, request);
    return resp.data.data;
  }
}
