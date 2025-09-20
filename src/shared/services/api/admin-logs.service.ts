import { apiClient, ApiResponse } from './config';
import { 
  ActivityLogQueryRequest,
  UserActivityLogDTO,
  PageResponse
} from '../../types';

/**
 * 管理员用户活动日志服务类
 * 提供用户活动日志查询功能
 */
export class AdminLogsService {

  /**
   * 查询用户活动日志
   * GET /api/admin/user-activity-logs
   * 
   * @description 支持多条件筛选的用户活动日志查询接口
   * @param params 查询参数，包含分页信息和筛选条件
   * @returns Promise<PageResponse<UserActivityLogDTO>> 分页的活动日志数据
   */
  static async getUserActivityLogs(params: ActivityLogQueryRequest = {}): Promise<PageResponse<UserActivityLogDTO>> {
    // 构建查询参数
    const queryParams: Record<string, string | number> = {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10
    };

    // 添加可选的筛选参数
    if (params.userId) {
      queryParams.userId = params.userId;
    }
    if (params.activityType) {
      queryParams.activityType = params.activityType;
    }
    if (params.activityCategory) {
      queryParams.activityCategory = params.activityCategory;
    }
    if (params.startTime) {
      queryParams.startTime = params.startTime;
    }
    if (params.endTime) {
      queryParams.endTime = params.endTime;
    }
    if (params.ip) {
      queryParams.ip = params.ip;
    }

    const response = await apiClient.get<ApiResponse<PageResponse<UserActivityLogDTO>>>(
      '/admin/user-activity-logs',
      { params: queryParams }
    );
    
    return response.data.data;
  }
}