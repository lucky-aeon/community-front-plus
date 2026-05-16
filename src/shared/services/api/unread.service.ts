import { apiClient, type ApiResponse } from './config';
import type { UnreadSummaryDTO, UnreadChannel } from '@shared/types';

/**
 * 列表级未读（文章/题目/课程章节）接口
 * - GET  /api/user/unread/summary
 * - GET  /api/user/unread/details
 * - PUT  /api/user/unread/visit?channel=POSTS|QUESTIONS|CHAPTERS
 */
export class UnreadService {
  private static readonly BASE = '/user/unread';

  /** 获取未读汇总（导航展示） */
  static async getSummary(): Promise<UnreadSummaryDTO> {
    const resp = await apiClient.get<ApiResponse<UnreadSummaryDTO>>(`${this.BASE}/summary`);
    const data = resp.data?.data || { postsUnread: 0, questionsUnread: 0, chaptersUnread: 0, chatsUnread: 0 };
    return {
      postsUnread: Math.max(0, Number((data as any).postsUnread) || 0),
      questionsUnread: Math.max(0, Number((data as any).questionsUnread) || 0),
      chaptersUnread: Math.max(0, Number((data as any).chaptersUnread) || 0),
      // 新增：聚合聊天室未读（后端字段 chatsUnread）
      chatsUnread: Math.max(0, Number((data as any).chatsUnread) || 0),
    };
  }

  /** 获取未读详情（聚合数量 + 最近未读内容ID） */
  static async getDetails(): Promise<UnreadSummaryDTO> {
    const resp = await apiClient.get<ApiResponse<UnreadSummaryDTO>>(`${this.BASE}/details`);
    const data = resp.data?.data || { postsUnread: 0, questionsUnread: 0, chaptersUnread: 0, chatsUnread: 0 };
    return {
      postsUnread: Math.max(0, Number((data as any).postsUnread) || 0),
      questionsUnread: Math.max(0, Number((data as any).questionsUnread) || 0),
      chaptersUnread: Math.max(0, Number((data as any).chaptersUnread) || 0),
      chatsUnread: Math.max(0, Number((data as any).chatsUnread) || 0),
      postIds: Array.isArray((data as any).postIds) ? (data as any).postIds : [],
      questionIds: Array.isArray((data as any).questionIds) ? (data as any).questionIds : [],
      chapterIds: Array.isArray((data as any).chapterIds) ? (data as any).chapterIds : [],
    };
  }

  /** 进入频道列表清零（幂等） */
  static async visit(channel: UnreadChannel): Promise<void> {
    await apiClient.put(`${this.BASE}/visit`, undefined, { params: { channel } });
  }
}
