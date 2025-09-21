import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Search, XCircle, Power, Smartphone, ShieldAlert } from 'lucide-react';
import AdminPagination from '@shared/components/AdminPagination';
import { AdminDeviceSessionService } from '@shared/services/api/admin-device-session.service';
import type { AdminDeviceSessionQueryRequest, PageResponse, UserSessionSummaryDTO, TokenBlacklistStatsDTO, BlacklistQueryRequest, BlacklistedUserDTO } from '@shared/types';

export const SessionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<UserSessionSummaryDTO[]>([]);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });

  const [query, setQuery] = useState<AdminDeviceSessionQueryRequest>({ pageNum: 1, pageSize: 10, userId: '', username: '', ip: '' });

  // 强制下线确认框状态
  const [confirm, setConfirm] = useState<{
    open: boolean;
    userId?: string;
    ip?: string;   // 若为空表示下线全部
  }>({ open: false });

  // 黑名单统计
  const [blackStats, setBlackStats] = useState<TokenBlacklistStatsDTO | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  // 黑名单用户列表
  const [blacklist, setBlacklist] = useState<BlacklistedUserDTO[]>([]);
  const [blLoading, setBlLoading] = useState(false);
  const [blQuery, setBlQuery] = useState<BlacklistQueryRequest>({ pageNum: 1, pageSize: 10, username: '', email: '' });
  const [blPagination, setBlPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res: PageResponse<UserSessionSummaryDTO> = await AdminDeviceSessionService.getUserSessions(query);
      setSessions(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadData();
  }, [query.pageNum, query.pageSize, query.userId, query.username, query.ip, loadData]);

  // 加载黑名单统计
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const stats = await AdminDeviceSessionService.getTokenBlacklistStats();
      setBlackStats(stats);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 加载黑名单用户
  const loadBlacklist = useCallback(async () => {
    try {
      setBlLoading(true);
      const res: PageResponse<BlacklistedUserDTO> = await AdminDeviceSessionService.getBlacklistedUsers(blQuery);
      setBlacklist(res.records);
      setBlPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } finally {
      setBlLoading(false);
    }
  }, [blQuery]);

  useEffect(() => {
    loadBlacklist();
  }, [blQuery.pageNum, blQuery.pageSize, blQuery.username, blQuery.email, loadBlacklist]);

  // 搜索防抖：userId/username/ip 输入后 500ms 请求（但点击“查询”也可立即触发）
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.userId || query.username || query.ip) {
        loadData();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [query.userId, query.username, query.ip, loadData]);

  const handleReset = () => setQuery({ pageNum: 1, pageSize: 10, userId: '', username: '', ip: '' });
  const handleRefresh = () => loadData();
  const handleQuery = () => setQuery(prev => ({ ...prev, pageNum: 1 }));

  const openForceRemove = (userId: string, ip?: string) => setConfirm({ open: true, userId, ip });
  const onConfirmForceRemove = async () => {
    if (!confirm.userId) return;
    if (confirm.ip) {
      await AdminDeviceSessionService.forceRemoveUserSession(confirm.userId, confirm.ip);
    } else {
      await AdminDeviceSessionService.forceRemoveAllUserSessions(confirm.userId);
    }
    setConfirm({ open: false });
    loadData();
  };

  const renderActiveIps = useCallback((row: UserSessionSummaryDTO) => {
    if (!row.activeIps || row.activeIps.length === 0) {
      return <span className="text-sm text-muted-foreground">无</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {row.activeIps.map((s) => (
          <div key={`${row.userId}-${s.ip}`} className="inline-flex items-center gap-2 rounded border px-2 py-1">
            <Badge variant={s.isCurrent ? 'default' : 'secondary'} className="font-mono">
              {s.ip}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(s.lastSeenTime).toLocaleString('zh-CN')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => openForceRemove(row.userId, s.ip)} title="强制下线此IP">
              <Power className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    );
  }, []);

  const statusBadge = useCallback((banned: boolean) => (
    <Badge variant={banned ? 'secondary' : 'default'}>{banned ? '禁用' : '正常'}</Badge>
  ), []);

  const headerRight = useMemo(() => (
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
  ), [loading]);

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          {/* 黑名单统计+清空 */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <div className="text-sm text-muted-foreground">
                黑名单Token数量：
                <span className="font-medium text-foreground ml-1">{blackStats?.totalBlacklistedTokens ?? (loadingStats ? '加载中...' : 0)}</span>
                {blackStats?.description && <span className="ml-2">（{blackStats.description}）</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadStats} disabled={loadingStats}>
                <RefreshCw className="mr-2 h-4 w-4" /> 刷新统计
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setClearConfirm(true)}>
                <Power className="mr-2 h-4 w-4" /> 清空黑名单
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="用户ID" value={query.userId || ''} onChange={(e) => setQuery(prev => ({ ...prev, userId: e.target.value }))} />
            <Input placeholder="用户名" value={query.username || ''} onChange={(e) => setQuery(prev => ({ ...prev, username: e.target.value }))} />
            <Input placeholder="IP" value={query.ip || ''} onChange={(e) => setQuery(prev => ({ ...prev, ip: e.target.value }))} />
          </div>
          {headerRight}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[240px]">用户</TableHead>
                  <TableHead className="min-w-[90px]">状态</TableHead>
                  <TableHead className="min-w-[110px]">最大设备</TableHead>
                  <TableHead className="min-w-[110px]">活跃IP数</TableHead>
                  <TableHead className="min-w-[360px]">活跃会话</TableHead>
                  <TableHead className="text-right min-w-[150px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-64" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">暂无会话数据</TableCell>
                  </TableRow>
                ) : (
                  sessions.map((row) => (
                    <TableRow key={row.userId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{row.username}</div>
                            <div className="text-sm text-muted-foreground truncate">{row.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(row.isBanned)}</TableCell>
                      <TableCell className="font-mono">{row.maxDevices}</TableCell>
                      <TableCell className="font-mono">{row.activeIpCount}</TableCell>
                      <TableCell>{renderActiveIps(row)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openForceRemove(row.userId)}>
                          <Power className="w-4 h-4 mr-1 text-destructive" /> 全部下线
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页
              </div>
              {pagination.pages > 1 && (
                <AdminPagination current={pagination.current} totalPages={pagination.pages} onChange={(p) => setQuery(prev => ({ ...prev, pageNum: p }))} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 黑名单用户列表 */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="用户名" value={blQuery.username || ''} onChange={(e) => setBlQuery(prev => ({ ...prev, username: e.target.value }))} />
            <Input placeholder="邮箱" value={blQuery.email || ''} onChange={(e) => setBlQuery(prev => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => setBlQuery({ pageNum: 1, pageSize: 10, username: '', email: '' })} disabled={blLoading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={loadBlacklist} disabled={blLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button onClick={() => setBlQuery(prev => ({ ...prev, pageNum: 1 }))} disabled={blLoading}>
              <Search className="mr-2 h-4 w-4" /> 查询
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[240px]">用户</TableHead>
                  <TableHead className="min-w-[160px]">邮箱</TableHead>
                  <TableHead className="min-w-[160px]">拉黑时间</TableHead>
                  <TableHead className="min-w-[100px]">Token数量</TableHead>
                  <TableHead className="text-right min-w-[140px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : blacklist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">暂无黑名单用户</TableCell>
                  </TableRow>
                ) : (
                  blacklist.map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell>
                        <div className="font-medium truncate">{u.username}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        {u.blacklistedTime ? new Date(u.blacklistedTime).toLocaleString('zh-CN') : (u.blacklistedAt ? new Date((u.blacklistedAt > 1e12 ? u.blacklistedAt : u.blacklistedAt * 1000)).toLocaleString('zh-CN') : '-')}
                      </TableCell>
                      <TableCell className="font-mono">{u.tokenCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setRemoveUserId(u.userId)}>
                          解除拉黑
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                共 {blPagination.total} 条，第 {Math.max(blPagination.current, 1)} / {Math.max(blPagination.pages, 1)} 页
              </div>
              {blPagination.pages > 1 && (
                <AdminPagination current={blPagination.current} totalPages={blPagination.pages} onChange={(p) => setBlQuery(prev => ({ ...prev, pageNum: p }))} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm({ open })}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认操作</AlertDialogTitle>
            <AlertDialogDescription>
              确定要强制下线{confirm.ip ? ` IP ${confirm.ip} 的会话` : '该用户的全部会话'}吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmForceRemove} className="bg-destructive hover:bg-destructive/90">
              确认下线
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空黑名单确认 */}
      <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>危险操作确认</AlertDialogTitle>
            <AlertDialogDescription>
              清空 Token 黑名单将允许被下线用户重新访问，确定继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                await AdminDeviceSessionService.clearTokenBlacklist();
                setClearConfirm(false);
                loadStats();
              }}
            >
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 移除用户黑名单确认 */}
      <AlertDialog open={!!removeUserId} onOpenChange={(open) => setRemoveUserId(open ? removeUserId : null)}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除</AlertDialogTitle>
            <AlertDialogDescription>
              确定将该用户从黑名单移除吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!removeUserId) return;
                await AdminDeviceSessionService.removeUserFromBlacklist(removeUserId);
                setRemoveUserId(null);
                loadBlacklist();
                loadStats();
              }}
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionsPage;
