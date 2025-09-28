import React from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { UserBackendLayout } from './UserBackendLayout';
import { MyArticlesPage } from './MyArticlesPage';
import { MyCommentsPage } from './MyCommentsPage';
import { MyTestimonialPage } from './MyTestimonialPage';
import { MessageCenterPage } from './MessageCenterPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { MyResourcesPage } from './MyResourcesPage';
import { DeviceManagementPage } from './DeviceManagementPage';
import { FollowsPage } from './FollowsPage';
import { CreatePostPage } from '../../user-portal/components/CreatePostPage';
import { PostsService } from '@shared/services/api/posts.service';
import { PostDTO } from '@shared/types';

// 创建文章页面包装器
const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <CreatePostPage 
      onPostCreated={() => {
        navigate('/dashboard/user-backend/articles');
      }} 
    />
  );
};

// 编辑文章页面包装器
const EditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = React.useState<PostDTO | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      PostsService.getPostById(id)
        .then(setInitialData)
        .catch(() => {
          navigate('/dashboard/user-backend/articles');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">文章不存在</div>
      </div>
    );
  }

  return (
    <CreatePostPage 
      onPostCreated={() => {
        navigate('/dashboard/user-backend/articles');
      }}
      initialData={initialData}
    />
  );
};

export const UserBackend: React.FC = () => {
  return (
    <UserBackendLayout>
      <Routes>
        {/* 默认重定向到个人信息 */}
        <Route path="/" element={<Navigate to="/dashboard/user-backend/profile" replace />} />
        
        {/* 用户后台页面路由 */}
        <Route path="/articles" element={<MyArticlesPage />} />
        <Route path="/articles/create" element={<CreateArticlePage />} />
        <Route path="/articles/edit/:id" element={<EditArticlePage />} />
        <Route path="/testimonial" element={<MyTestimonialPage />} />
        <Route path="/resources" element={<MyResourcesPage />} />
        <Route path="/messages" element={<MessageCenterPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
        
        {/* 临时占位页面 */}
        <Route path="/comments" element={<MyCommentsPage />} />
        <Route path="/follows" element={<FollowsPage />} />
        <Route path="/devices" element={<DeviceManagementPage />} />
        
        {/* 404 处理 */}
        <Route path="*" element={<Navigate to="/dashboard/user-backend/profile" replace />} />
      </Routes>
    </UserBackendLayout>
  );
};
