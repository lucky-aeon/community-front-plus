import { apiClient, ApiResponse } from './config';
import { SubscriptionPlanDTO } from '@shared/types';

/**
 * 公开套餐查询服务（用于营销首页等公开场景）
 * 对应后端 PublicSubscriptionPlanController
 */
export class PublicSubscriptionPlansService {
  private static readonly BASE_PATH = '/public/subscription-plans';

  /** 获取公开可见的套餐列表 */
  static async getPlans(): Promise<SubscriptionPlanDTO[]> {
    const resp = await apiClient.get<ApiResponse<SubscriptionPlanDTO[]>>(this.BASE_PATH, {
      // 避免未登录触发全局401处理
      headers: { 'X-Skip-Auth-Logout': 'true' },
    } as unknown as { headers: Record<string, string> });
    return resp.data.data;
  }
}

