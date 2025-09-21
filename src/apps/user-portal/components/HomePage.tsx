import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { PageContainer } from '@shared/components/layout/PageContainer';
import { RecentContent } from '@shared/components/business/RecentContent';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDTO } from '@shared/types';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<FrontPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取最新内容
  useEffect(() => {
    const fetchRecentContent = async () => {
      try {
        setIsLoading(true);
        const response = await PostsService.getPublicPosts({
          pageNum: 1,
          pageSize: 5
        });
        setRecentPosts(response.records);
      } catch (error) {
        console.error('获取最新内容失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentContent();
  }, []);

  // 转换数据格式以适应新组件
  const transformedContent = recentPosts.map(post => ({
    id: post.id,
    type: 'post' as const,
    title: post.title,
    excerpt: post.summary,
    author: {
      name: post.authorName,
      avatar: '/api/placeholder/40/40', // 使用占位符，因为API没有返回头像
      membershipTier: 'basic' as const // 默认值，实际应该从API获取
    },
    stats: {
      likes: post.likeCount,
      comments: post.commentCount,
      views: post.viewCount
    },
    publishTime: post.publishTime,
    category: post.categoryName,
    coverImage: post.coverImage
  }));

  if (!user) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-warm-gray-600">登录后查看个性化的社区内容</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      {/* Recent Content - Full Width */}
      <RecentContent
        items={isLoading ? undefined : transformedContent}
      />
    </PageContainer>
  );
};