import { apiClient, type ApiResponse } from './config';
import { ResourceAccessService } from './resource-access.service';

export interface ExpressionTypeDTO {
  code: string;
  name: string;
  imageUrl?: string; // 后端已提供的可访问URL或资源路径
}

let cachedExpressions: ExpressionTypeDTO[] | null = null;
let cachedAliasMap: Record<string, string> | null = null;
let loadingPromise: Promise<ExpressionTypeDTO[]> | null = null;

export class ExpressionsService {
  /** 获取启用的表情列表（需登录）：GET /api/expressions */
  static async getAll(): Promise<ExpressionTypeDTO[]> {
    if (cachedExpressions) return cachedExpressions;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      const res = await apiClient.get<ApiResponse<ExpressionTypeDTO[]>>('/expressions');
      const list = (res.data?.data || []).map((it: any) => ({
        code: it.code,
        name: it.name || it.code,
        imageUrl: it.imageUrl,
      })) as ExpressionTypeDTO[];
      cachedExpressions = list;
      return list;
    })();

    try {
      return await loadingPromise;
    } finally {
      loadingPromise = null;
    }
  }

  /** 获取 Markdown 别名映射（code -> imageUrl）：GET /api/expressions/alias-map */
  static async getAliasMap(): Promise<Record<string, string>> {
    if (cachedAliasMap) return cachedAliasMap;
    const res = await apiClient.get<ApiResponse<Record<string, string>>>('/expressions/alias-map');
    cachedAliasMap = res.data?.data || {};
    return cachedAliasMap;
  }

  /** 将后端的 imageUrl/资源ID 转换为可访问URL */
  static toImageUrl(input?: string): string | undefined {
    if (!input) return undefined;
    return ResourceAccessService.toAccessUrl(input);
  }

  /** 构建用于 Cherry 的 customEmoji 映射：name/code/alias -> url */
  static async buildEmojiMap(): Promise<Record<string, string>> {
    const [list, alias] = await Promise.all([
      this.getAll().catch(() => [] as ExpressionTypeDTO[]),
      this.getAliasMap().catch(() => ({} as Record<string, string>)),
    ]);
    const map: Record<string, string> = {};
    list.forEach((e) => {
      const url = this.toImageUrl(e.imageUrl) || '';
      if (e.name) map[e.name] = url;
      if (e.code) map[e.code] = url;
    });
    Object.entries(alias).forEach(([code, url]) => {
      map[code] = this.toImageUrl(url) || url;
    });
    return map;
  }
}
