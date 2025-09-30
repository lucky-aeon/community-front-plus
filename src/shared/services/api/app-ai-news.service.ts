import { apiClient, type ApiResponse } from './config';
import type { PageResponse } from '@shared/types';
import type { HistoryDateDTO, FrontDailyItemDTO, DailyQueryRequest } from '@shared/types';

/**
 * 用户前台 AI 日报服务
 */
export class AppAiNewsService {
  /** 历史日期列表 */
  static async getHistoryDates(): Promise<HistoryDateDTO[]> {
    const resp = await apiClient.get<ApiResponse<HistoryDateDTO[]>>('/app/ai-news/dates');
    return resp.data.data;
  }

  /** 指定日期分页列表（date 为空则由后端取最新日期） */
  static async getDaily(params: DailyQueryRequest = {}): Promise<PageResponse<FrontDailyItemDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<FrontDailyItemDTO>>>('/app/ai-news/daily', {
      params: {
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.date ? { date: params.date } : {}),
        ...(typeof params.withContent === 'boolean' ? { withContent: params.withContent } : {}),
      }
    });
    return resp.data.data;
  }

  /** 详情（包含 content） */
  static async getDetail(id: string): Promise<FrontDailyItemDTO> {
    const resp = await apiClient.get<ApiResponse<FrontDailyItemDTO>>(`/app/ai-news/detail/${encodeURIComponent(id)}`);
    return resp.data.data;
  }
}

