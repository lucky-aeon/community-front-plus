/**
 * 从 Markdown 内容中提取视频 URL
 * 支持以下格式：
 * 1. 自定义 video 语法：!video[描述](url)
 * 2. HTML video 标签：<video src="url"></video> 或 <video><source src="url"></video>
 * 3. Markdown 图片语法中的视频文件：![](url.mp4)
 * 4. 直接的视频链接（.mp4, .webm, .ogg 等）
 */
export function extractVideoUrl(markdown: string): string | null {
  if (!markdown) return null;

  // 优先匹配自定义 !video[描述](url) 语法
  const customVideoMatch = markdown.match(/!video\[.*?\]\(([^)]+)\)/i);
  if (customVideoMatch) {
    return customVideoMatch[1];
  }

  // 匹配 HTML video 标签中的 src
  const videoSrcMatch = markdown.match(/<video[^>]*src=["']([^"']+)["']/i);
  if (videoSrcMatch) {
    return videoSrcMatch[1];
  }

  // 匹配 video 标签内的 source 标签
  const sourceMatch = markdown.match(/<source[^>]*src=["']([^"']+)["']/i);
  if (sourceMatch) {
    return sourceMatch[1];
  }

  // 匹配 Markdown 图片语法中的视频文件（如 ![](url.mp4)）
  const markdownVideoMatch = markdown.match(/!\[.*?\]\(([^)]+\.(?:mp4|webm|ogg|mov))\)/i);
  if (markdownVideoMatch) {
    return markdownVideoMatch[1];
  }

  // 匹配纯 URL（以视频后缀结尾的链接）
  const urlMatch = markdown.match(/(https?:\/\/[^\s<>"]+?\.(?:mp4|webm|ogg|mov))(?:\s|$|<)/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  return null;
}

/**
 * 从 Markdown 内容中移除视频标签，返回纯文本内容
 */
export function removeVideoTags(markdown: string): string {
  if (!markdown) return '';

  return markdown
    // 移除自定义 !video[描述](url) 语法
    .replace(/!video\[.*?\]\([^)]+\)/gi, '')
    // 移除 HTML video 标签
    .replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '')
    // 移除包含视频的 Markdown 图片语法
    .replace(/!\[.*?\]\([^)]+\.(?:mp4|webm|ogg|mov)\)/gi, '')
    // 移除单独的视频 URL
    .replace(/(https?:\/\/[^\s<>"]+?\.(?:mp4|webm|ogg|mov))(?:\s|$)/gi, '')
    .trim();
}
