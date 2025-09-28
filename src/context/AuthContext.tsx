import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      setUser(user);
      try { await ResourceAccessService.ensureSession(); } catch { void 0; }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.register({ name, email, password });
      setUser(user);
      try { await ResourceAccessService.ensureSession(); } catch { void 0; }
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
      setUser(user);
      try { await ResourceAccessService.ensureSession(); } catch { void 0; }
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
    setUser(null);
    AuthService.logout();
  };

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
