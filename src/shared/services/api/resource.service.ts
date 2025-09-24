import { apiClient, type ApiResponse } from './config';
import type {
  GetUploadCredentialsRequest,
  UploadCredentialsDTO,
  ResourceDTO,
  ResourceQueryRequest,
  PageResponse,
} from '@shared/types';

/**
 * 用户资源管理服务
 */
export class ResourceService {
  /**
   * 获取上传凭证（OSS直传）
   * POST /api/user/resource/upload-credentials
   */
  static async getUploadCredentials(
    params: GetUploadCredentialsRequest
  ): Promise<UploadCredentialsDTO> {
    const res = await apiClient.post<ApiResponse<UploadCredentialsDTO>>(
      '/user/resource/upload-credentials',
      params,
    );
    return res.data.data;
  }

  /**
   * 分页查询当前用户的资源列表
   * GET /api/user/resource/
   * 返回结构后端为 { records, total, pageNum, pageSize, pages }
   * 这里统一映射到前端 PageResponse 结构，便于复用分页组件
   */
  static async getMyResources(
    params: ResourceQueryRequest = {}
  ): Promise<PageResponse<ResourceDTO>> {
    const res = await apiClient.get<ApiResponse<any>>('/user/resource/', {
      params,
    });
    const data = res.data.data as {
      records: ResourceDTO[];
      total: number;
      pageNum: number;
      pageSize: number;
      pages: number;
    };
    return {
      records: data.records || [],
      total: data.total || 0,
      size: data.pageSize || params.pageSize || 10,
      current: data.pageNum || params.pageNum || 1,
      pages: data.pages || 0,
      orders: [],
      optimizeCountSql: true,
      searchCount: true,
      optimizeJoinOfCountSql: false,
    };
  }

  /**
   * 构造资源访问跳转URL（302跳转到带签名的资源链接）
   * GET /api/public/resource/{resourceId}/access
   */
  static buildAccessUrl(resourceId: string): string {
    return `/api/public/resource/${encodeURIComponent(resourceId)}/access`;
  }
}
