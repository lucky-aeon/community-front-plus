import { apiClient, ApiResponse } from './config';
import type { UserCourseOwnershipDTO } from '@shared/types';

/**
 * 用户订阅相关服务
 * 对接 UserSubscriptionController
 */
export class UserSubscriptionService {
  /**
   * CDK 激活
   * POST /api/user/subscription/activate-cdk
   */
  static async activateCDK(cdkCode: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/user/subscription/activate-cdk', { cdkCode });
  }

  /**
   * 当前用户课程权益
   * GET /api/user/courses/ownerships
   */
  static async getCourseOwnerships(): Promise<UserCourseOwnershipDTO[]> {
    const resp = await apiClient.get<ApiResponse<UserCourseOwnershipDTO[]>>('/user/courses/ownerships');
    return resp.data.data || [];
  }
}

export default UserSubscriptionService;
