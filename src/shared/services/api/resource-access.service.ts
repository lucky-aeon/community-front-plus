import { apiClient, ApiResponse } from './config';
import { PagedResourceResponse, ResourceQueryRequest } from '@shared/types/upload.types';

/**
 * 资源访问服务
 * 负责资源的访问、查询和管理
 */
export class ResourceAccessService {
  /**
   * 若传入的是资源ID，则转换为可访问URL；若已是URL，原样返回；为空返回空
   */
  static toAccessUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    const v = String(value);
    if (v.startsWith('http') || v.startsWith('/')) return v;
    try {
      return this.getResourceAccessUrl(v);
    } catch {
      return v;
    }
  }
  /**
   * 读取本地 Token 并拼装鉴权头
   */
  private static buildAuthHeaders(): HeadersInit | undefined {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch { void 0; }
    return undefined;
  }

  /**
   * 生成资源访问URL
   * 这个URL会触发后端的302重定向到OSS签名URL
   * @param resourceId 资源ID
   */
  static getResourceAccessUrl(resourceId: string): string {
    if (!resourceId) {
      throw new Error('资源ID不能为空');
    }
    // 迁移到公共资源访问端点，由后端基于 Cookie 鉴权
    return `/api/public/resource/${resourceId}/access`;
  }

  /**
   * 获取资源直接访问URL（用于img标签等）
   * @param resourceId 资源ID
   */
  static getResourceDirectUrl(resourceId: string): string {
    return this.getResourceAccessUrl(resourceId);
  }

  /**
   * 建立资源访问会话（服务端下发短时效 HttpOnly Cookie）
   * - 需要 Bearer 认证，后端据此签发资源访问票据（RAUTH）
   * - 跨域部署时需 withCredentials 以接收 Set-Cookie
   */
  static async ensureSession(): Promise<void> {
    // 已改为登录时下发 Cookie 的模式，不再需要单独建立资源访问会话
    // 这里保持函数存在以兼容既有调用，但不做任何网络请求
    return Promise.resolve();
  }

  /**
   * 下载资源文件
   * @param resourceId 资源ID
   * @param filename 下载文件名（可选）
   */
  static downloadResource(resourceId: string, filename?: string): void {
    const url = this.getResourceAccessUrl(resourceId);

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    link.style.display = 'none';

    // 添加到DOM并触发点击
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
  }

  /**
   * 在新窗口中打开资源
   * @param resourceId 资源ID
   */
  static openResourceInNewWindow(resourceId: string): void {
    const url = this.getResourceAccessUrl(resourceId);
    window.open(url, '_blank');
  }

  /**
   * 获取当前用户的资源列表
   * @param params 查询参数
   */
  static async getUserResources(
    params: ResourceQueryRequest = {}
  ): Promise<PagedResourceResponse> {
    try {
      const response = await apiClient.get<ApiResponse<PagedResourceResponse>>(
        '/user/resource/',
        { params }
      );

      // 后端标准响应：{ code, message, data }
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('响应格式错误');
      }
      return response.data.data as PagedResourceResponse;
    } catch (error) {
      console.error('获取用户资源列表失败:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || '获取资源列表失败');
      }

      throw new Error('获取资源列表失败，请检查网络连接');
    }
  }

  /**
   * 根据资源类型获取资源列表
   * @param resourceType 资源类型
   * @param pageNum 页码
   * @param pageSize 每页大小
   */
  static async getResourcesByType(
    resourceType: string,
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<PagedResourceResponse> {
    return this.getUserResources({
      resourceType,
      pageNum,
      pageSize
    });
  }

  /**
   * 获取图片资源列表
   * @param pageNum 页码
   * @param pageSize 每页大小
   */
  static async getImageResources(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<PagedResourceResponse> {
    return this.getResourcesByType('IMAGE', pageNum, pageSize);
  }

  /**
   * 获取视频资源列表
   * @param pageNum 页码
   * @param pageSize 每页大小
   */
  static async getVideoResources(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<PagedResourceResponse> {
    return this.getResourcesByType('VIDEO', pageNum, pageSize);
  }

  /**
   * 获取文档资源列表
   * @param pageNum 页码
   * @param pageSize 每页大小
   */
  static async getDocumentResources(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<PagedResourceResponse> {
    return this.getResourcesByType('DOCUMENT', pageNum, pageSize);
  }

  /**
   * 预加载资源（用于优化用户体验）
   * @param resourceId 资源ID
   */
  static preloadResource(resourceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('资源预加载失败'));
      img.src = this.getResourceAccessUrl(resourceId);
    });
  }

  /**
   * 检查资源是否可访问
   * @param resourceId 资源ID
   */
  static async checkResourceAccessibility(resourceId: string): Promise<boolean> {
    try {
      const response = await fetch(this.getResourceAccessUrl(resourceId), {
        method: 'HEAD',
        headers: this.buildAuthHeaders(),
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('检查资源可访问性失败:', error);
      return false;
    }
  }

  /**
   * 获取资源的元数据信息
   * 通过HEAD请求获取资源的大小、类型等信息
   * @param resourceId 资源ID
   */
  static async getResourceMetadata(resourceId: string): Promise<{
    size?: number;
    type?: string;
    lastModified?: Date;
  }> {
    try {
      const response = await fetch(this.getResourceAccessUrl(resourceId), {
        method: 'HEAD',
        headers: this.buildAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('无法获取资源元数据');
      }

      const size = response.headers.get('content-length');
      const type = response.headers.get('content-type');
      const lastModified = response.headers.get('last-modified');

      return {
        size: size ? parseInt(size, 10) : undefined,
        type: type || undefined,
        lastModified: lastModified ? new Date(lastModified) : undefined
      };
    } catch (error) {
      console.error('获取资源元数据失败:', error);
      throw error;
    }
  }

  /**
   * 格式化文件大小
   * @param bytes 文件大小（字节）
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 根据文件扩展名获取文件类型
   * @param filename 文件名
   */
  static getFileTypeByExtension(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop() || '';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];

    if (imageExtensions.includes(extension)) return 'IMAGE';
    if (videoExtensions.includes(extension)) return 'VIDEO';
    if (audioExtensions.includes(extension)) return 'AUDIO';
    if (documentExtensions.includes(extension)) return 'DOCUMENT';

    return 'OTHER';
  }

  /**
   * 获取文件图标类名（用于显示文件类型图标）
   * @param filename 文件名或文件类型
   */
  static getFileIconClass(filename: string): string {
    const type = this.getFileTypeByExtension(filename);

    switch (type) {
      case 'IMAGE': return 'file-image';
      case 'VIDEO': return 'file-video';
      case 'AUDIO': return 'file-audio';
      case 'DOCUMENT': return 'file-text';
      default: return 'file';
    }
  }
}
