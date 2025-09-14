import { PostsService } from './posts.service';
import { CreatePostRequest, UpdatePostRequest } from '../../types';

/**
 * 文章服务测试和使用示例
 * 这个文件演示了如何使用PostsService中的各种方法
 */

// 示例：创建文章
export const testCreatePost = async () => {
  const createRequest: CreatePostRequest = {
    title: '测试文章标题',
    content: '这是一篇测试文章的内容，支持Markdown格式。\n\n## 二级标题\n\n- 列表项1\n- 列表项2',
    summary: '这是文章的摘要信息',
    coverImage: 'https://example.com/cover.jpg',
    categoryId: 'category-uuid-here'
  };

  try {
    const result = await PostsService.createPost(createRequest);
    console.log('文章创建成功:', result);
    return result;
  } catch (error) {
    console.error('文章创建失败:', error);
    throw error;
  }
};

// 示例：更新文章
export const testUpdatePost = async (postId: string) => {
  const updateRequest: UpdatePostRequest = {
    title: '更新后的文章标题',
    content: '更新后的文章内容',
    summary: '更新后的摘要',
    categoryId: 'new-category-uuid'
  };

  try {
    const result = await PostsService.updatePost(postId, updateRequest);
    console.log('文章更新成功:', result);
    return result;
  } catch (error) {
    console.error('文章更新失败:', error);
    throw error;
  }
};

// 示例：获取用户文章列表
export const testGetUserPosts = async () => {
  try {
    // 获取第一页，每页10条，只显示已发布的文章
    const result = await PostsService.getUserPosts({
      pageNum: 1,
      pageSize: 10,
      status: 'PUBLISHED'
    });
    console.log('用户文章列表:', result);
    return result;
  } catch (error) {
    console.error('获取用户文章列表失败:', error);
    throw error;
  }
};

// 示例：获取公开文章列表
export const testGetPublicPosts = async () => {
  try {
    const result = await PostsService.getPublicPosts({
      pageNum: 1,
      pageSize: 20,
      categoryType: 'ARTICLE'
    });
    console.log('公开文章列表:', result);
    return result;
  } catch (error) {
    console.error('获取公开文章列表失败:', error);
    throw error;
  }
};

// 示例：发布文章（状态切换）
export const testPublishPost = async (postId: string) => {
  try {
    const result = await PostsService.publishPost(postId);
    console.log('文章发布成功:', result);
    return result;
  } catch (error) {
    console.error('文章发布失败:', error);
    throw error;
  }
};

// 示例：撤回文章为草稿
export const testDraftPost = async (postId: string) => {
  try {
    const result = await PostsService.draftPost(postId);
    console.log('文章撤回为草稿成功:', result);
    return result;
  } catch (error) {
    console.error('文章撤回失败:', error);
    throw error;
  }
};

// 示例：删除文章
export const testDeletePost = async (postId: string) => {
  try {
    await PostsService.deletePost(postId);
    console.log('文章删除成功');
  } catch (error) {
    console.error('文章删除失败:', error);
    throw error;
  }
};

// 示例：获取分类列表
export const testGetCategories = async () => {
  try {
    // 获取所有分类
    const allCategories = await PostsService.getCategories();
    console.log('所有分类:', allCategories);

    // 只获取文章分类
    const articleCategories = await PostsService.getCategories('ARTICLE');
    console.log('文章分类:', articleCategories);

    // 只获取问答分类
    const qaCategories = await PostsService.getCategories('QA');
    console.log('问答分类:', qaCategories);

    return allCategories;
  } catch (error) {
    console.error('获取分类列表失败:', error);
    throw error;
  }
};

// 完整的工作流程示例
export const testCompleteWorkflow = async () => {
  try {
    console.log('开始完整的文章工作流程测试...');

    // 1. 获取分类列表
    const categories = await testGetCategories();
    if (categories.length === 0) {
      throw new Error('没有可用的分类');
    }

    // 2. 创建文章（草稿状态）
    const createRequest: CreatePostRequest = {
      title: '完整工作流程测试文章',
      content: '这是一篇用于测试完整工作流程的文章。',
      summary: '工作流程测试摘要',
      categoryId: categories[0].id
    };
    const createdPost = await testCreatePost();

    // 3. 更新文章
    await testUpdatePost(createdPost.id);

    // 4. 发布文章
    await testPublishPost(createdPost.id);

    // 5. 获取用户文章列表
    await testGetUserPosts();

    // 6. 获取公开文章列表
    await testGetPublicPosts();

    // 7. 撤回文章为草稿
    await testDraftPost(createdPost.id);

    // 8. 删除文章
    await testDeletePost(createdPost.id);

    console.log('完整工作流程测试完成！');
  } catch (error) {
    console.error('工作流程测试失败:', error);
    throw error;
  }
};