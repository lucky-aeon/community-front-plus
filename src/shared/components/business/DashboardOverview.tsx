import React, { useState, useEffect } from 'react';
import { RecentContent } from './RecentContent';
import { RecentCourseChapters } from './RecentCourseChapters';
import { RecentComments } from './RecentComments';
import { UpdateLogs } from './UpdateLogs';
import { PostsService } from '@shared/services/api/posts.service';
import { ChaptersService } from '@shared/services/api/chapters.service';
import { CommentsService } from '@shared/services/api/comments.service';
import { UpdateLogService } from '@shared/services/api/update-log.service';
import {
  FrontPostDTO,
  LatestChapterDTO,
  LatestCommentDTO,
  UpdateLogDTO
} from '@shared/types';
import { cn } from '@/lib/utils';

interface DashboardOverviewProps {
  className?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ className }) => {
  const [recentPosts, setRecentPosts] = useState<FrontPostDTO[]>([]);
  const [recentChapters, setRecentChapters] = useState<LatestChapterDTO[]>([]);
  const [recentComments, setRecentComments] = useState<LatestCommentDTO[]>([]);
  const [updateLogs, setUpdateLogs] = useState<UpdateLogDTO[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    posts: true,
    chapters: true,
    comments: true,
    logs: true
  });

  // 获取最新文章
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await PostsService.getPublicPosts({
          pageNum: 1,
          pageSize: 5
        });
        setRecentPosts(response.records);
      } catch (error) {
        console.error('获取最新文章失败:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, posts: false }));
      }
    };

    fetchRecentPosts();
  }, []);

  // 获取最新课程章节
  useEffect(() => {
    const fetchRecentChapters = async () => {
      try {
        const chapters = await ChaptersService.getLatestChapters();
        setRecentChapters(chapters);
      } catch (error) {
        console.error('获取最新章节失败:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, chapters: false }));
      }
    };

    fetchRecentChapters();
  }, []);

  // 获取最新评论
  useEffect(() => {
    const fetchRecentComments = async () => {
      try {
        const comments = await CommentsService.getLatestComments();
        setRecentComments(comments);
      } catch (error) {
        console.error('获取最新评论失败:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, comments: false }));
      }
    };

    fetchRecentComments();
  }, []);

  // 获取更新日志
  useEffect(() => {
    const fetchUpdateLogs = async () => {
      try {
        const updateLogs = await UpdateLogService.getPublicUpdateLogs();
        // 只取前3个
        setUpdateLogs(updateLogs.slice(0, 3));
      } catch (error) {
        console.error('获取更新日志失败:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, logs: false }));
      }
    };

    fetchUpdateLogs();
  }, []);

  // 转换文章数据格式
  const transformedPosts = recentPosts.map(post => ({
    id: post.id,
    type: 'post' as const,
    title: post.title,
    excerpt: post.summary,
    author: {
      name: post.authorName,
      avatar: post.authorAvatar || '/api/placeholder/40/40',
      membershipTier: 'basic' as const
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

  return (
    <div className={cn("space-y-6", className)}>
      {/* 三栏布局容器 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧栏：最新课程 + 更新日志 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 最新课程章节 */}
          <RecentCourseChapters
            chapters={recentChapters}
            isLoading={loadingStates.chapters}
          />

          {/* 更新日志 */}
          <UpdateLogs
            logs={updateLogs}
            isLoading={loadingStates.logs}
          />
        </div>

        {/* 中间主栏：最新文章 */}
        <div className="lg:col-span-6">
          <RecentContent
            items={loadingStates.posts ? undefined : transformedPosts}
            showHeader={true}
            compact={false}
          />
        </div>

        {/* 右侧栏：最新评论 */}
        <div className="lg:col-span-3">
          <RecentComments
            comments={recentComments}
            isLoading={loadingStates.comments}
          />
        </div>
      </div>
    </div>
  );
};
