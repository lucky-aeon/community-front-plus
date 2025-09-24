import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { OverviewPage } from './OverviewPage';
import { CategoriesPage } from './CategoriesPage';
import { CoursesPage } from './CoursesPage';
import { PostsPage } from './PostsPage';
import { UsersPage } from './UsersPage';
import { SessionsPage } from './SessionsPage';
import { IpBanPage } from './IpBanPage';
import { LogsPage } from './LogsPage';
import { SubscriptionPlansPage } from './SubscriptionPlansPage';
import { UpdateLogPage } from './UpdateLogPage';
import { CDKPage } from './CDKPage';
import { SettingsPage } from './SettingsPage';
import { TestimonialsPage } from './TestimonialsPage';
import { OrdersPage } from './OrdersPage';
import { ResourcesPage } from './ResourcesPage';

// 临时的占位页面组件
const ComingSoonPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">此功能正在开发中，敬请期待...</p>
  </div>
);

export const AdminBackend: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        {/* 默认重定向到数据总览 */}
        <Route path="/" element={<Navigate to="/dashboard/admin/overview" replace />} />
        
        {/* 数据看板 */}
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/monitor" element={<ComingSoonPage title="实时监控" />} />
        
        {/* 用户管理 */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/ip-ban" element={<IpBanPage />} />
        <Route path="/permissions" element={<ComingSoonPage title="权限管理" />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
        <Route path="/cdk" element={<CDKPage />} />
        
        {/* 内容管理 */}
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/comments" element={<ComingSoonPage title="评论管理" />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/update-logs" element={<UpdateLogPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        
        {/* 系统管理 */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/logs" element={<LogsPage />} />
        
        {/* 404 处理 */}
        <Route path="*" element={<Navigate to="/dashboard/admin/overview" replace />} />
      </Routes>
    </AdminLayout>
  );
};
