import { apiClient, type ApiResponse } from './config';
import type { UnreadSummaryDTO, UnreadChannel } from '@shared/types';

/**
 * 列表级未读（文章/题目）接口
 * - GET  /api/user/unread/summary
 * - PUT  /api/user/unread/visit?channel=POSTS|QUESTIONS
 */
export class UnreadService {
  private static readonly BASE = '/user/unread';

  /** 获取未读汇总（导航展示） */
  static async getSummary(): Promise<UnreadSummaryDTO> {
    const resp = await apiClient.get<ApiResponse<UnreadSummaryDTO>>(`${this.BASE}/summary`);
    const data = resp.data?.data || { postsUnread: 0, questionsUnread: 0, chaptersUnread: 0 };
    return {
      postsUnread: Math.max(0, Number(data.postsUnread) || 0),
      questionsUnread: Math.max(0, Number(data.questionsUnread) || 0),
      chaptersUnread: Math.max(0, Number(data.chaptersUnread) || 0),
    };
  }

  /** 进入频道列表清零（幂等） */
  static async visit(channel: UnreadChannel): Promise<void> {
    await apiClient.put(`${this.BASE}/visit`, undefined, { params: { channel } });
  }
}
