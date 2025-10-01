import { apiClient, type ApiResponse } from './config';
import type { PageResponse } from '@shared/types';
import type { FrontDailyItemDTO, DailyQueryRequest, TodayDailyDTO, HistoryOverviewDTO } from '@shared/types';

/**
 * 用户前台 AI 日报服务
 */
export class AppAiNewsService {
  /** 今日摘要（不含详情）：返回 date 与当日全部 titles */
  static async getToday(): Promise<TodayDailyDTO> {
    const resp = await apiClient.get<ApiResponse<TodayDailyDTO>>('/app/ai-news/today');
    return resp.data.data;
  }

  /** 往期概览分页（排除最新）：title/date/count */
  static async pageHistory(params: { pageNum?: number; pageSize?: number } = {}): Promise<PageResponse<HistoryOverviewDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<HistoryOverviewDTO>>>('/app/ai-news/history', {
      params: {
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10,
      }
    });
    return resp.data.data;
  }

  /** 指定日期分页列表（必须提供 date，服务端将返回含 content） */
  static async getDailyByDate(params: Required<Pick<DailyQueryRequest, 'date'>> & { pageNum?: number; pageSize?: number }): Promise<PageResponse<FrontDailyItemDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<FrontDailyItemDTO>>>('/app/ai-news/daily', {
      params: {
        date: params.date,
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10,
      }
    });
    return resp.data.data;
  }

  /**
   * 兼容旧版：根据ID获取详情
   * 若后端无对应接口，将返回 404。建议前端改为按日期视图展示。
   */
  static async getDetail(id: string): Promise<FrontDailyItemDTO> {
    const resp = await apiClient.get<ApiResponse<FrontDailyItemDTO>>(`/app/ai-news/detail/${encodeURIComponent(id)}`);
    return resp.data.data;
  }
}
