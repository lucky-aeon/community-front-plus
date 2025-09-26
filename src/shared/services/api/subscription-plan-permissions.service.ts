import { apiClient, type ApiResponse } from './config';
import type { PermissionOptionDTO, UpdateSubscriptionPlanPermissionsRequest } from '@shared/types';

/**
 * 套餐-权限绑定管理 API
 */
export class SubscriptionPlanPermissionsService {
  private static readonly BASE_PATH = '/admin/subscription-plan-permissions';

  // 获取全部权限选项
  static async getPermissionOptions(): Promise<PermissionOptionDTO[]> {
    const resp = await apiClient.get<ApiResponse<PermissionOptionDTO[]>>(`${this.BASE_PATH}/options`);
    return resp.data.data;
  }

  // 获取指定套餐已绑定的权限码
  static async getSubscriptionPlanPermissionCodes(planId: string): Promise<string[]> {
    const resp = await apiClient.get<ApiResponse<string[]>>(`${this.BASE_PATH}/${encodeURIComponent(planId)}`);
    return resp.data.data;
  }

  // 全量更新套餐-权限绑定
  static async updateSubscriptionPlanPermissions(planId: string, request: UpdateSubscriptionPlanPermissionsRequest): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/${encodeURIComponent(planId)}`, request);
  }
}

