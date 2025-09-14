import { apiClient, ApiResponse } from './config';

// 创建文章请求参数接口
export interface CreatePostRequest {
  title: string;          // 文章标题 (必填, 5-200字符)
  content: string;        // 文章内容 (必填, 最少10个字符, 支持Markdown)
  summary?: string;       // 文章概要 (可选, 最多500字符)
  coverImage?: string;    // 封面图片URL (可选, 最多500字符)
  categoryId: string;     // 分类ID (必填, 必须是有效的分类UUID)
}

// 文章分类接口
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建文章响应接口
export interface CreatePostResponse {
  id: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  category?: Category;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// 文章服务类
export class PostsService {
  
  /**
   * 创建/发布文章
   */
  static async createPost(params: CreatePostRequest): Promise<CreatePostResponse> {
    const response = await apiClient.post<ApiResponse<CreatePostResponse>>('/user/posts', params);
    return response.data.data;
  }

  /**
   * 获取文章分类列表（根据类型过滤，无需token验证的公开接口）
   */
  static async getCategories(type?: 'ARTICLE' | 'QA'): Promise<Category[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get<ApiResponse<Category[]>>('/public/categories/tree', { params });
    return response.data.data;
  }

  /**
   * 根据ID获取文章详情
   */
  static async getPostById(id: string): Promise<CreatePostResponse> {
    const response = await apiClient.get<ApiResponse<CreatePostResponse>>(`/posts/${id}`);
    return response.data.data;
  }

  /**
   * 更新文章
   */
  static async updatePost(id: string, params: Partial<CreatePostRequest>): Promise<CreatePostResponse> {
    const response = await apiClient.put<ApiResponse<CreatePostResponse>>(`/user/posts/${id}`, params);
    return response.data.data;
  }

  /**
   * 删除文章
   */
  static async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/user/posts/${id}`);
  }

  /**
   * 发布文章 (将草稿状态改为发布状态)
   */
  static async publishPost(id: string): Promise<CreatePostResponse> {
    const response = await apiClient.post<ApiResponse<CreatePostResponse>>(`/user/posts/${id}/publish`);
    return response.data.data;
  }
}