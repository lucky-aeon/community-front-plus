import { apiClient, ApiResponse } from './config';
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostDTO,
  FrontPostDTO,
  FrontPostDetailDTO,
  PageResponse,
  PublicPostQueryRequest,
  Category
} from '../../types';

// 文章服务类
export class PostsService {
  
  /**
   * ============= 用户文章管理接口 =============
   */

  /**
   * 创建新文章（默认状态为草稿）
   * POST /api/user/posts
   */
  static async createPost(params: CreatePostRequest): Promise<PostDTO> {
    const response = await apiClient.post<ApiResponse<PostDTO>>('/user/posts', params);
    return response.data.data;
  }

  /**
   * 更新文章（只有文章作者才能修改）
   * PUT /api/user/posts/{id}
   */
  static async updatePost(id: string, params: UpdatePostRequest): Promise<PostDTO> {
    const response = await apiClient.put<ApiResponse<PostDTO>>(`/user/posts/${id}`, params);
    return response.data.data;
  }

  /**
   * 获取文章详情（只能查看自己的文章）
   * GET /api/user/posts/{id}
   */
  static async getPostById(id: string): Promise<PostDTO> {
    const response = await apiClient.get<ApiResponse<PostDTO>>(`/user/posts/${id}`);
    return response.data.data;
  }

  /**
   * 分页查询当前用户的文章列表
   * GET /api/user/posts
   */
  static async getUserPosts(params?: {
    pageNum?: number;
    pageSize?: number;
    status?: 'DRAFT' | 'PUBLISHED';
  }): Promise<PageResponse<PostDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<PostDTO>>>('/user/posts', { params });
    return response.data.data;
  }

  /**
   * 删除文章（软删除，只有文章作者才能删除）
   * DELETE /api/user/posts/{id}
   */
  static async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/user/posts/${id}`);
  }

  /**
   * 修改文章状态（在草稿和已发布状态之间切换）
   * PATCH /api/user/posts/{id}/status
   */
  static async updatePostStatus(id: string, status: 'DRAFT' | 'PUBLISHED'): Promise<PostDTO> {
    const response = await apiClient.patch<ApiResponse<PostDTO>>(`/user/posts/${id}/status`, { status });
    return response.data.data;
  }

  /**
   * ============= 公开文章查询接口 =============
   */

  /**
   * 分页查询公开文章列表（已发布的文章）
   * POST /api/public/posts/queries
   */
  static async getPublicPosts(params: PublicPostQueryRequest = {}): Promise<PageResponse<FrontPostDTO>> {
    const response = await apiClient.post<ApiResponse<PageResponse<FrontPostDTO>>>('/app/posts/queries', params);
    return response.data.data;
  }

  /**
   * 根据文章ID获取文章详情
   * GET /api/public/posts/{id}
   */
  static async getPublicPostDetail(id: string): Promise<FrontPostDetailDTO> {
    const response = await apiClient.get<ApiResponse<FrontPostDetailDTO>>(`/app/posts/${id}`);
    return response.data.data;
  }

  /**
   * ============= 分类相关接口 =============
   */

  /**
   * 获取文章分类列表
   */
  static async getCategories(type?: 'ARTICLE' | 'QA'): Promise<Category[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get<ApiResponse<Category[]>>('/app/categories/tree', { params });
    return response.data.data;
  }

  /**
   * ============= 便捷方法 =============
   */

  /**
   * 发布文章（将草稿状态改为发布状态）
   */
  static async publishPost(id: string): Promise<PostDTO> {
    return this.updatePostStatus(id, 'PUBLISHED');
  }

  /**
   * 撤回文章为草稿（将发布状态改为草稿状态）
   */
  static async draftPost(id: string): Promise<PostDTO> {
    return this.updatePostStatus(id, 'DRAFT');
  }

  /**
   * 创建并发布文章（一步到位）
   */
  static async createAndPublishPost(params: CreatePostRequest): Promise<PostDTO> {
    const post = await this.createPost(params);
    return this.publishPost(post.id);
  }
}