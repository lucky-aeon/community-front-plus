import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@shared/components/layout/AppLayout';
import { HomePage } from './HomePage';
import { DiscussionsPage } from './DiscussionsPage';
import { CoursesPage } from './CoursesPage';
import { ChangelogPage } from './ChangelogPage';
import { PostDetailPage } from './PostDetailPage';
import { CourseDetailPage } from './CourseDetailPage';
import { ChapterDetailPage } from './ChapterDetailPage';
import { UserBackend } from '../../user-backend/components/UserBackend';
import { MembershipPage } from './MembershipPage';
import { AiNewsPage } from './AiNewsPage';
import { AiNewsDetailPage } from './AiNewsDetailPage';

export const Dashboard: React.FC = () => {
  return (
    <Routes>
      {/* 用户后台路由 - 独立布局 */}
      <Route path="/user-backend/*" element={<UserBackend />} />
      
      {/* 其他路由使用新的 AppLayout */}
      <Route
        path="/*"
        element={
          <AppLayout>
            <Routes>
              {/* 默认重定向到首页 */}
              <Route path="/" element={<Navigate to="/dashboard/home" replace />} />

              {/* 主要页面路由 */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/discussions" element={<DiscussionsPage />} />
              <Route path="/discussions/:postId" element={<PostDetailPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId/chapters/:chapterId" element={<ChapterDetailPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/ai-news" element={<AiNewsPage />} />
              <Route path="/ai-news/daily/:date" element={<AiNewsPage />} />
              <Route path="/ai-news/:id" element={<AiNewsDetailPage />} />

              {/* 404 处理 */}
              <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
            </Routes>
          </AppLayout>
        } 
      />
    </Routes>
  );
};
