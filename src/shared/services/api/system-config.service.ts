import { apiClient, ApiResponse } from './config';
import {
  SystemConfigDTO,
  SystemConfigType,
  UpdateSystemConfigRequest,
  UserSessionLimitConfigData
} from '@shared/types';

/**
 * 系统配置管理API服务
 * 提供系统配置的查询和更新功能，需要管理员权限
 */
export class SystemConfigService {
  private static readonly BASE_PATH = '/admin/system-configs';

  /**
   * 根据类型获取系统配置
   * @param type 配置类型
   * @returns 系统配置信息
   */
  static async getConfigByType(type: SystemConfigType): Promise<SystemConfigDTO> {
    const response = await apiClient.get<ApiResponse<SystemConfigDTO>>(`${this.BASE_PATH}/${type}`);
    return response.data.data;
  }

  /**
   * 根据类型更新系统配置
   * @param type 配置类型
   * @param data 更新数据
   * @returns 更新后的配置信息
   */
  static async updateConfigByType(type: SystemConfigType, data: unknown): Promise<SystemConfigDTO> {
    const request: UpdateSystemConfigRequest = { data };
    const response = await apiClient.put<ApiResponse<SystemConfigDTO>>(`${this.BASE_PATH}/${type}`, request);
    return response.data.data;
  }

  /**
   * 获取默认套餐配置
   * @returns 默认套餐配置信息
   */
  static async getDefaultSubscriptionConfig(): Promise<SystemConfigDTO> {
    return this.getConfigByType('DEFAULT_SUBSCRIPTION_PLAN');
  }

  /**
   * 更新默认套餐配置
   * @param subscriptionPlanId 套餐ID
   * @returns 更新后的配置信息
   */
  static async updateDefaultSubscriptionConfig(
    subscriptionPlanId: string
  ): Promise<SystemConfigDTO> {
    const data = {
      subscriptionPlanId
    };
    return this.updateConfigByType('DEFAULT_SUBSCRIPTION_PLAN', data);
  }

  /**
   * 获取用户会话限制配置（USER_SESSION_LIMIT）
   */
  static async getUserSessionLimitConfig(): Promise<SystemConfigDTO> {
    return this.getConfigByType('USER_SESSION_LIMIT');
  }

  /**
   * 更新用户会话限制配置（USER_SESSION_LIMIT）
   */
  static async updateUserSessionLimitConfig(data: UserSessionLimitConfigData): Promise<SystemConfigDTO> {
    return this.updateConfigByType('USER_SESSION_LIMIT', data);
  }
}
