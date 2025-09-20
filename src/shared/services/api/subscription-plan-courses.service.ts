import { apiClient, ApiResponse } from './config';
import {
  SimpleSubscriptionPlanDTO,
  SimpleCourseDTO,
  UpdateSubscriptionPlanCoursesRequest
} from '@shared/types';

/**
 * 套餐课程绑定管理API服务
 * 提供套餐与课程绑定关系的管理功能
 */
export class SubscriptionPlanCoursesService {
  private static readonly BASE_PATH = '/admin/subscription-plan-courses';

  /**
   * 获取套餐简单列表
   * 用于前端套餐选择器，返回所有套餐的基本信息
   * @returns 套餐简单列表
   */
  static async getSimpleSubscriptionPlans(): Promise<SimpleSubscriptionPlanDTO[]> {
    const response = await apiClient.get<ApiResponse<SimpleSubscriptionPlanDTO[]>>(
      `${this.BASE_PATH}/subscription-plans`
    );
    return response.data.data;
  }

  /**
   * 获取所有课程简单列表
   * 用于前端穿梭框的可选项，返回所有课程的基本信息
   * @returns 课程简单列表
   */
  static async getSimpleCourses(): Promise<SimpleCourseDTO[]> {
    const response = await apiClient.get<ApiResponse<SimpleCourseDTO[]>>(
      `${this.BASE_PATH}/courses`
    );
    return response.data.data;
  }

  /**
   * 获取套餐已绑定的课程ID列表
   * 用于初始化穿梭框右侧已选项
   * @param planId 套餐ID
   * @returns 课程ID列表
   */
  static async getSubscriptionPlanCourseIds(planId: string): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      `${this.BASE_PATH}/${planId}/course-ids`
    );
    return response.data.data;
  }

  /**
   * 批量更新套餐课程绑定
   * 全量替换指定套餐的课程绑定关系
   *
   * 支持的操作：
   * - 传入课程ID列表：绑定这些课程到套餐
   * - 传入空列表 [] 或 null：清空套餐的所有课程绑定
   *
   * @param planId 套餐ID
   * @param request 更新请求，包含课程ID列表
   */
  static async updateSubscriptionPlanCourses(
    planId: string,
    request: UpdateSubscriptionPlanCoursesRequest
  ): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/${planId}`, request);
  }
}