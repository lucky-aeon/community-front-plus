import { apiClient, ApiResponse } from './config';
import {
  SubscriptionPlanDTO,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlanQueryRequest,
  PageResponse
} from '@shared/types';

/**
 * 套餐管理API服务
 * 提供套餐的增删改查等管理功能
 */
export class SubscriptionPlansService {
  private static readonly BASE_PATH = '/admin/subscription-plans';

  /**
   * 创建新套餐
   * @param request 创建套餐请求参数
   * @returns 创建成功的套餐信息
   */
  static async createSubscriptionPlan(request: CreateSubscriptionPlanRequest): Promise<SubscriptionPlanDTO> {
    const response = await apiClient.post<ApiResponse<SubscriptionPlanDTO>>(this.BASE_PATH, request);
    return response.data.data;
  }

  /**
   * 更新套餐信息
   * @param id 套餐ID
   * @param request 更新套餐请求参数
   * @returns 更新后的套餐信息
   */
  static async updateSubscriptionPlan(id: string, request: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlanDTO> {
    const response = await apiClient.put<ApiResponse<SubscriptionPlanDTO>>(`${this.BASE_PATH}/${id}`, request);
    return response.data.data;
  }

  /**
   * 获取套餐详情
   * @param id 套餐ID
   * @returns 套餐详情
   */
  static async getSubscriptionPlan(id: string): Promise<SubscriptionPlanDTO> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanDTO>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  /**
   * 删除套餐（软删除）
   * @param id 套餐ID
   */
  static async deleteSubscriptionPlan(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * 分页获取套餐列表
   * @param request 查询请求参数
   * @returns 分页套餐列表
   */
  static async getPagedSubscriptionPlans(request: SubscriptionPlanQueryRequest): Promise<PageResponse<SubscriptionPlanDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SubscriptionPlanDTO>>>(this.BASE_PATH, {
      params: request
    });
    return response.data.data;
  }
}