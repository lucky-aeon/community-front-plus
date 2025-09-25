import { ResourceAccessService } from '@shared/services/api/resource-access.service';

/**
 * 判断是否为内置系统头像（public/avatars 下的静态文件）
 * 规则：pathname 以 /avatars/ 开头
 */
export function isSystemAvatar(value?: string | null): boolean {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  // 快速路径：相对路径直接判断
  if (v.startsWith('/avatars/')) return true;
  try {
    const url = new URL(v, window.location.origin);
    return url.pathname === '/avatars' || url.pathname.startsWith('/avatars/');
  } catch {
    return false;
  }
}

/**
 * 获取头像的可访问URL：
 * - 系统头像：直接返回 /avatars/xxx
 * - 资源ID：转换为 /api/public/resource/:id/access
 * - 已是 URL 或绝对/相对路径：原样返回
 * 可选 refreshKey 用于强制刷新缓存
 */
export function getAvatarUrl(
  avatar?: string | null,
  opts?: { refreshKey?: string | number; fallback?: string }
): string {
  const fallback = opts?.fallback || '/avatars/avatar_1.png';

  const appendCb = (u: string) => {
    if (!opts?.refreshKey) return u;
    return u + (u.includes('?') ? '&' : '?') + `t=${opts.refreshKey}`;
  };

  if (!avatar || !String(avatar).trim()) {
    return appendCb(fallback);
  }

  const v = String(avatar).trim();

  // 系统头像：直接返回
  if (isSystemAvatar(v)) return appendCb(v);

  // 已是绝对/相对 URL（例如后端已转换为访问URL）
  if (/^https?:\/\//i.test(v) || v.startsWith('/')) {
    return appendCb(v);
  }

  // 否则视为资源ID，转换为可访问URL
  try {
    return appendCb(ResourceAccessService.getResourceAccessUrl(v));
  } catch {
    // 兜底：直接返回原值（通常不会命中）
    return appendCb(v);
  }
}

