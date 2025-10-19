import { apiClient, type ApiResponse } from './config';
import type {
  InterviewQuestionDTO,
  InterviewQuestionQueryRequest,
  PageResponse,
  UpdateInterviewQuestionRequest,
  InterviewProblemStatus,
} from '@shared/types';

// 管理员 面试题管理服务
export class AdminInterviewQuestionsService {
  static async page(params: InterviewQuestionQueryRequest = {}): Promise<PageResponse<InterviewQuestionDTO>> {
    const res = await apiClient.get<ApiResponse<PageResponse<InterviewQuestionDTO>>>('/admin/interview-questions', { params });
    return res.data.data;
  }

  static async getById(id: string): Promise<InterviewQuestionDTO> {
    const res = await apiClient.get<ApiResponse<InterviewQuestionDTO>>(`/admin/interview-questions/${id}`);
    return res.data.data;
  }

  static async update(id: string, payload: UpdateInterviewQuestionRequest): Promise<InterviewQuestionDTO> {
    const res = await apiClient.put<ApiResponse<InterviewQuestionDTO>>(`/admin/interview-questions/${id}`, payload);
    return res.data.data;
  }

  // 修改题目状态（草稿/发布）- 使用用户接口
  static async changeStatus(id: string, status: InterviewProblemStatus): Promise<InterviewQuestionDTO> {
    const res = await apiClient.patch<ApiResponse<InterviewQuestionDTO>>(`/interview-questions/${id}/status`, { status });
    return res.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/interview-questions/${id}`);
  }
}

export default AdminInterviewQuestionsService;

