import axios from 'axios';
import { showToast } from '@shared/utils/toast';
import { getOrCreateDeviceId, refreshDidCookie } from '@shared/utils/device-id';

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

// 请求拦截器 - 自动添加 token 与设备ID
apiClient.interceptors.request.use(
  (config) => {
    // 设备ID：稳定、非机密；同时维持 DID Cookie 以兼容无法自定义请求头的场景
    try {
      const did = getOrCreateDeviceId();
      (config.headers as any)['X-Device-ID'] = did;
      refreshDidCookie();
    } catch { /* ignore */ }

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
    // 如果响应包含 message 且不为空字符串，显示成功提示
    if (response.data?.message && response.data.message.trim() !== '') {
      showToast.success(response.data.message);
      return response;
    }

    // 针对部分成功但无 message 的接口做兜底提示
    try {
      const url = response.config?.url || '';
      // 关注/取消关注切换：/app/follows/toggle
      if (url.includes('/app/follows/toggle') && response.status >= 200 && response.status < 300) {
        const data = response.data?.data as { isFollowing?: boolean } | undefined;
        if (data && typeof data.isFollowing !== 'undefined') {
          showToast.success(data.isFollowing ? '关注成功' : '取消关注');
        }
      }
    } catch { void 0; }

    return response;
  },
  (error) => {
    // 处理不同类型的错误
    if (error.response) {
      const { status, data } = error.response;
      const cfg = error.config || {};
      const headers = (cfg.headers || {}) as Record<string, string>;
      const skipAuthLogout = headers['X-Skip-Auth-Logout'] === 'true' || (cfg as unknown as { __skipAuthLogout?: boolean }).__skipAuthLogout === true;
      const urlStr = String(cfg?.url || '');
      const isAccessSession = urlStr.includes('/user/resource/access-session');
      let toastShown = false;

      // 登录被拒绝（设备/IP 限制）：引导到设备管理页
      try {
        const url = String(cfg?.url || '');
        const msg: string = String(data?.message || '');
        const isLoginAttempt = url.includes('/auth/login');
        const loginRejected = /登录被拒绝/.test(msg) || (/设备|IP|限制/.test(msg) && /拒绝|无法|失败/.test(msg));
        if (isLoginAttempt && loginRejected) {
          // 若当前已有会话（例如尝试切换/重复登录），跳转设备管理页
          const hasSession = !!localStorage.getItem('auth_token');
          if (hasSession) {
            try { window.location.assign('/dashboard/user-backend/devices'); } catch { /* ignore */ }
          }
          // 提示文案仍由统一拦截器逻辑处理（不覆盖403规则）
        }
      } catch { /* ignore */ }

      switch (status) {
        case 401:
          // 未授权：清理会话并触发全局登出，让路由守卫把用户送回登录入口
          if (!skipAuthLogout) {
            // 避免并发请求重复触发登出与多次提示
            try {
              const w = window as unknown as { __authLoggingOut?: boolean };
              if (!w.__authLoggingOut) {
                w.__authLoggingOut = true;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                // 统一过期提示交由拦截器弹出
                showToast.error('登录已过期，请重新登录');
                // 通知应用执行登出逻辑（AuthContext 监听此事件并导航）
                try { window.dispatchEvent(new CustomEvent('auth:logout')); } catch { /* no-op */ }
              }
            } finally {
              toastShown = true;
            }
          }
          break;
        case 403:
          // 资源访问会话的 403：静默处理（不弹窗）
          if (isAccessSession) {
            toastShown = true;
            break;
          }
          // 统一 403 文案（禁止覆盖）
          showToast.error('权限不足');
          toastShown = true;
          break;
        case 404: {
          // 优先显示后端 message，否则兜底
          const msg = data?.message || '请求的资源未找到';
          if (msg.trim() !== '') {
            showToast.error(msg);
            toastShown = true;
          }
          break;
        }
        case 500: {
          // 优先显示后端 message，否则兜底
          const msg = data?.message || '服务器错误，请稍后再试';
          if (msg.trim() !== '') {
            showToast.error(msg);
            toastShown = true;
          }
          break;
        }
        case 400: {
          // 客户端请求错误，显示后端返回的具体错误信息
          const badRequestMessage = data?.message || '请求参数有误';
          if (badRequestMessage.trim() !== '') {
            showToast.error(badRequestMessage);
            toastShown = true;
          }
          break;
        }
        default: {
          // 显示后端返回的错误信息，如果没有则显示默认信息
          const errorMessage = data?.message || '请求失败，请稍后再试';
          if (errorMessage.trim() !== '') {
            showToast.error(errorMessage);
            toastShown = true;
          }
          break;
        }
      }
      if (toastShown) {
        try { (error as any).__toastShown = true; } catch { /* no-op */ }
      }
    } else if (error.request) {
      // 网络错误
      showToast.error('网络连接失败，请检查网络设置');
      try { (error as any).__toastShown = true; } catch { /* no-op */ }
    } else {
      // 其他错误
      showToast.error('请求发生错误');
      try { (error as any).__toastShown = true; } catch { /* no-op */ }
    }
    
    return Promise.reject(error);
  }
);

// API 响应包装器类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
