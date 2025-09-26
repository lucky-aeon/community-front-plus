import { useEffect, useMemo, useState } from 'react';
import { UserAccessService } from '@shared/services/api/user-access.service';
import { useAuth } from '@/context/AuthContext';

/**
 * 拉取并缓存当前用户的菜单码集合
 */
export function useUserMenuCodes() {
  const { user } = useAuth();
  const [menuCodes, setMenuCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setMenuCodes(null);
        return;
      }
      try {
        setLoading(true);
        const list = await UserAccessService.getUserMenuCodes();
        if (!cancelled) setMenuCodes(list);
      } catch {
        if (!cancelled) setMenuCodes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // 当用户ID变化时重新拉取
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const codeSet = useMemo(() => (menuCodes ? new Set(menuCodes) : null), [menuCodes]);

  const isAllowed = (code: string) => {
    if (!code) return true;
    if (!codeSet) return true; // 未加载完成前默认允许，避免闪烁
    return codeSet.has(code);
  };

  return { menuCodes: codeSet, isAllowed, isLoading: loading } as const;
}

