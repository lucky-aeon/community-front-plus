import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, BookOpen, Menu, X, ChevronLeft, ChevronRight, PenTool, Settings, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { navigationConfig } from '@shared/routes/routes';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 映射图标组件
  const iconMap = {
    Home,
    MessageSquare,
    BookOpen,
    FileText
  };

  const navigation = navigationConfig.map(item => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap]
  }));

  const handleUserBackendClick = () => {
    navigate('/dashboard/user-backend');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-yellow-200 text-yellow-800';
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
        <div className={`flex items-center h-16 border-b border-gray-200 ${
          isCollapsed 
            ? 'justify-center px-2' 
            : 'justify-between px-6'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
              <h1 className="text-xl font-bold text-yellow-400">
                敲鸭
              </h1>
            </div>
          )}
          {isCollapsed && (
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded flex-shrink-0 object-contain" />
          )}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`lg:hidden p-2 rounded-lg hover:bg-gray-100 ${isCollapsed ? 'hidden' : ''}`}
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
          {!isCollapsed && (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleUserBackendClick}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                用户中心
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </button>
            </div>
          )}
          
          {isCollapsed && (
            <div className="mt-2 space-y-2">
              <button
                onClick={handleUserBackendClick}
                className="w-full flex items-center justify-center p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="用户中心"
              >
                <Settings className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`mt-6 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navigation.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                w-full flex items-center justify-between text-sm font-medium rounded-lg transition-all duration-200 mb-1
                ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'}
                ${isActive
                  ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-4 border-transparent'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center">
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <span>{item.name}</span>
                    )}
                  </div>
                  {!isCollapsed && isActive && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </NavLink>
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

      {/* 退出登录确认对话框 */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="退出登录"
        message="确定要退出当前账户吗？退出后需要重新登录才能访问。"
        confirmText="退出登录"
        cancelText="取消"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};