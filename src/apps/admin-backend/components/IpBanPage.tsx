import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Shield, Trash2, UserX } from 'lucide-react';
import { AdminIpService } from '@shared/services/api/admin-ip.service';
import { AdminUserBanService } from '@shared/services/api/admin-user-ban.service';
import { BannedIpDTO, BannedUserDTO } from '@shared/types';
// Axios 错误提示统一由拦截器处理；组件不额外弹错

// 格式化剩余时间显示
const formatRemainTime = (remainSeconds: number): string => {
  if (remainSeconds <= 0) return '已到期';

  const days = Math.floor(remainSeconds / (24 * 3600));
  const hours = Math.floor((remainSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((remainSeconds % 3600) / 60);
  const seconds = remainSeconds % 60;

  if (days > 0) {
    return `${days}天${hours}小时${minutes}分钟`;
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
};

export const IpBanPage: React.FC = () => {
  const [bannedIps, setBannedIps] = useState<BannedIpDTO[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 解封确认对话框状态
  const [unbanDialog, setUnbanDialog] = useState<{
    open: boolean;
    ip: string;
  }>({
    open: false,
    ip: ''
  });

  // 用户解封确认对话框
  const [unbanUserDialog, setUnbanUserDialog] = useState<{
    open: boolean;
    userId: string;
  }>({
    open: false,
    userId: ''
  });

  // 获取被封禁IP列表
  const fetchBannedIps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminIpService.getBannedIps();
      setBannedIps(data);
    } catch (error) {
      console.error('获取封禁IP列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBannedUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await AdminUserBanService.getBannedUsers();
      setBannedUsers(data);
    } catch (error) {
      console.error('获取封禁用户列表失败:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // 解封IP
  const handleUnbanIp = async (ip: string) => {
    try {
      await AdminIpService.unbanIp(ip);
      // 直接从本地状态中移除该IP，避免重新请求接口
      setBannedIps(prev => prev.filter(item => item.ip !== ip));
    } catch (error) {
      console.error('解封IP失败:', error);
    } finally {
      setUnbanDialog({ open: false, ip: '' });
    }
  };

  // 解封用户
  const handleUnbanUser = async (userId: string) => {
    try {
      await AdminUserBanService.unbanUser(userId);
      setBannedUsers(prev => prev.filter(item => item.userId !== userId));
    } catch (error) {
      console.error('解封用户失败:', error);
    } finally {
      setUnbanUserDialog({ open: false, userId: '' });
    }
  };

  // 定时更新剩余时间（每秒）
  useEffect(() => {
    const timer = setInterval(() => {
      setBannedIps(prev => prev.map(item => ({
        ...item,
        remainSeconds: Math.max(0, item.remainSeconds - 1)
      })).filter(item => item.remainSeconds > 0)); // 过滤掉已过期的IP
      setBannedUsers(prev => prev.map(u => ({
        ...u,
        remainSeconds: u.remainSeconds === -1 ? -1 : Math.max(0, (u.remainSeconds || 0) - 1)
      })).filter(u => u.remainSeconds === -1 || (u.remainSeconds || 0) > 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 初始化加载
  useEffect(() => {
    fetchBannedIps();
    fetchBannedUsers();
  }, [fetchBannedIps, fetchBannedUsers]);

  return (
    <div className="space-y-6">
      {/* 页面标题和刷新按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">封禁管理</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { fetchBannedIps(); fetchBannedUsers(); }}
          disabled={loading || loadingUsers}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(loading || loadingUsers) ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* IP封禁列表 */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            // 加载状态
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : bannedIps.length === 0 ? (
            // 空状态
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">暂无被封禁的IP</h3>
              <p className="text-muted-foreground">当前系统中没有被封禁的IP地址</p>
            </div>
          ) : (
            // 数据表格
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP地址</TableHead>
                  <TableHead>封禁到期时间</TableHead>
                  <TableHead>剩余时间</TableHead>
                  <TableHead className="text-right min-w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedIps.map((item) => (
                  <TableRow key={item.ip}>
                    <TableCell className="font-mono">{item.ip}</TableCell>
                    <TableCell>
                      {new Date(item.bannedUntil).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono ${item.remainSeconds <= 300 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {formatRemainTime(item.remainSeconds)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUnbanDialog({ open: true, ip: item.ip })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          解封
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 用户封禁列表 */}
      <Card>
        <CardContent className="p-6">
          {loadingUsers ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : bannedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">暂无被封禁的用户</h3>
              <p className="text-muted-foreground">当前系统中没有被封禁的用户</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户ID</TableHead>
                  <TableHead>封禁到期时间</TableHead>
                  <TableHead>剩余时间</TableHead>
                  <TableHead className="text-right min-w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedUsers.map((u) => (
                  <TableRow key={u.userId}>
                    <TableCell className="font-mono">{u.userId}</TableCell>
                    <TableCell>
                      {u.remainSeconds === -1 ? (
                        <span className="text-muted-foreground">永久封禁</span>
                      ) : (
                        u.bannedUntil ? new Date(u.bannedUntil).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }) : '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {u.remainSeconds === -1 ? (
                        <span className="text-muted-foreground">永久</span>
                      ) : (
                        <span className={`font-mono ${(u.remainSeconds || 0) <= 300 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {formatRemainTime(u.remainSeconds || 0)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUnbanUserDialog({ open: true, userId: u.userId })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          解封
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 解封确认对话框 */}
      <AlertDialog open={unbanDialog.open} onOpenChange={(open) => !open && setUnbanDialog({ open: false, ip: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认解封IP</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要解封IP地址 <code className="font-mono bg-muted px-1 py-0.5 rounded">{unbanDialog.ip}</code> 吗？
              <br />
              解封后，该IP地址将立即可以访问系统。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUnbanIp(unbanDialog.ip)}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认解封
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 用户解封确认对话框 */}
      <AlertDialog open={unbanUserDialog.open} onOpenChange={(open) => !open && setUnbanUserDialog({ open: false, userId: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认解封用户</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要解封用户 <code className="font-mono bg-muted px-1 py-0.5 rounded">{unbanUserDialog.userId}</code> 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUnbanUser(unbanUserDialog.userId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认解封
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
