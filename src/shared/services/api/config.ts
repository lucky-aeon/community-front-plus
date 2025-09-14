import axios from 'axios';
import toast from 'react-hot-toast';

// API 基础配置 - 使用相对路径让Vite代理处理
export const API_BASE_URL = '/api';

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
  timeout: 10000,
});

// 请求拦截器 - 自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和响应
apiClient.interceptors.response.use(
  (response) => {
    // 如果响应包含 message，显示成功提示
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // 处理不同类型的错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除本地存储的认证信息
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          toast.error('登录已过期，请重新登录');
          break;
        case 403:
          toast.error('权限不足');
          break;
        case 404:
          toast.error('请求的资源未找到');
          break;
        case 500:
          toast.error('服务器错误，请稍后再试');
          break;
        case 400:
          // 客户端请求错误，显示后端返回的具体错误信息
          const badRequestMessage = data?.message || '请求参数有误';
          toast.error(badRequestMessage);
          break;
        default:
          // 显示后端返回的错误信息，如果没有则显示默认信息
          const errorMessage = data?.message || '请求失败，请稍后再试';
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // 网络错误
      toast.error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      toast.error('请求发生错误');
    }
    
    return Promise.reject(error);
  }
);

// API 响应包装器类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}