import { apiClient, ApiResponse } from './config';
import { User } from '../../types';

// 登录请求参数接口
export interface LoginRequest {
  email: string;
  password: string;
}

// 后端用户响应接口
export interface BackendUser {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  email: string;
  status: string;
  emailNotificationEnabled: boolean;
  maxConcurrentDevices: number;
  createTime: string;
  updateTime: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  user: BackendUser;
}

// 注册请求参数接口
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// 使用邮箱验证码注册请求参数
export interface RegisterWithCodeRequest {
  email: string;
  code: string;
  password: string;
}

// 认证服务类
export class AuthService {
  
  /**
   * 用户登录
   */
  static async login(params: LoginRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', params);
    
    const { token, user: backendUser } = response.data.data;
    
    // 存储 token
    localStorage.setItem('auth_token', token);
    
    // 将后端用户数据映射为前端用户数据
    const user: User = this.mapBackendUserToFrontendUser(backendUser);
    
    // 存储用户信息
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * 用户注册
   */
  static async register(params: RegisterRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', params);
    
    const { token, user: backendUser } = response.data.data;
    
    // 存储 token
    localStorage.setItem('auth_token', token);
    
    // 将后端用户数据映射为前端用户数据
    const user: User = this.mapBackendUserToFrontendUser(backendUser);
    
    // 存储用户信息
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * 发送注册验证码到邮箱
   */
  static async sendRegisterCode(email: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/register/send-code', { email });
  }

  /**
   * 使用邮箱验证码注册
   */
  static async registerWithCode(params: RegisterWithCodeRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register/with-code', params);

    const { token, user: backendUser } = response.data.data;

    localStorage.setItem('auth_token', token);
    const user: User = this.mapBackendUserToFrontendUser(backendUser);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  /**
   * 用户登出
   */
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  /**
   * 检查用户是否已登录
   */
  static isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * 获取存储的用户信息
   */
  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      // 恢复日期对象
      if (user.membershipExpiry) {
        user.membershipExpiry = new Date(user.membershipExpiry);
      }
      return user;
    } catch (error) {
      console.error('解析存储的用户信息失败:', error);
      return null;
    }
  }

  /**
   * 获取存储的 token
   */
  static getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * 验证 token 是否有效
   */
  static async validateToken(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) return false;
      
      // 这里可以调用后端的 token 验证接口
      // 暂时简单检查 token 是否存在
      return true;
    } catch (error) {
      console.error('Token 验证失败:', error);
      return false;
    }
  }

  /**
   * 刷新当前用户信息
   * 从服务器获取最新的用户信息并更新本地存储
   */
  static async refreshUserInfo(): Promise<User | null> {
    try {
      // 这里需要导入UserService，但为了避免循环依赖，我们直接使用apiClient
      const { apiClient } = await import('./config');
      const response = await apiClient.get('/user');
      const backendUser = response.data.data;
      
      // 映射为前端用户格式
      const user = this.mapBackendUserToFrontendUser(backendUser);
      
      // 更新本地存储
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      return null;
    }
  }

  /**
   * 会话心跳：用于保持/校验当前登录状态
   * GET /api/user/heartbeat
   */
  static async heartbeat(): Promise<void> {
    await apiClient.get<ApiResponse<void>>('/user/heartbeat');
  }

  /**
   * 将后端用户数据映射为前端用户数据
   */
  private static mapBackendUserToFrontendUser(backendUser: BackendUser): User {
    return {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      avatar: backendUser.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
      // 后端暂时没有会员等级字段，默认设置为 basic
      membershipTier: 'basic',
      // 默认设置会员到期时间为30天后
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }
}
