import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Heart, 
  Bell, 
  Users, 
  BarChart3, 
  Settings, 
  User, 
  Shield, 
  Smartphone,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface UserBackendLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBackToFrontend: () => void;
}

export const UserBackendLayout: React.FC<UserBackendLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onBackToFrontend
}) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationSections = [
    {
      title: '内容管理',
      items: [
        { id: 'my-articles', name: '我的文章', icon: FileText },
        { id: 'my-comments', name: '我的评论', icon: MessageSquare },
        { id: 'my-favorites', name: '我的收藏', icon: Heart }
      ]
    },
    {
      title: '互动管理',
      items: [
        { id: 'messages', name: '消息中心', icon: Bell },
        { id: 'follows', name: '关注管理', icon: Users }
      ]
    },
    {
      title: '数据统计',
      items: [
        { id: 'analytics', name: '内容数据', icon: BarChart3 }
      ]
    },
    {
      title: '账户设置',
      items: [
        { id: 'profile', name: '个人信息', icon: User },
        { id: 'security', name: '安全设置', icon: Shield },
        { id: 'devices', name: '设备管理', icon: Smartphone }
      ]
    }
  ];

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToFrontend}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="返回前台"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">用户中心</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(user?.membershipTier || 'guest')}`}>
                  {user?.membershipTier?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 mb-1
                    ${activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </div>
                  {activeTab === item.id && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">用户中心</h2>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};