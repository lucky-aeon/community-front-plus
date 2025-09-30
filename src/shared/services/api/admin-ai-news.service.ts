import { apiClient, type ApiResponse } from './config';
import type { PageResponse } from '@shared/types';
import type { AdminDailyItemDTO, AdminDailyQueryRequest, IngestResult, DailyItemStatus } from '@shared/types';

/**
 * 管理员 AI 日报管理服务
 */
export class AdminAiNewsService {
  /**
   * 分页查询 AI 日报
   * GET /api/admin/ai-news
   */
  static async page(params: AdminDailyQueryRequest = {}): Promise<PageResponse<AdminDailyItemDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminDailyItemDTO>>>('/admin/ai-news', {
      params: {
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.date ? { date: params.date } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(typeof params.withContent === 'boolean' ? { withContent: params.withContent } : {}),
      }
    });
    return response.data.data;
  }

  /**
   * 手动采集最新 AI 日报
   * POST /api/admin/ai-news/ingest
   */
  static async ingest(): Promise<IngestResult> {
    const response = await apiClient.post<ApiResponse<IngestResult>>('/admin/ai-news/ingest');
    return response.data.data;
  }

  /**
   * 发布某条日报
   * POST /api/admin/ai-news/{id}/publish
   */
  static async publish(id: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/admin/ai-news/${id}/publish`);
  }

  /**
   * 隐藏某条日报
   * POST /api/admin/ai-news/{id}/hide
   */
  static async hide(id: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/admin/ai-news/${id}/hide`);
  }

  /**
   * 获取状态描述
   */
  static getStatusDescription(status: DailyItemStatus): string {
    const map: Record<DailyItemStatus, string> = {
      PUBLISHED: '已发布',
      HIDDEN: '隐藏',
    };
    return map[status] || status;
  }
}

