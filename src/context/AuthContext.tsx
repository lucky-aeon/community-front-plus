import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../shared/types';
import { AuthService } from '../shared/services/api/auth.service';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查存储的用户会话和 token
    const initializeAuth = async () => {
      const storedUser = AuthService.getStoredUser();
      const storedToken = AuthService.getStoredToken();
      
      if (storedUser && storedToken) {
        // 验证 token 是否仍然有效
        const isTokenValid = await AuthService.validateToken();
        if (isTokenValid) {
          setUser(storedUser);
        } else {
          // Token 无效，清除存储的信息
          AuthService.logout();
        }
      }
      
      setIsLoading(false);
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
      } catch (e: any) {
        // 仅在401时登出，其他网络错误忽略并继续轮询
        const status = e?.response?.status;
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
    } catch (error) {
      // 错误已经在 axios 拦截器中处理了，这里重新抛出
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.register({ name, email, password });
      setUser(user);
    } catch (error) {
      // 错误已经在 axios 拦截器中处理了，这里重新抛出
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendRegisterCode = async (email: string) => {
    setIsLoading(true);
    try {
      await AuthService.sendRegisterCode(email);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithCode = async (email: string, code: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.registerWithCode({ email, code, password });
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    sendRegisterCode,
    registerWithCode,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
