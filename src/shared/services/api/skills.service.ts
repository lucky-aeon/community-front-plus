import { apiClient, type ApiResponse } from './config';
import type { PageResponse, PublicSkillDTO, PublicSkillDetailDTO, PublicSkillQueryRequest } from '@shared/types';

export class SkillsService {
  static async getPublicSkills(params?: PublicSkillQueryRequest): Promise<PageResponse<PublicSkillDTO>> {
    const response = await apiClient.post<ApiResponse<PageResponse<PublicSkillDTO>>>(
      '/public/skills/queries',
      {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 9,
        keyword: params?.keyword?.trim() || undefined,
      }
    );

    return response.data.data;
  }

  static async getPublicSkillById(id: string): Promise<PublicSkillDetailDTO> {
    const response = await apiClient.get<ApiResponse<PublicSkillDetailDTO>>(`/public/skills/${id}`);
    const data = response.data.data;

    return {
      ...data,
      summary: data.summary ?? '',
      description: data.description ?? '',
      githubUrl: data.githubUrl ?? '',
      authorName: data.authorName ?? '',
    };
  }
}
