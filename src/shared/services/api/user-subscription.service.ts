import { apiClient, ApiResponse } from './config';

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
}

export default UserSubscriptionService;

