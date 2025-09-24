import { apiClient, ApiResponse } from './config';
import {
  CreateChapterRequest,
  UpdateChapterRequest,
  ChapterQueryRequest,
  ChapterDTO,
  FrontChapterDetailDTO,
  LatestChapterDTO,
  PageResponse
} from '@shared/types';

// 课程章节管理服务类
export class ChaptersService {
  
  /**
   * ============= 管理员课程章节管理接口 =============
   */

  /**
   * 创建新的课程章节
   * POST /api/admin/chapters
   */
  static async createChapter(params: CreateChapterRequest): Promise<ChapterDTO> {
    const response = await apiClient.post<ApiResponse<ChapterDTO>>('/admin/chapters', params);
    return response.data.data;
  }

  /**
   * 更新课程章节信息
   * PUT /api/admin/chapters/{id}
   */
  static async updateChapter(id: string, params: UpdateChapterRequest): Promise<ChapterDTO> {
    const response = await apiClient.put<ApiResponse<ChapterDTO>>(`/admin/chapters/${id}`, params);
    return response.data.data;
  }

  /**
   * 删除课程章节（软删除）
   * DELETE /api/admin/chapters/{id}
   */
  static async deleteChapter(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/chapters/${id}`);
  }

  /**
   * 获取章节详情
   * GET /api/admin/chapters/{id}
   */
  static async getChapterById(id: string): Promise<ChapterDTO> {
    const response = await apiClient.get<ApiResponse<ChapterDTO>>(`/admin/chapters/${id}`);
    return response.data.data;
  }

  /**
   * 获取课程的所有章节
   * GET /api/admin/chapters (通过 courseId 参数查询)
   */
  static async getCourseChapters(params: ChapterQueryRequest): Promise<PageResponse<ChapterDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<ChapterDTO>>>('/admin/chapters', {
      params: {
        courseId: params.courseId,
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10
      }
    });
    return response.data.data;
  }

  /**
   * 获取课程的所有章节（不分页，用于章节列表显示）
   * GET /api/admin/chapters?courseId={courseId}&pageSize=1000
   */
  static async getAllCourseChapters(courseId: string): Promise<ChapterDTO[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<ChapterDTO>>>('/admin/chapters', {
      params: {
        courseId,
        pageNum: 1,
        pageSize: 1000 // 获取所有章节
      }
    });
    return response.data.data.records;
  }

  /**
   * 批量更新章节顺序
   * PUT /api/admin/chapters/order
   */
  static async updateChaptersOrder(chapterIds: string[]): Promise<void> {
    await apiClient.put<ApiResponse<null>>('/admin/chapters/order', { chapterIds });
  }

  /**
   * ============= 前台章节接口 =============
   */

  /**
   * 获取章节详情（前台用户访问）
   * GET /api/app/chapters/{id}
   */
  static async getFrontChapterDetail(id: string): Promise<FrontChapterDetailDTO> {
    const response = await apiClient.get<ApiResponse<FrontChapterDetailDTO>>(`/app/chapters/${id}`);
    return response.data.data;
  }

  /**
   * 获取最新章节列表
   * GET /api/app/chapters/latest
   */
  static async getLatestChapters(): Promise<LatestChapterDTO[]> {
    const response = await apiClient.get<ApiResponse<LatestChapterDTO[]>>('/app/chapters/latest');
    return response.data.data;
  }

  /**
   * ============= 实用工具方法 =============
   */

  /**
   * 格式化章节阅读时间
   * @param minutes 分钟数
   * @returns 格式化的时间字符串
   */
  static formatReadingTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
  }

  /**
   * 生成章节预览内容
   * @param content Markdown 内容
   * @param maxLength 最大长度，默认150字符
   * @returns 预览文本
   */
  static generatePreview(content: string, maxLength: number = 150): string {
    // 移除 Markdown 标记
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/\n+/g, ' ') // 将换行符替换为空格
      .trim();

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength).trim() + '...' 
      : plainText;
  }

  /**
   * 验证章节数据
   * @param data 章节数据
   * @returns 验证结果
   */
  static validateChapterData(data: Partial<CreateChapterRequest | UpdateChapterRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length < 2) {
      errors.push('章节标题至少需要2个字符');
    }
    if (data.title && data.title.length > 200) {
      errors.push('章节标题不能超过200个字符');
    }

    if (!data.content || data.content.trim().length < 10) {
      errors.push('章节内容至少需要10个字符');
    }

    if (!data.courseId || !data.courseId.trim()) {
      errors.push('必须指定所属课程');
    }

    if (data.sortOrder === undefined || data.sortOrder === null || data.sortOrder < 0) {
      errors.push('排序值必须是非负数');
    }

    if (data.readingTime !== undefined && (data.readingTime < 0 || data.readingTime > 10000)) {
      errors.push('阅读时间必须在0-10000分钟之间');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 计算章节内容的预估阅读时间（基于字数）
   * @param content Markdown 内容
   * @returns 预估阅读时间（分钟）
   */
  static estimateReadingTime(content: string): number {
    // 移除 Markdown 标记，计算纯文本字数
    const plainText = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    // 按中文平均阅读速度（每分钟约300字）计算
    const wordsPerMinute = 300;
    const wordCount = plainText.length;
    const estimatedMinutes = Math.max(1, Math.round(wordCount / wordsPerMinute));

    return estimatedMinutes;
  }
}
