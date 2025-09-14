import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserBackendLayout } from './UserBackendLayout';
import { MyArticlesPage } from './MyArticlesPage';
import { MessageCenterPage } from './MessageCenterPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';

// 临时的占位页面组件
const ComingSoonPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">此功能正在开发中，敬请期待...</p>
  </div>
);

export const UserBackend: React.FC = () => {
  return (
    <UserBackendLayout>
      <Routes>
        {/* 默认重定向到我的文章 */}
        <Route path="/" element={<Navigate to="/dashboard/user-backend/articles" replace />} />
        
        {/* 用户后台页面路由 */}
        <Route path="/articles" element={<MyArticlesPage />} />
        <Route path="/messages" element={<MessageCenterPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
        
        {/* 临时占位页面 */}
        <Route path="/comments" element={<ComingSoonPage title="我的评论" />} />
        <Route path="/favorites" element={<ComingSoonPage title="我的收藏" />} />
        <Route path="/follows" element={<ComingSoonPage title="关注管理" />} />
        <Route path="/analytics" element={<ComingSoonPage title="内容数据" />} />
        <Route path="/security" element={<ComingSoonPage title="安全设置" />} />
        <Route path="/devices" element={<ComingSoonPage title="设备管理" />} />
        
        {/* 404 处理 */}
        <Route path="*" element={<Navigate to="/dashboard/user-backend/articles" replace />} />
      </Routes>
    </UserBackendLayout>
  );
};