import { apiClient, ApiResponse } from './config';
import { 
  UpdateProfileRequest, 
  ChangePasswordRequest, 
  UserDTO 
} from '../../types';

/**
 * 用户个人信息管理服务类
 * 包含用户个人资料的增删改查操作
 */
export class UserService {

  /**
   * 获取当前用户信息
   * GET /api/user
   * 
   * @description 获取当前登录用户的完整个人信息，包含私密信息（邮箱、通知设置等）
   * @returns Promise<UserDTO> 当前用户的完整信息
   */
  static async getCurrentUser(): Promise<UserDTO> {
    const response = await apiClient.get<ApiResponse<UserDTO>>('/user');
    return response.data.data;
  }

  /**
   * 更新用户个人简介
   * PUT /api/user/profile
   * 
   * @description 修改当前登录用户的个人简介信息
   * @param params 更新简介请求参数
   * @returns Promise<UserDTO> 更新后的用户信息
   */
  static async updateProfile(params: UpdateProfileRequest): Promise<UserDTO> {
    const response = await apiClient.put<ApiResponse<UserDTO>>('/user/profile', params);
    
    // 更新本地存储的用户信息
    this.updateLocalUserInfo(response.data.data);
    
    return response.data.data;
  }

  /**
   * 修改用户密码
   * PUT /api/user/password
   * 
   * @description 通过验证原密码来修改为新密码
   * @param params 修改密码请求参数
   * @returns Promise<UserDTO> 更新后的用户信息
   */
  static async changePassword(params: ChangePasswordRequest): Promise<UserDTO> {
    const response = await apiClient.put<ApiResponse<UserDTO>>('/user/password', params);
    
    // 更新本地存储的用户信息
    this.updateLocalUserInfo(response.data.data);
    
    return response.data.data;
  }

  /**
   * 切换邮箱通知设置
   * PUT /api/user/email-notification
   * 
   * @description 切换当前用户的邮箱通知开关状态（开启/关闭）
   * @returns Promise<UserDTO> 更新后的用户信息，包含新的邮箱通知设置状态
   */
  static async toggleEmailNotification(): Promise<UserDTO> {
    const response = await apiClient.put<ApiResponse<UserDTO>>('/user/email-notification');
    
    // 更新本地存储的用户信息
    this.updateLocalUserInfo(response.data.data);
    
    return response.data.data;
  }

  /**
   * 更新本地存储的用户信息
   * @private
   * @param userDTO 从API获取的用户数据
   */
  private static updateLocalUserInfo(userDTO: UserDTO): void {
    try {
      // 获取现有的用户信息
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // 更新用户信息，保持前端特有的字段
        const updatedUser = {
          ...user,
          id: userDTO.id,
          name: userDTO.name,
          email: userDTO.email,
          avatar: userDTO.avatar || user.avatar, // 保持现有头像或使用新的
        };
        
        // 保存到本地存储
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('更新本地用户信息失败:', error);
    }
  }

  /**
   * 将后端UserDTO映射为前端User类型
   * @param userDTO 后端用户数据
   * @returns 前端用户数据
   */
  static mapUserDTOToFrontendUser(userDTO: UserDTO) {
    return {
      id: userDTO.id,
      name: userDTO.name,
      email: userDTO.email,
      avatar: userDTO.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
      // 后端暂时没有会员等级字段，默认设置为 basic
      membershipTier: 'basic' as const,
      // 默认设置会员到期时间为30天后
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }
}