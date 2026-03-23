import { apiClient, type ApiResponse } from './config';
import type {
  SkillDTO,
  SkillQueryRequest,
  CreateSkillRequest,
  UpdateSkillRequest,
  PageResponse,
} from '@shared/types';

export class SkillsService {
  static async getPublicSkills(params: SkillQueryRequest = {}): Promise<PageResponse<SkillDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SkillDTO>>>('/public/skills', { params });
    return response.data.data;
  }

  static async getMySkills(params: SkillQueryRequest = {}): Promise<PageResponse<SkillDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SkillDTO>>>('/user/skills', { params });
    return response.data.data;
  }

  static async createSkill(payload: CreateSkillRequest): Promise<SkillDTO> {
    const response = await apiClient.post<ApiResponse<SkillDTO>>('/user/skills', payload);
    return response.data.data;
  }

  static async updateSkill(id: string, payload: UpdateSkillRequest): Promise<SkillDTO> {
    const response = await apiClient.put<ApiResponse<SkillDTO>>(`/user/skills/${id}`, payload);
    return response.data.data;
  }

  static async deleteSkill(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/user/skills/${id}`);
  }
}

export default SkillsService;
