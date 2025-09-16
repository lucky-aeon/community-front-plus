import { apiClient, ApiResponse } from './config';
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseQueryRequest,
  CourseDTO,
  PageResponse
} from '../../types';

// 课程管理服务类
export class CoursesService {
  
  /**
   * ============= 管理员课程管理接口 =============
   */

  /**
   * 创建新课程
   * POST /api/admin/courses
   */
  static async createCourse(params: CreateCourseRequest): Promise<CourseDTO> {
    const response = await apiClient.post<ApiResponse<CourseDTO>>('/admin/courses', params);
    return response.data.data;
  }

  /**
   * 更新课程信息
   * PUT /api/admin/courses/{id}
   */
  static async updateCourse(id: string, params: UpdateCourseRequest): Promise<CourseDTO> {
    const response = await apiClient.put<ApiResponse<CourseDTO>>(`/admin/courses/${id}`, params);
    return response.data.data;
  }

  /**
   * 删除课程（软删除）
   * DELETE /api/admin/courses/{id}
   */
  static async deleteCourse(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/courses/${id}`);
  }

  /**
   * 获取课程详情
   * GET /api/admin/courses/{id}
   */
  static async getCourseById(id: string): Promise<CourseDTO> {
    const response = await apiClient.get<ApiResponse<CourseDTO>>(`/admin/courses/${id}`);
    return response.data.data;
  }

  /**
   * 分页查询课程列表（支持状态筛选和关键词搜索）
   * GET /api/admin/courses
   */
  static async getCoursesList(params?: CourseQueryRequest): Promise<PageResponse<CourseDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CourseDTO>>>('/admin/courses', {
      params: {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.status && { status: params.status }),
        ...(params?.keyword && { keyword: params.keyword })
      }
    });
    return response.data.data;
  }

  /**
   * ============= 实用工具方法 =============
   */

  /**
   * 根据状态获取状态显示文本
   * @param status 课程状态
   * @returns 状态显示文本
   */
  static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': '待更新',
      'IN_PROGRESS': '更新中',
      'COMPLETED': '已完成'
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 根据状态获取状态颜色变体
   * @param status 课程状态
   * @returns 状态颜色变体
   */
  static getStatusVariant(status: string): 'warning' | 'primary' | 'success' | 'default' {
    const variantMap: Record<string, 'warning' | 'primary' | 'success' | 'default'> = {
      'PENDING': 'warning',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success'
    };
    return variantMap[status] || 'default';
  }

  /**
   * 格式化总阅读时间
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
}