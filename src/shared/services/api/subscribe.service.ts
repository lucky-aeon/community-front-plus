import { apiClient, ApiResponse } from './config';
import {
  SubscribeToggleRequest,
  SubscribeStatusRequest,
  SubscribeStatusResponse,
  SubscribeToggleResponse,
} from '../../types';

/**
 * 订阅功能服务类
 * 提供订阅/取消订阅和订阅状态检查功能
 * 支持用户关注和课程订阅两种类型
 */
export class SubscribeService {

  /**
   * 订阅/取消订阅切换
   * POST /api/app/follows/toggle
   *
   * @description 根据当前订阅状态自动切换为订阅或取消订阅
   * @param params 订阅切换请求参数
   * @returns Promise<SubscribeToggleResponse> 切换后的订阅状态
   */
  static async toggleSubscribe(params: SubscribeToggleRequest): Promise<SubscribeToggleResponse> {
    try {
      const response = await apiClient.post<ApiResponse<SubscribeToggleResponse>>('/app/follows/toggle', params);
      if (!response.data?.data) {
        throw new Error('API响应格式错误：缺少data字段');
      }

      return response.data.data;
    } catch (error) {
      console.error('[SubscribeService] 切换订阅状态失败:', error);
      throw error;
    }
  }

  /**
   * 检查订阅状态
   * GET /api/app/follows/check/{targetType}/{targetId}
   *
   * @description 查询当前用户是否已订阅指定目标
   * @param params 订阅状态检查请求参数
   * @returns Promise<SubscribeStatusResponse> 订阅状态信息
   */
  static async checkSubscribeStatus(params: SubscribeStatusRequest): Promise<SubscribeStatusResponse> {
    try {
      const url = `/app/follows/check/${params.targetType}/${params.targetId}`;
      const response = await apiClient.get<ApiResponse<SubscribeStatusResponse>>(url);
      if (!response.data?.data) {
        throw new Error('API响应格式错误：缺少data字段');
      }

      return response.data.data;
    } catch (error) {
      console.error('[SubscribeService] 检查订阅状态失败:', error);
      throw error;
    }
  }

  /**
   * 批量检查订阅状态
   * POST /api/app/follows/batch-check
   *
   * @description 批量查询多个目标的订阅状态，用于列表页面优化
   * @param targets 目标列表
   * @returns Promise<SubscribeStatusResponse[]> 订阅状态列表
   */
  static async batchCheckSubscribeStatus(targets: SubscribeStatusRequest[]): Promise<SubscribeStatusResponse[]> {
    const response = await apiClient.post<ApiResponse<SubscribeStatusResponse[]>>('/app/follows/batch-check', {
      targets
    });
    return response.data.data;
  }
}

// 为了向后兼容，保留FollowService的别名
export const FollowService = SubscribeService;
