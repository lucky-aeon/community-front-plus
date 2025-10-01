import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, AuthContextType } from '../shared/types';
import { AuthService } from '../shared/services/api/auth.service';
import { ResourceAccessService } from '../shared/services/api/resource-access.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // 认证动作加载（登录/注册/发码等）
  const [isLoading, setIsLoading] = useState(false);
  // 应用初始化阶段（仅用于路由守卫判断是否渲染页面）
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 检查存储的用户会话和 token
    const initializeAuth = async () => {
      const storedUser = AuthService.getStoredUser();
      const storedToken = AuthService.getStoredToken();
      
      if (storedUser && storedToken) {
        // 验证 token 是否仍然有效
        const isTokenValid = await AuthService.validateToken();
        if (isTokenValid) {
          // 先用本地的兜底，随后静默刷新一次用户信息（带回套餐名称等最新字段）
          setUser(storedUser);
          try {
            const refreshed = await AuthService.refreshUserInfo();
            if (refreshed) setUser(refreshed);
          } catch { void 0; }
          // 建立资源访问会话（服务端下发 HttpOnly 短期 Cookie）
          try {
            await ResourceAccessService.ensureSession();
          } catch { void 0; }
        } else {
          // Token 无效，清除存储的信息
          AuthService.logout();
        }
      }
      // 完成初始化
      setIsInitializing(false);
    };
    
    initializeAuth();
  }, []);

  

  // 会话心跳：登录状态下每30秒校验一次
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      try {
        await AuthService.heartbeat();
        // 同步刷新资源访问会话，保证 RAUTH 在观看长视频等场景不中断
        await ResourceAccessService.ensureSession();
      } catch (e) {
        // 仅在401时登出，其他网络错误忽略并继续轮询
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          logout();
          return; // 停止后续心跳
        }
      } finally {
        if (!cancelled) {
          timer = window.setTimeout(tick, 30_000);
        }
      }
    };

    // 首次延时 30s 执行，避免刚进入页面立刻触发
    timer = window.setTimeout(tick, 30_000);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.login({ email, password });
      // 先建立资源访问会话（签发 HttpOnly Cookie），再更新用户
      try { await ResourceAccessService.ensureSession(); } catch { void 0; }
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.register({ name, email, password });
      // 先建立资源访问会话，避免头像等资源首屏加载因缺少 Cookie 而失败
      try { await ResourceAccessService.ensureSession(); } catch { void 0; }
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const sendRegisterCode = async (email: string) => {
    setIsLoading(true);
    try {
      await AuthService.sendRegisterCode(email);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithCode = async (email: string, code: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.registerWithCode({ email, emailVerificationCode: code, password });
      // 先建立资源访问会话，确保后续资源可访问
      try { await ResourceAccessService.ensureSession(); } catch { void 0; }
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const registerOnly = async (email: string, code: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.registerOnly({ email, emailVerificationCode: code, password });
      // 不设置用户状态，不自动登录
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetCode = async (email: string) => {
    setIsLoading(true);
    try {
      await AuthService.sendPasswordResetCode(email);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await AuthService.resetPassword({ email, verificationCode: code, newPassword });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 立即清空本地状态与受保护路由渲染
    setUser(null);
    // 异步对接后端登出，并在受保护区域时回到首页
    (async () => {
      try {
        await AuthService.logout();
      } finally {
        // 若当前处于受保护的仪表盘区域，登出后跳转到首页
        if (location.pathname.startsWith('/dashboard')) {
          navigate('/', { replace: true });
        }
      }
    })();
  };

  // 监听全局 401 登出事件（由 Axios 拦截器触发）
  useEffect(() => {
    const onLogout = () => {
      // 统一走现有登出流程：清空本地状态、请求后端、并在受保护区域跳转首页
      logout();
      // 清理并发保护标记，允许后续再次触发
      try { (window as unknown as { __authLoggingOut?: boolean }).__authLoggingOut = false; } catch { /* ignore */ }
    };
    window.addEventListener('auth:logout', onLogout as EventListener);
    return () => window.removeEventListener('auth:logout', onLogout as EventListener);
  }, [logout]);

  const refreshUser = async () => {
    try {
      const updated = await AuthService.refreshUserInfo();
      if (updated) setUser(updated);
    } catch { /* ignore */ }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    sendRegisterCode,
    registerWithCode,
    registerOnly,
    sendPasswordResetCode,
    resetPassword,
    logout,
    refreshUser,
    isLoading,
    isInitializing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
