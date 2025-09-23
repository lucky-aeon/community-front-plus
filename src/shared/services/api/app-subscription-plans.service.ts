import { apiClient, ApiResponse } from './config';
import { SubscriptionPlanDTO } from '@shared/types';

/**
 * App 端套餐查询服务（面向用户的可购买套餐）
 * 对应后端 AppSubscriptionPlanController
 */
export class AppSubscriptionPlansService {
  private static readonly BASE_PATH = '/app/subscription-plans';

  /**
   * 获取可用套餐列表（仅返回启用中的套餐，后端负责过滤与排序）
   */
  static async getPlans(): Promise<SubscriptionPlanDTO[]> {
    const resp = await apiClient.get<ApiResponse<SubscriptionPlanDTO[]>>(this.BASE_PATH);
    return resp.data.data;
  }
}

