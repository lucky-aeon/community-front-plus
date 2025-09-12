import React, { useState } from 'react';
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

interface UserBackendProps {
  onBackToFrontend: () => void;
}

export const UserBackend: React.FC<UserBackendProps> = ({ onBackToFrontend }) => {
  const [activeTab, setActiveTab] = useState('my-articles');

  const renderContent = () => {
    switch (activeTab) {
      case 'my-articles':
        return <MyArticlesPage />;
      case 'my-comments':
        return <ComingSoonPage title="我的评论" />;
      case 'my-favorites':
        return <ComingSoonPage title="我的收藏" />;
      case 'messages':
        return <MessageCenterPage />;
      case 'follows':
        return <ComingSoonPage title="关注管理" />;
      case 'analytics':
        return <ComingSoonPage title="内容数据" />;
      case 'profile':
        return <ProfileSettingsPage />;
      case 'security':
        return <ComingSoonPage title="安全设置" />;
      case 'devices':
        return <ComingSoonPage title="设备管理" />;
      default:
        return <MyArticlesPage />;
    }
  };

  return (
    <UserBackendLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBackToFrontend={onBackToFrontend}
    >
      {renderContent()}
    </UserBackendLayout>
  );
};