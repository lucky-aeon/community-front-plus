import { apiClient, type ApiResponse } from './config';
import type {
  CreateSkillRequest,
  PageResponse,
  PublicSkillDTO,
  PublicSkillDetailDTO,
  PublicSkillQueryRequest,
  SkillDetailDTO,
  SkillListDTO,
  SkillQueryRequest,
  UpdateSkillRequest,
} from '@shared/types';

const normalizePublicSkillItem = (data: PublicSkillDTO): PublicSkillDTO => ({
  ...data,
  summary: data.summary ?? '',
  githubUrl: data.githubUrl ?? '',
  authorName: data.authorName ?? '',
  likeCount: Number(data.likeCount ?? 0),
  favoriteCount: Number(data.favoriteCount ?? 0),
  commentCount: Number(data.commentCount ?? 0),
});

const normalizePublicSkillDetail = (data: PublicSkillDetailDTO): PublicSkillDetailDTO => ({
  ...data,
  summary: data.summary ?? '',
  description: data.description ?? '',
  githubUrl: data.githubUrl ?? '',
  authorName: data.authorName ?? '',
  likeCount: Number(data.likeCount ?? 0),
  favoriteCount: Number(data.favoriteCount ?? 0),
  commentCount: Number(data.commentCount ?? 0),
});

const normalizeUserSkillListItem = (data: Partial<SkillListDTO> & { id: string; name: string }): SkillListDTO => ({
  id: data.id,
  userId: data.userId ?? '',
  name: data.name,
  summary: data.summary ?? '',
  githubUrl: data.githubUrl ?? '',
  authorName: data.authorName ?? '',
  createTime: data.createTime ?? '',
  updateTime: data.updateTime ?? '',
});

const normalizeUserSkillDetail = (data: Partial<SkillDetailDTO> & { id: string; name: string }): SkillDetailDTO => ({
  ...normalizeUserSkillListItem(data),
  description: data.description ?? '',
});

export class SkillsService {
  static async getPublicSkills(params?: PublicSkillQueryRequest): Promise<PageResponse<PublicSkillDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<PublicSkillDTO>>>(
      '/public/skills',
      {
        params: {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 9,
        keyword: params?.keyword?.trim() || undefined,
        },
      }
    );

    const page = response.data.data;
    page.records = (page.records || []).map((item) => normalizePublicSkillItem(item));
    return page;
  }

  static async getPublicSkillById(id: string): Promise<PublicSkillDetailDTO> {
    const response = await apiClient.get<ApiResponse<PublicSkillDetailDTO>>(`/public/skills/${id}`);
    return normalizePublicSkillDetail(response.data.data);
  }

  static async getMySkills(params?: SkillQueryRequest): Promise<PageResponse<SkillListDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SkillListDTO>>>('/user/skills/my', {
      params: {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 10,
        keyword: params?.keyword?.trim() || undefined,
      },
    });

    const page = response.data.data;
    page.records = (page.records || []).map((item) => normalizeUserSkillListItem(item));
    return page;
  }

  static async getMySkillById(id: string): Promise<SkillDetailDTO> {
    const response = await apiClient.get<ApiResponse<SkillDetailDTO>>(`/user/skills/${id}`);
    return normalizeUserSkillDetail(response.data.data);
  }

  static async createSkill(payload: CreateSkillRequest): Promise<SkillDetailDTO> {
    const response = await apiClient.post<ApiResponse<SkillDetailDTO>>('/user/skills', payload);
    return normalizeUserSkillDetail(response.data.data);
  }

  static async updateSkill(id: string, payload: UpdateSkillRequest): Promise<SkillDetailDTO> {
    const response = await apiClient.put<ApiResponse<SkillDetailDTO>>(`/user/skills/${id}`, payload);
    return normalizeUserSkillDetail(response.data.data);
  }

  static async deleteSkill(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/user/skills/${id}`);
  }
}
