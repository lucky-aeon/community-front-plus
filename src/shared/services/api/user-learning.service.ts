import { apiClient, type ApiResponse } from './config';
import type {
  ReportChapterProgressRequest,
  CourseProgressDTO,
  LearningRecordItemDTO,
  PageResponse,
} from '@shared/types';

/**
 * 用户学习进度与记录服务
 * 对接 UserLearningController
 */
export class UserLearningService {
  /**
   * 上报章节学习进度（心跳/阈值打点）
   * POST /api/user/learning/progress/report
   */
  static async reportChapterProgress(params: ReportChapterProgressRequest): Promise<CourseProgressDTO> {
    const resp = await apiClient.post<ApiResponse<CourseProgressDTO>>('/user/learning/progress/report', params);
    return resp.data.data;
  }

  /**
   * 获取当前用户某课程的学习进度汇总
   * GET /api/user/learning/progress/{courseId}
   */
  static async getCourseProgress(courseId: string): Promise<CourseProgressDTO> {
    const resp = await apiClient.get<ApiResponse<CourseProgressDTO>>(`/user/learning/progress/${courseId}`);
    return resp.data.data;
  }

  /**
   * 学习记录分页：全部课程的进度与最近学习位置
   * GET /api/user/learning/records?pageNum=&pageSize=
   */
  static async listMyLearningRecords(pageNum: number = 1, pageSize: number = 10): Promise<PageResponse<LearningRecordItemDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<LearningRecordItemDTO>>>('/user/learning/records', {
      params: { pageNum, pageSize },
    });
    return resp.data.data;
  }
}

export default UserLearningService;

