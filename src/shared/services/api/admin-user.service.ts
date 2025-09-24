import { apiClient, ApiResponse } from './config';
import { 
  AdminUserQueryRequest,
  AdminUserDTO,
  PageResponse,
  UpdateUserDeviceCountRequest
} from '@shared/types';

/**
 * 管理员用户管理服务类
 * 提供用户查询和状态管理功能
 */
export class AdminUserService {

  /**
   * 分页查询用户列表
   * GET /api/admin/users
   * 
   * @description 支持邮箱、昵称、状态条件查询的分页用户列表
   * @param params 查询参数，包含分页信息和筛选条件
   * @returns Promise<PageResponse<AdminUserDTO>> 分页的用户列表数据
   */
  static async getUsers(params: AdminUserQueryRequest = {}): Promise<PageResponse<AdminUserDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminUserDTO>>>('/admin/users', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...params.email && { email: params.email },
        ...params.name && { name: params.name },
        ...params.status && { status: params.status }
      }
    });
    return response.data.data;
  }

  /**
   * 切换用户状态
   * PUT /api/admin/users/{userId}/toggle-status
   * 
   * @description 自动在正常/禁用状态之间切换用户状态
   * @param userId 要切换状态的用户ID
   * @returns Promise<AdminUserDTO> 更新后的用户信息
   */
  static async toggleUserStatus(userId: string): Promise<AdminUserDTO> {
    const response = await apiClient.put<ApiResponse<AdminUserDTO>>(`/admin/users/${userId}/toggle-status`);
    return response.data.data;
  }

  /**
   * 更新用户设备数量
   * PUT /api/admin/users/{userId}/devices
   * 
   * @description 修改用户最大并发设备数量
   * @param userId 要修改的用户ID
   * @param deviceCount 新的设备数量
   * @returns Promise<AdminUserDTO> 更新后的用户信息
   */
  static async updateUserDeviceCount(userId: string, deviceCount: number): Promise<AdminUserDTO> {
    const requestData: UpdateUserDeviceCountRequest = { maxConcurrentDevices: deviceCount };
    const response = await apiClient.put<ApiResponse<AdminUserDTO>>(`/admin/users/${userId}/devices`, requestData);
    return response.data.data;
  }
}
