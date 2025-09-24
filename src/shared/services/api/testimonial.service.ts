import { apiClient, ApiResponse } from './config';
import {
  TestimonialDTO,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  PublicTestimonialDTO,
  TestimonialStatus
} from '@shared/types';

/**
 * 用户评价服务类
 * 提供用户端评价功能和公开评价展示功能
 */
export class TestimonialService {

  /**
   * 提交学员评价
   * POST /api/testimonials
   *
   * @description 用户提交自己的学习成果评价，每个用户只能提交一条评价
   * @param request 创建评价请求参数，包含评价内容和评分
   * @returns Promise<TestimonialDTO> 创建成功的评价详情信息
   */
  static async createTestimonial(request: CreateTestimonialRequest): Promise<TestimonialDTO> {
    const response = await apiClient.post<ApiResponse<TestimonialDTO>>('/testimonials', request);
    return response.data.data;
  }

  /**
   * 查看我的评价
   * GET /api/testimonials/my
   *
   * @description 用户查看自己提交的评价详情
   * @returns Promise<TestimonialDTO | null> 用户的评价详情，如果未提交则返回null
   */
  static async getMyTestimonial(): Promise<TestimonialDTO | null> {
    const response = await apiClient.get<ApiResponse<TestimonialDTO | null>>('/testimonials/my');
    return response.data.data;
  }

  /**
   * 更新我的评价
   * PUT /api/testimonials/{testimonialId}
   *
   * @description 用户修改自己的评价内容，只有待审核状态的评价可以修改
   * @param testimonialId 评价ID
   * @param request 更新评价请求参数，包含新的评价内容和评分
   * @returns Promise<TestimonialDTO> 更新后的评价详情信息
   */
  static async updateMyTestimonial(testimonialId: string, request: UpdateTestimonialRequest): Promise<TestimonialDTO> {
    const response = await apiClient.put<ApiResponse<TestimonialDTO>>(`/testimonials/${testimonialId}`, request);
    return response.data.data;
  }

  /**
   * 获取所有已发布的学员评价
   * GET /api/public/testimonials
   *
   * @description 前台展示用，返回所有已发布状态的评价，按排序权重和创建时间倒序排列
   * @returns Promise<PublicTestimonialDTO[]> 已发布的学员评价列表
   */
  static async getPublishedTestimonials(): Promise<PublicTestimonialDTO[]> {
    const response = await apiClient.get<ApiResponse<PublicTestimonialDTO[]>>('/public/testimonials');
    return response.data.data;
  }

  /**
   * 获取评价状态的中文描述
   * @param status 评价状态
   * @returns 中文描述
   */
  static getStatusDescription(status: TestimonialStatus): string {
    const statusMap: Record<TestimonialStatus, string> = {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'PUBLISHED': '已发布'
    };
    return statusMap[status] || status;
  }

  /**
   * 获取评价状态对应的颜色类型
   * @param status 评价状态
   * @returns 用于Badge组件的颜色类型
   */
  static getStatusVariant(status: TestimonialStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<TestimonialStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PENDING': 'outline',
      'APPROVED': 'secondary',
      'REJECTED': 'destructive',
      'PUBLISHED': 'default'
    };
    return variantMap[status] || 'outline';
  }

  /**
   * 验证评价内容
   * @param content 评价内容
   * @returns 验证结果
   */
  static validateContent(content: string): { valid: boolean; message?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, message: '评价内容不能为空' };
    }
    if (content.length > 2000) {
      return { valid: false, message: '评价内容不能超过2000个字符' };
    }
    return { valid: true };
  }

  /**
   * 验证评分
   * @param rating 评分
   * @returns 验证结果
   */
  static validateRating(rating: number): { valid: boolean; message?: string } {
    if (!rating || rating < 1 || rating > 5) {
      return { valid: false, message: '评分必须在1-5分之间' };
    }
    return { valid: true };
  }

  /**
   * 检查评价是否可编辑
   * @param status 评价状态
   * @returns 是否可编辑
   */
  static isEditable(status: TestimonialStatus): boolean {
    return status === 'PENDING';
  }

  /**
   * 获取状态说明文本
   * @param status 评价状态
   * @returns 状态说明
   */
  static getStatusHelpText(status: TestimonialStatus): string {
    const helpTextMap: Record<TestimonialStatus, string> = {
      'PENDING': '您的评价正在审核中，审核期间您可以继续编辑内容。',
      'APPROVED': '您的评价已通过审核，即将发布到网站首页。',
      'REJECTED': '很抱歉，您的评价未通过审核。如有疑问请联系客服。',
      'PUBLISHED': '恭喜！您的评价已在网站首页展示，感谢您的分享。'
    };
    return helpTextMap[status] || '';
  }
}
