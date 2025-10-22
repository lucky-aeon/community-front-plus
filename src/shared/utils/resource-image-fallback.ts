/**
 * 资源图片全局兜底：当受保护资源图片加载失败（如 403 无权限）时，
 * 将其替换为带有「无权限，请升级套餐」的占位图，避免免费用户窥视资源内容。
 *
 * 支持两种 URL 格式：
 * 1. 后端资源访问 URL: /api/public/resource/{id}/access
 * 2. OSS 签名 URL: 包含 resourceId 和 token 参数（302 重定向后的 URL）
 */

/** 生成占位图（dataURL） */
export function buildNoPermissionPlaceholder(width = 640, height = 360): string {
  try {
    const dpr = Math.max(1, Math.min(2, (globalThis.devicePixelRatio || 1)));
    const canvasWidth = Math.round(width * dpr);
    const canvasHeight = Math.round(height * dpr);
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');

    // 背景
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 边框
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = Math.max(1, Math.round(2 * dpr));
    ctx.strokeRect(
      Math.round(6 * dpr),
      Math.round(6 * dpr),
      canvasWidth - Math.round(12 * dpr),
      canvasHeight - Math.round(12 * dpr)
    );

    // 文字
    const title = '无权限';
    const subtitle = '请升级套餐后查看';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(24 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;
    ctx.fillText(title, canvasWidth / 2, canvasHeight / 2 - Math.round(12 * dpr));
    ctx.font = `${Math.round(16 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;
    ctx.fillText(subtitle, canvasWidth / 2, canvasHeight / 2 + Math.round(16 * dpr));

    return canvas.toDataURL('image/png');
  } catch {
    // 兜底：返回 1x1 灰点
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/xcAAgMBhVQeQmkAAAAASUVORK5CYII=';
  }
}

/**
 * 安装全局图片错误处理：对资源访问 URL 的 <img> 自动替换为占位图
 */
export function installResourceImageFallback(): void {
  if (typeof window === 'undefined') return;
  const win = window as any;
  if (win.__resourceImageFallbackInstalled) return;
  win.__resourceImageFallbackInstalled = true;

  const isResourceAccessUrl = (url: string): boolean => {
    // 1) 后端资源访问 URL: /api/public/resource/{id}/access
    if (/\/api\/public\/resource\/.+\/access/.test(url)) return true;
    // 2) OSS 签名 URL（重定向后的最终地址），通常包含以下任一参数
    //    - Aliyun OSS: OSSAccessKeyId / Expires / Signature
    //    - 其他云厂商也会包含签名类参数，这里以常见字段为准
    return isOssSignedUrl(url);
  };

  const isOssSignedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.href);
      const sp = urlObj.searchParams;
      const hasOss = sp.has('OSSAccessKeyId') || sp.has('Signature') || sp.has('Expires');
      return hasOss;
    } catch {
      return false;
    }
  };

  const onError = async (ev: Event) => {
    const imgEl = ev.target as unknown;
    if (!(imgEl instanceof HTMLImageElement)) return;
    // effectiveSrc 可能是 302 后的 OSS 最终地址；rawSrc 是最初设置到 <img> 上的值
    const effectiveSrc = (imgEl.currentSrc || imgEl.src || '').toString();
    const rawSrc = (imgEl.getAttribute('src') || '').toString();
    // 只处理来源于受保护资源的图片（原始 src 或最终地址判断其一即可）
    if (!(isResourceAccessUrl(rawSrc) || isResourceAccessUrl(effectiveSrc))) return;

    // 避免无限循环
    if ((imgEl as any).__resourceFallbackProcessing) return;
    (imgEl as any).__resourceFallbackProcessing = true;

    try {
      // OSS 签名 URL：图片加载失败直接认为无权限（跨域无法获取最终状态码）
      if (isOssSignedUrl(effectiveSrc) || isOssSignedUrl(rawSrc)) {
        const rect = imgEl.getBoundingClientRect?.();
        const targetW = Math.max(200, Math.round(rect?.width || imgEl.width || 640));
        const targetH = Math.max(120, Math.round(rect?.height || imgEl.height || 360));
        const placeholder = buildNoPermissionPlaceholder(targetW, targetH);
        try { imgEl.src = placeholder; } catch { /* ignore */ }
        (imgEl as any).__resourceFallbackApplied = true;
        return;
      }

      // 后端资源访问 URL：精准判断，仅在 403 时替换占位
      const probeUrl = rawSrc || effectiveSrc;
      const resp = await fetch(probeUrl, { method: 'GET', redirect: 'manual', credentials: 'include' });
      const isRedirect = resp.type === 'opaqueredirect';
      const status = resp.status || 0;

      if (status === 403) {
        const rect = imgEl.getBoundingClientRect?.();
        const targetW = Math.max(200, Math.round(rect?.width || imgEl.width || 640));
        const targetH = Math.max(120, Math.round(rect?.height || imgEl.height || 360));
        const placeholder = buildNoPermissionPlaceholder(targetW, targetH);
        try { imgEl.src = placeholder; } catch { /* ignore */ }
        (imgEl as any).__resourceFallbackApplied = true;
        return;
      }

      // 若发生跨域重定向，且 <img> 已报错，视为无法访问（多半是 403 或签名失效），直接占位
      if (isRedirect) {
        const rect = imgEl.getBoundingClientRect?.();
        const targetW = Math.max(200, Math.round(rect?.width || imgEl.width || 640));
        const targetH = Math.max(120, Math.round(rect?.height || imgEl.height || 360));
        const placeholder = buildNoPermissionPlaceholder(targetW, targetH);
        try { imgEl.src = placeholder; } catch { /* ignore */ }
        (imgEl as any).__resourceFallbackApplied = true;
        return;
      }
      // 其他状态：不处理，避免误判
    } catch {
      // 网络异常等：不误判为无权限
    } finally {
      (imgEl as any).__resourceFallbackProcessing = false;
    }
  };

  // 捕获阶段监听所有 <img> 错误
  window.addEventListener('error', onError, true);
}
