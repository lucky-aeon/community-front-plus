import { apiClient, type ApiResponse } from './config';
import type { MenuOptionDTO, UpdateSubscriptionPlanMenusRequest } from '@shared/types';

/**
 * 套餐-菜单绑定管理 API
 */
export class SubscriptionPlanMenusService {
  private static readonly BASE_PATH = '/admin/subscription-plan-menus';

  // 获取全部菜单选项
  static async getMenuOptions(): Promise<MenuOptionDTO[]> {
    const resp = await apiClient.get<ApiResponse<MenuOptionDTO[]>>(`${this.BASE_PATH}/options`);
    return resp.data.data;
  }

  // 获取指定套餐已绑定的菜单码
  static async getSubscriptionPlanMenuCodes(planId: string): Promise<string[]> {
    const resp = await apiClient.get<ApiResponse<string[]>>(`${this.BASE_PATH}/${encodeURIComponent(planId)}`);
    return resp.data.data;
  }

  // 全量更新套餐-菜单绑定
  static async updateSubscriptionPlanMenus(planId: string, request: UpdateSubscriptionPlanMenusRequest): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/${encodeURIComponent(planId)}`, request);
  }
}

