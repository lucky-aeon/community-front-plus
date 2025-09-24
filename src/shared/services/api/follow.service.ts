import { apiClient, ApiResponse } from './config';
import {
  FollowToggleRequest,
  FollowStatusRequest,
  FollowStatusResponse,
  FollowToggleResponse,
} from '../../types';

/**
 * 关注功能服务类
 * 提供关注/取消关注和关注状态检查功能
 */
export class FollowService {

  /**
   * 关注/取消关注切换
   * POST /api/app/follows/toggle
   *
   * @description 根据当前关注状态自动切换为关注或取消关注
   * @param params 关注切换请求参数
   * @returns Promise<FollowToggleResponse> 切换后的关注状态
   */
  static async toggleFollow(params: FollowToggleRequest): Promise<FollowToggleResponse> {
    try {
      const response = await apiClient.post<ApiResponse<FollowToggleResponse>>('/app/follows/toggle', params);
      if (!response.data?.data) {
        throw new Error('API响应格式错误：缺少data字段');
      }

      return response.data.data;
    } catch (error) {
      console.error('[FollowService] 切换关注状态失败:', error);
      throw error;
    }
  }

  /**
   * 检查关注状态
   * GET /api/app/follows/check/{targetType}/{targetId}
   *
   * @description 查询当前用户是否已关注指定目标
   * @param params 关注状态检查请求参数
   * @returns Promise<FollowStatusResponse> 关注状态信息
   */
  static async checkFollowStatus(params: FollowStatusRequest): Promise<FollowStatusResponse> {
    try {
      const url = `/app/follows/check/${params.targetType}/${params.targetId}`;
      const response = await apiClient.get<ApiResponse<FollowStatusResponse>>(url);
      if (!response.data?.data) {
        throw new Error('API响应格式错误：缺少data字段');
      }

      return response.data.data;
    } catch (error) {
      console.error('[FollowService] 检查关注状态失败:', error);
      throw error;
    }
  }

  /**
   * 批量检查关注状态
   * POST /api/app/follows/batch-check
   *
   * @description 批量查询多个目标的关注状态，用于列表页面优化
   * @param targets 目标列表
   * @returns Promise<FollowStatusResponse[]> 关注状态列表
   */
  static async batchCheckFollowStatus(targets: FollowStatusRequest[]): Promise<FollowStatusResponse[]> {
    const response = await apiClient.post<ApiResponse<FollowStatusResponse[]>>('/app/follows/batch-check', {
      targets
    });
    return response.data.data;
  }
}
