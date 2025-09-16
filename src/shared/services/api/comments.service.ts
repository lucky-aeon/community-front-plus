import { apiClient, ApiResponse } from './config';
import {
  CommentDTO,
  CreateCommentRequest,
  ReplyCommentRequest,
  QueryCommentsRequest,
  QueryUserCommentsRequest,
  PageResponse,
} from '../../types';

/**
 * 评论服务类
 * 提供评论的增删改查功能
 */
export class CommentsService {
  
  /**
   * ============= 用户评论管理接口（需要认证） =============
   */

  /**
   * 创建评论
   * POST /api/user/comments
   */
  static async createComment(params: CreateCommentRequest): Promise<CommentDTO> {
    const response = await apiClient.post<ApiResponse<CommentDTO>>('/user/app/comments', params);
    return response.data.data;
  }

  /**
   * 回复评论
   * POST /api/user/comments/{commentId}/reply
   */
  static async replyComment(commentId: string, params: ReplyCommentRequest): Promise<CommentDTO> {
    const response = await apiClient.post<ApiResponse<CommentDTO>>(
      `/user/comments/${commentId}/reply`, 
      params
    );
    return response.data.data;
  }

  /**
   * 删除评论（只有评论作者才能操作）
   * DELETE /api/user/comments/{commentId}
   */
  static async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/user/comments/${commentId}`);
  }

  /**
   * 获取用户相关评论（分页查询当前用户的相关评论）
   * GET /api/user/comments/related
   */
  static async getUserRelatedComments(params: QueryUserCommentsRequest = {}): Promise<PageResponse<CommentDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CommentDTO>>>(
      '/user/comments/related', 
      { params }
    );
    return response.data.data;
  }

  /**
   * 查询业务评论列表（获取指定业务对象的评论列表）
   * GET /api/comments
   */
  static async getBusinessComments(params: QueryCommentsRequest): Promise<PageResponse<CommentDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CommentDTO>>>(
      '/app/comments',
      { params }
    );
    return response.data.data;
  }

  /**
   * ============= 便捷方法 =============
   */

  /**
   * 获取文章评论列表
   */
  static async getPostComments(postId: string, pageNum = 1, pageSize = 10): Promise<PageResponse<CommentDTO>> {
    return this.getBusinessComments({
      businessId: postId,
      businessType: 'POST',
      pageNum,
      pageSize
    });
  }

  /**
   * 获取课程评论列表
   */
  static async getCourseComments(courseId: string, pageNum = 1, pageSize = 10): Promise<PageResponse<CommentDTO>> {
    return this.getBusinessComments({
      businessId: courseId,
      businessType: 'COURSE',
      pageNum,
      pageSize
    });
  }

  /**
   * 创建文章评论
   */
  static async createPostComment(postId: string, content: string): Promise<CommentDTO> {
    return this.createComment({
      businessId: postId,
      businessType: 'POST',
      content
    });
  }

  /**
   * 创建课程评论
   */
  static async createCourseComment(courseId: string, content: string): Promise<CommentDTO> {
    return this.createComment({
      businessId: courseId,
      businessType: 'COURSE',
      content
    });
  }

  /**
   * 回复文章评论
   */
  static async replyPostComment(
    commentId: string, 
    postId: string, 
    content: string, 
    replyUserId: string
  ): Promise<CommentDTO> {
    return this.replyComment(commentId, {
      parentCommentId: commentId,
      businessId: postId,
      businessType: 'POST',
      content,
      replyUserId
    });
  }

  /**
   * 回复课程评论
   */
  static async replyCourseComment(
    commentId: string, 
    courseId: string, 
    content: string, 
    replyUserId: string
  ): Promise<CommentDTO> {
    return this.replyComment(commentId, {
      parentCommentId: commentId,
      businessId: courseId,
      businessType: 'COURSE',
      content,
      replyUserId
    });
  }

  /**
   * ============= 工具方法 =============
   */

  /**
   * 将扁平的评论列表转换为树形结构
   * 用于前端展示嵌套评论
   */
  static buildCommentTree(comments: CommentDTO[]): CommentDTO[] {
    const commentMap = new Map<string, CommentDTO & { children: CommentDTO[] }>();
    const rootComments: (CommentDTO & { children: CommentDTO[] })[] = [];

    // 为每个评论添加 children 属性
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    // 构建树形结构
    comments.forEach(comment => {
      const commentWithChildren = commentMap.get(comment.id)!;
      
      if (comment.parentCommentId) {
        // 这是一个回复，添加到父评论的 children 中
        const parentComment = commentMap.get(comment.parentCommentId);
        if (parentComment) {
          parentComment.children.push(commentWithChildren);
        }
      } else {
        // 这是根评论
        rootComments.push(commentWithChildren);
      }
    });

    return rootComments;
  }

  /**
   * 格式化评论时间
   * 将API返回的时间字符串转换为友好的显示格式
   */
  static formatCommentTime(timeString: string): string {
    const now = new Date();
    const commentTime = new Date(timeString);
    const diffInSeconds = Math.floor((now.getTime() - commentTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else {
      return commentTime.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  /**
   * 检查用户是否可以删除指定评论
   * 只有评论作者才能删除自己的评论
   */
  static canDeleteComment(comment: CommentDTO, currentUserId?: string): boolean {
    return Boolean(currentUserId && comment.commentUserId === currentUserId);
  }
}