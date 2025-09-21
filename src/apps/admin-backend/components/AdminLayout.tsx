import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Activity,
  Users,
  Shield,
  FileText,
  Tag,
  BookOpen,
  Settings,
  FileCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Package,
  Key,
  Calendar,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarSection, SidebarSectionTitle } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleBackToFrontend = () => {
    navigate('/dashboard');
  };

  const navigationSections = [
    {
      title: '数据看板',
      items: [
        { id: 'overview', name: '总览', icon: BarChart3, path: '/dashboard/admin/overview' },
        { id: 'monitor', name: '实时监控', icon: Activity, path: '/dashboard/admin/monitor' }
      ]
    },
    {
      title: '用户管理',
      items: [
        { id: 'users', name: '用户列表', icon: Users, path: '/dashboard/admin/users' },
        { id: 'sessions', name: '会话管理', icon: Smartphone, path: '/dashboard/admin/sessions' },
        { id: 'permissions', name: '权限管理', icon: Shield, path: '/dashboard/admin/permissions' },
        { id: 'subscription-plans', name: '套餐管理', icon: Package, path: '/dashboard/admin/subscription-plans' },
        { id: 'cdk', name: 'CDK管理', icon: Key, path: '/dashboard/admin/cdk' }
      ]
    },
    {
      title: '内容管理',
      items: [
        { id: 'posts', name: '文章管理', icon: FileText, path: '/dashboard/admin/posts' },
        { id: 'categories', name: '分类管理', icon: Tag, path: '/dashboard/admin/categories' },
        { id: 'courses', name: '课程管理', icon: BookOpen, path: '/dashboard/admin/courses' },
        { id: 'update-logs', name: '更新日志', icon: Calendar, path: '/dashboard/admin/update-logs' }
      ]
    },
    {
      title: '系统管理',
      items: [
        { id: 'settings', name: '系统配置', icon: Settings, path: '/dashboard/admin/settings' },
        { id: 'logs', name: '操作日志', icon: FileCheck, path: '/dashboard/admin/logs' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 relative z-10">
        <Sidebar collapsed={isCollapsed} className="shadow-sm">
          <SidebarHeader className={isCollapsed ? 'px-2' : ''}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded shrink-0 object-contain" />
                {!isCollapsed && <span className="font-bold">管理后台</span>}
              </div>
              <div className="shrink-0">
                {!isCollapsed ? (
                  <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} title="展开">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* User */}
            <div className={`px-2 pb-3 ${isCollapsed ? 'text-center' : ''}`}>
              <div className="flex items-center gap-3">
                <img src={user?.avatar} alt={user?.name} className={`rounded-full object-cover shrink-0 ${isCollapsed ? 'h-8 w-8 mx-auto' : 'h-10 w-10'}`} />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <Button variant="secondary" className="w-full mt-3" onClick={handleBackToFrontend}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> 返回前台
                </Button>
              )}
            </div>

            {navigationSections.map((section) => (
              <SidebarSection key={section.title}>
                {!isCollapsed && <SidebarSectionTitle>{section.title}</SidebarSectionTitle>}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn('w-full justify-start', isCollapsed ? 'px-2' : 'px-3', active && 'bg-accent text-accent-foreground')}
                        asChild
                      >
                        <NavLink to={item.path} title={isCollapsed ? item.name : undefined} onClick={() => setIsSidebarOpen(false)}>
                          <span className="inline-flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span>{item.name}</span>}
                          </span>
                        </NavLink>
                      </Button>
                    );
                  })}
                </div>
              </SidebarSection>
            ))}
          </SidebarContent>
          <SidebarFooter className={isCollapsed ? 'px-2' : undefined}>
            {isCollapsed ? (
              <Button variant="outline" size="icon" className="w-full" onClick={handleBackToFrontend} title="返回前台">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground">v1.0.0</div>
            )}
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Mobile header + drawer */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden bg-background border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-semibold">管理后台</div>
            <div className="w-9" />
          </div>
        </div>

        <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <DialogContent className="p-0 max-w-[320px] left-0 top-0 bottom-0 translate-x-0 translate-y-0 h-screen w-[80vw] sm:w-[360px] rounded-none border-r">
            {/* 无障碍要求：为 Dialog 提供可读标题（隐藏可视显示） */}
            <DialogHeader className="sr-only">
              <DialogTitle>移动侧边导航</DialogTitle>
            </DialogHeader>
            <Sidebar className="h-full" collapsed={false}>
              <SidebarHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.jpg" className="h-8 w-8 rounded" />
                    <span className="font-bold">管理后台</span>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                {navigationSections.map((section) => (
                  <SidebarSection key={section.title}>
                    <SidebarSectionTitle>{section.title}</SidebarSectionTitle>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                          <Button key={item.id} variant="ghost" className={cn('w-full justify-start', active && 'bg-accent text-accent-foreground')} asChild>
                            <NavLink to={item.path} onClick={() => setIsSidebarOpen(false)}>
                              <span className="inline-flex items-center gap-3">
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                              </span>
                            </NavLink>
                          </Button>
                        );
                      })}
                    </div>
                  </SidebarSection>
                ))}
              </SidebarContent>
              <SidebarFooter>
                <Button variant="secondary" className="w-full" onClick={handleBackToFrontend}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> 返回前台
                </Button>
              </SidebarFooter>
            </Sidebar>
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
};
