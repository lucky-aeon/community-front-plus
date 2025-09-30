import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserAccessService } from '@shared/services/api/user-access.service';
import { useAuth } from '@/context/AuthContext';

/**
 * 拉取并缓存当前用户的菜单码集合
 */
export function useUserMenuCodes() {
  const { user } = useAuth();
  const [menuCodes, setMenuCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setMenuCodes(null);
      return;
    }
    try {
      setLoading(true);
      const list = await UserAccessService.getUserMenuCodes();
      setMenuCodes(list);
    } catch {
      setMenuCodes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 监听全局刷新事件（例如：CDK 激活后需要刷新权限）
  useEffect(() => {
    const handler = () => { void reload(); };
    window.addEventListener('menu-codes:refresh', handler);
    return () => window.removeEventListener('menu-codes:refresh', handler);
  }, [reload]);

  const codeSet = useMemo(() => (menuCodes ? new Set(menuCodes) : null), [menuCodes]);

  const isAllowed = (code: string) => {
    if (!code) return true;
    if (!codeSet) return true; // 未加载完成前默认允许，避免闪烁
    return codeSet.has(code);
  };

  return { menuCodes: codeSet, isAllowed, isLoading: loading, reload } as const;
}
