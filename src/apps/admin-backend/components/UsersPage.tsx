import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Settings, UserX, UserCheck, Search, XCircle } from 'lucide-react';
import { AdminUserService } from '@shared/services/api/admin-user.service';
import { AdminUserDTO, AdminUserQueryRequest, PageResponse } from '@shared/types';
import { showToast } from '@shared/utils/toast';
import AdminPagination from '@shared/components/AdminPagination';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
  });

  // 搜索和筛选状态
  const [searchParams, setSearchParams] = useState<AdminUserQueryRequest>({
    pageNum: 1,
    pageSize: 10,
    email: '',
    name: '',
    status: undefined
  });

  // 对话框状态
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    user: AdminUserDTO | null;
  }>({
    open: false,
    user: null
  });

  const [deviceDialog, setDeviceDialog] = useState<{
    open: boolean;
    user: AdminUserDTO | null;
    newDeviceCount: string;
    submitting: boolean;
  }>({
    open: false,
    user: null,
    newDeviceCount: '',
    submitting: false
  });

  // 加载用户数据
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response: PageResponse<AdminUserDTO> = await AdminUserService.getUsers(searchParams);
      setUsers(response.records);
      setPagination({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages
      });
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 页面初始化加载
  useEffect(() => {
    loadUsers();
  }, [searchParams.pageNum, searchParams.pageSize, searchParams.status, loadUsers]);

  // 搜索防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchParams.email || searchParams.name) {
        loadUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchParams.email, searchParams.name, loadUsers]);

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      pageNum: 1,
      pageSize: 10,
      email: '',
      name: '',
      status: undefined
    });
  };
  const handleRefresh = () => loadUsers();
  const handleQuery = () => { setSearchParams(prev => ({ ...prev, pageNum: 1 })); loadUsers(); };

  // 切换用户状态
  const handleToggleStatus = async (userId: string) => {
    try {
      const updatedUser = await AdminUserService.toggleUserStatus(userId);
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? updatedUser : user
        )
      );
      setStatusDialog({ open: false, user: null });
    } catch (error) {
      console.error('切换用户状态失败:', error);
    }
  };

  // 打开状态切换确认对话框
  const openStatusDialog = (user: AdminUserDTO) => {
    setStatusDialog({ open: true, user });
  };

  // 打开设备数量编辑对话框
  const openDeviceDialog = (user: AdminUserDTO) => {
    setDeviceDialog({
      open: true,
      user,
      newDeviceCount: user.maxConcurrentDevices.toString(),
      submitting: false
    });
  };

  // 更新设备数量
  const handleUpdateDeviceCount = async () => {
    if (!deviceDialog.user) return;

    const newCount = parseInt(deviceDialog.newDeviceCount);
    if (isNaN(newCount) || newCount < 1 || newCount > 10) {
      showToast.error('设备数量必须是 1-10 之间的整数');
      return;
    }

    try {
      setDeviceDialog(prev => ({ ...prev, submitting: true }));
      const updatedUser = await AdminUserService.updateUserDeviceCount(
        deviceDialog.user.id,
        newCount
      );

      setUsers(prev =>
        prev.map(user =>
          user.id === deviceDialog.user?.id ? updatedUser : user
        )
      );

      setDeviceDialog({
        open: false,
        user: null,
        newDeviceCount: '',
        submitting: false
      });
    } catch (error) {
      console.error('更新设备数量失败:', error);
      setDeviceDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      pageNum: page
    }));
  };

  // 渲染用户状态徽章
  const renderStatusBadge = (status: 'ACTIVE' | 'INACTIVE') => {
    return (
      <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
        {status === 'ACTIVE' ? '激活' : '禁用'}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 筛选 + 操作 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="搜索邮箱" value={searchParams.email || ''} onChange={(e) => setSearchParams(prev => ({ ...prev, email: e.target.value }))} />
            <Input placeholder="搜索用户名" value={searchParams.name || ''} onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))} />
            <Select value={searchParams.status || 'all'} onValueChange={(value) => setSearchParams(prev => ({ ...prev, status: value === 'all' ? undefined : (value as 'ACTIVE' | 'INACTIVE') }))}>
              <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ACTIVE">激活</SelectItem>
                <SelectItem value="INACTIVE">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button onClick={handleQuery} disabled={loading}>
              <Search className="mr-2 h-4 w-4" /> 查询
            </Button>
          </div>

          {/* 表格区域：内容自适应，不铺满；横向滚动放在外层容器，避免移动端拖动受限 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">用户信息</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[80px]">设备数</TableHead>
                  <TableHead className="min-w-[100px]">创建时间</TableHead>
                  <TableHead className="text-right min-w-[160px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // 加载状态骨架屏
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  // 空数据状态
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      暂无用户数据
                    </TableCell>
                  </TableRow>
                ) : (
                  // 用户数据行
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{user.maxConcurrentDevices}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(user.createTime).toLocaleDateString('zh-CN')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusDialog(user)}
                          >
                            {user.status === 'ACTIVE' ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                禁用
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                激活
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeviceDialog(user)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            设备
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页：始终展示统计信息；页数>1 时展示按钮 */}
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页
              </div>
              {pagination.pages > 1 && (
                <AdminPagination
                  current={pagination.current}
                  totalPages={pagination.pages}
                  onChange={(p) => setSearchParams(prev => ({ ...prev, pageNum: p }))}
                  mode="full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态切换确认对话框 */}
      <AlertDialog open={statusDialog.open} onOpenChange={(open) => setStatusDialog({ open, user: null })}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认操作</AlertDialogTitle>
            <AlertDialogDescription>
              确定要{statusDialog.user?.status === 'ACTIVE' ? '禁用' : '激活'}用户 "{statusDialog.user?.name}" 吗？
              {statusDialog.user?.status === 'ACTIVE' && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  禁用后该用户将无法登录系统。
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => statusDialog.user && handleToggleStatus(statusDialog.user.id)}
              className={statusDialog.user?.status === 'ACTIVE' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              确认{statusDialog.user?.status === 'ACTIVE' ? '禁用' : '激活'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 设备数量编辑对话框 */}
      <Dialog open={deviceDialog.open} onOpenChange={(open) => {
        if (!deviceDialog.submitting) {
          setDeviceDialog({ open, user: null, newDeviceCount: '', submitting: false });
        }
      }}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <DialogHeader>
            <DialogTitle>修改设备数量</DialogTitle>
            <DialogDescription>
              为用户 "{deviceDialog.user?.name}" 设置最大并发设备数量
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceCount">设备数量 (1-10)</Label>
              <Input
                id="deviceCount"
                type="number"
                min="1"
                max="10"
                value={deviceDialog.newDeviceCount}
                onChange={(e) => setDeviceDialog(prev => ({ ...prev, newDeviceCount: e.target.value }))}
                placeholder="请输入设备数量"
                disabled={deviceDialog.submitting}
              />
              <p className="text-sm text-muted-foreground">
                当前设备数量: {deviceDialog.user?.maxConcurrentDevices}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeviceDialog({ open: false, user: null, newDeviceCount: '', submitting: false })}
              disabled={deviceDialog.submitting}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateDeviceCount}
              disabled={deviceDialog.submitting}
            >
              {deviceDialog.submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
