import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { HomePage } from './HomePage';
import { DiscussionsPage } from './DiscussionsPage';
import { CoursesPage } from './CoursesPage';
import { ChangelogPage } from './ChangelogPage';
import { PostDetailPage } from './PostDetailPage';
import { CourseDetailPage } from './CourseDetailPage';
import { UserBackend } from '../../user-backend/components/UserBackend';

export const Dashboard: React.FC = () => {
  return (
    <Routes>
      {/* 用户后台路由 - 独立布局 */}
      <Route path="/user-backend/*" element={<UserBackend />} />
      
      {/* 其他路由使用 DashboardLayout */}
      <Route 
        path="/*" 
        element={
          <DashboardLayout>
            <Routes>
              {/* 默认重定向到首页 */}
              <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
              
              {/* 主要页面路由 */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/discussions" element={<DiscussionsPage />} />
              <Route path="/discussions/:postId" element={<PostDetailPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              
              {/* 404 处理 */}
              <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
            </Routes>
          </DashboardLayout>
        } 
      />
    </Routes>
  );
};