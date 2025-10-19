import { apiClient, type ApiResponse } from './config';
import type {
  InterviewQuestionDTO,
  CreateInterviewQuestionRequest,
  UpdateInterviewQuestionRequest,
  InterviewQuestionQueryRequest,
  PageResponse,
  BatchCreateInterviewQuestionsRequest,
  InterviewProblemStatus,
} from '@shared/types';

// 面试题（题库）服务
export class InterviewQuestionsService {
  // 公开题库列表（已发布）
  static async getPublicQuestions(params: InterviewQuestionQueryRequest = {}): Promise<PageResponse<InterviewQuestionDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<InterviewQuestionDTO>>>('/interview-questions', { params });
    return response.data.data;
  }

  // 我的面试题列表
  static async getMyQuestions(params: InterviewQuestionQueryRequest = {}): Promise<PageResponse<InterviewQuestionDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<InterviewQuestionDTO>>>('/interview-questions/my', { params });
    return response.data.data;
  }

  // 获取题目详情
  static async getById(id: string): Promise<InterviewQuestionDTO> {
    const response = await apiClient.get<ApiResponse<InterviewQuestionDTO>>(`/interview-questions/${id}`);
    return response.data.data;
  }

  // 创建题目（默认草稿）
  static async create(payload: CreateInterviewQuestionRequest): Promise<InterviewQuestionDTO> {
    const response = await apiClient.post<ApiResponse<InterviewQuestionDTO>>('/interview-questions', payload);
    return response.data.data;
  }

  // 更新题目
  static async update(id: string, payload: UpdateInterviewQuestionRequest): Promise<InterviewQuestionDTO> {
    const response = await apiClient.put<ApiResponse<InterviewQuestionDTO>>(`/interview-questions/${id}`, payload);
    return response.data.data;
  }

  // 批量创建（默认已发布）
  static async batchCreate(payload: BatchCreateInterviewQuestionsRequest): Promise<InterviewQuestionDTO[]> {
    const response = await apiClient.post<ApiResponse<InterviewQuestionDTO[]>>('/interview-questions/batch', payload);
    return response.data.data || [];
  }

  // 修改题目状态（草稿/发布）
  static async changeStatus(id: string, status: InterviewProblemStatus): Promise<InterviewQuestionDTO> {
    const response = await apiClient.patch<ApiResponse<InterviewQuestionDTO>>(`/interview-questions/${id}/status`, { status });
    return response.data.data;
  }

  // 删除题目
  static async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/interview-questions/${id}`);
  }
}

export default InterviewQuestionsService;
