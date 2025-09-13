import React, { useState } from 'react';
import { Home, MessageSquare, BookOpen, User, Menu, X, ChevronLeft, ChevronRight, PenTool, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEnterUserBackend?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onEnterUserBackend
}) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { id: 'home', name: '首页', icon: Home },
    { id: 'discussions', name: '讨论', icon: MessageSquare },
    { id: 'courses', name: '课程', icon: BookOpen },
    { id: 'profile', name: '个人中心', icon: User }
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
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduElite
              </h1>
            </div>
          )}
          {isCollapsed && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl mx-auto">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Collapse button for desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* User info */}
        <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className={`rounded-full object-cover ${isCollapsed ? 'h-8 w-8 mx-auto' : 'h-12 w-12'}`}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(user?.membershipTier || 'guest')}`}>
                    {user?.membershipTier?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 用户中心按钮 */}
          {!isCollapsed && onEnterUserBackend && (
            <div className="mt-4">
              <button
                onClick={onEnterUserBackend}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                用户中心
              </button>
            </div>
          )}
          
          {isCollapsed && onEnterUserBackend && (
            <div className="mt-2">
              <button
                onClick={onEnterUserBackend}
                className="w-full flex items-center justify-center p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="用户中心"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`mt-6 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center text-sm font-medium rounded-xl transition-colors duration-200 mb-1
                ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'}
                ${activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <span>{item.name}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};