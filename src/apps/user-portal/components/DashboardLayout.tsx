import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, BookOpen, Menu, X, ChevronLeft, ChevronRight, Settings, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { navigationConfig } from '@shared/routes/routes';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarSection, SidebarSectionTitle } from '@/components/ui/sidebar';
import { MembershipBadge, type MembershipTier } from '@shared/components/ui/MembershipBadge';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 图标映射
  const iconMap = { Home, MessageSquare, BookOpen, FileText } as const;
  const navigation = navigationConfig.map((item) => ({ ...item, icon: iconMap[item.icon as keyof typeof iconMap] }));

  const handleUserBackendClick = () => navigate('/dashboard/user-backend');
  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => logout();

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={isCollapsed} className="shadow-sm">
          <SidebarHeader className={isCollapsed ? 'px-2' : ''}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded object-contain shrink-0" />
                {!isCollapsed && <span className="font-bold">敲鸭</span>}
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
            {/* User card */}
            <div className={`px-2 pb-3 ${isCollapsed ? 'text-center' : ''}`}>
              <div className="flex items-center gap-3">
                <img src={user?.avatar} alt={user?.name} className={`rounded-full object-cover shrink-0 ${isCollapsed ? 'h-8 w-8 mx-auto' : 'h-10 w-10'}`} />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{user?.name}</div>
                    <MembershipBadge
                      tier={(user?.membershipTier || 'basic') as MembershipTier}
                      size="sm"
                      text={user?.currentSubscriptionPlanName || undefined}
                      level={user?.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                    />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" onClick={handleUserBackendClick}><Settings className="h-4 w-4 mr-2" />用户中心</Button>
                  <Button variant="outline" size="sm" className="text-red-600" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />退出</Button>
                </div>
              )}
            </div>

            <SidebarSection>
              {!isCollapsed && <SidebarSectionTitle>导航</SidebarSectionTitle>}
              <div className="space-y-1">
                {navigation.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <Button key={item.id} variant="ghost" className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} ${active ? 'bg-accent text-accent-foreground' : ''}`} asChild>
                      <NavLink to={item.path} title={isCollapsed ? item.name : undefined}>
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
          </SidebarContent>
          <SidebarFooter className={isCollapsed ? 'px-2' : undefined}>
            {isCollapsed ? (
              <Button variant="outline" size="icon" className="w-full" onClick={handleLogout} title="退出登录">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground">欢迎回来</div>
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
            <div className="font-semibold">敲鸭</div>
            <div className="w-9" />
          </div>
        </div>

        <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <DialogContent hideClose className="p-0 max-w-[320px] left-0 top-0 bottom-0 translate-x-0 translate-y-0 h-screen w-[80vw] sm:w-[360px] rounded-none border-r">
            <Sidebar className="h-full" collapsed={false}>
              <SidebarHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><img src="/logo.jpg" className="h-8 w-8 rounded" /><span className="font-bold">敲鸭</span></div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarSection>
                  <SidebarSectionTitle>导航</SidebarSectionTitle>
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const active = location.pathname.startsWith(item.path);
                      return (
                        <Button key={item.id} variant="ghost" className={`w-full justify-start ${active ? 'bg-accent text-accent-foreground' : ''}`} asChild>
                          <NavLink to={item.path} onClick={() => setIsSidebarOpen(false)}>
                            <span className="inline-flex items-center gap-3"><item.icon className="h-5 w-5" /><span>{item.name}</span></span>
                          </NavLink>
                        </Button>
                      );
                    })}
                  </div>
                </SidebarSection>
              </SidebarContent>
              <SidebarFooter>
                <Button variant="outline" className="w-full" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />退出登录</Button>
              </SidebarFooter>
            </Sidebar>
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-auto">{children}</main>
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
