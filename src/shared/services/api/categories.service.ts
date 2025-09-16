import { apiClient, ApiResponse } from './config';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryRequest,
  CategoryDTO,
  PageResponse
} from '../../types';

// 分类管理服务类
export class CategoriesService {
  
  /**
   * ============= 管理员分类管理接口 =============
   */

  /**
   * 创建新分类（支持主分类和子分类）
   * POST /api/admin/categories
   */
  static async createCategory(params: CreateCategoryRequest): Promise<CategoryDTO> {
    const response = await apiClient.post<ApiResponse<CategoryDTO>>('/admin/categories', params);
    return response.data.data;
  }

  /**
   * 更新分类信息
   * PUT /api/admin/categories/{id}
   */
  static async updateCategory(id: string, params: UpdateCategoryRequest): Promise<CategoryDTO> {
    const response = await apiClient.put<ApiResponse<CategoryDTO>>(`/admin/categories/${id}`, params);
    return response.data.data;
  }

  /**
   * 删除分类（软删除）
   * DELETE /api/admin/categories/{id}
   */
  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/categories/${id}`);
  }

  /**
   * 获取分类详情
   * GET /api/admin/categories/{id}
   */
  static async getCategoryById(id: string): Promise<CategoryDTO> {
    const response = await apiClient.get<ApiResponse<CategoryDTO>>(`/admin/categories/${id}`);
    return response.data.data;
  }

  /**
   * 分页查询分类列表（支持类型和父分类筛选）
   * GET /api/admin/categories
   */
  static async getCategoriesList(params?: CategoryQueryRequest): Promise<PageResponse<CategoryDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CategoryDTO>>>('/admin/categories', {
      params: {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.type && { type: params.type }),
        ...(params?.parentId && { parentId: params.parentId })
      }
    });
    return response.data.data;
  }

  /**
   * ============= 实用工具方法 =============
   */

  /**
   * 将扁平的分类列表转换为树形结构
   * @param categories 扁平的分类列表
   * @returns 树形结构的分类列表
   */
  static buildCategoryTree(categories: CategoryDTO[]): CategoryDTO[] {
    const categoryMap = new Map<string, CategoryDTO>();
    const rootCategories: CategoryDTO[] = [];

    // 创建分类映射
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // 构建树形结构
    categories.forEach(category => {
      const currentCategory = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory) {
          parentCategory.children = parentCategory.children || [];
          parentCategory.children.push(currentCategory);
        }
      } else {
        rootCategories.push(currentCategory);
      }
    });

    // 按排序值排序
    const sortCategories = (cats: CategoryDTO[]) => {
      cats.sort((a, b) => a.sortOrder - b.sortOrder);
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };

    sortCategories(rootCategories);
    return rootCategories;
  }

  /**
   * 获取所有主分类（level = 0）
   * @param type 可选的分类类型筛选
   * @returns 主分类列表
   */
  static async getRootCategories(type?: 'ARTICLE' | 'QA'): Promise<CategoryDTO[]> {
    const response = await this.getCategoriesList({
      pageNum: 1,
      pageSize: 100, // 获取较多数据
      type,
      parentId: undefined // 只获取主分类
    });
    
    return response.records.filter(cat => cat.level === 0);
  }
}