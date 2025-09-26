import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Power, Smartphone, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserDeviceSessionService } from '@shared/services/api/user-device-session.service';
import type { ActiveSessionDTO } from '@shared/types';

export const DeviceManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ActiveSessionDTO[]>([]);
  const [activeIpCount, setActiveIpCount] = useState<number>(0);
  const [maxDevices, setMaxDevices] = useState<number | undefined>(undefined);
  const [confirmAll, setConfirmAll] = useState(false);
  const [removeIp, setRemoveIp] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await UserDeviceSessionService.getMySessionOverview();
      setSessions(overview.activeIps || []);
      setActiveIpCount(overview.activeIpCount || (overview.activeIps?.length ?? 0));
      setMaxDevices(overview.maxDevices ?? user?.maxConcurrentDevices ?? undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当用户信息刷新（AuthContext 异步刷新）时，同步最大并发设备显示
  useEffect(() => {
    if (typeof user?.maxConcurrentDevices === 'number') {
      setMaxDevices(user.maxConcurrentDevices);
    }
  }, [user?.maxConcurrentDevices]);

  const currentIp = useMemo(() => sessions.find((s) => s.isCurrent)?.ip, [sessions]);

  const onRemoveIp = async (ip: string) => {
    try {
      await UserDeviceSessionService.removeByIp(ip);
      await loadData();
    } catch {
      // 错误提示由拦截器处理
    }
  };

  const onRemoveOthers = async () => {
    try {
      await UserDeviceSessionService.removeOthers();
      setConfirmAll(false);
      await loadData();
    } catch {
      // 错误提示由拦截器处理
    }
  };

  const renderLastSeen = (val?: string) => {
    if (!val) return '-';
    const tryDate = new Date(val);
    if (!isNaN(tryDate.getTime())) return tryDate.toLocaleString('zh-CN');
    // 兼容 "YYYY-MM-DD HH:mm:ss"
    const iso = val.replace(' ', 'T');
    const tryIso = new Date(iso);
    return !isNaN(tryIso.getTime()) ? tryIso.toLocaleString('zh-CN') : val;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设备管理</h1>
        <p className="text-gray-600 mt-1">查看并管理你已登录的设备，会话在线状态实时更新</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="text-sm text-muted-foreground">
            最大并发设备：
            <span className="font-medium text-foreground ml-1">{maxDevices ?? '-'}</span>
            <span className="mx-2">|</span>
            当前活跃IP：
            <span className="font-medium text-foreground ml-1">{activeIpCount}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button variant="destructive" onClick={() => setConfirmAll(true)} disabled={loading || sessions.length <= 1}>
              <Power className="mr-2 h-4 w-4" /> 下线其他设备
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">设备/IP</TableHead>
                <TableHead className="min-w-[200px]">最近活跃</TableHead>
                <TableHead className="min-w-[120px]">状态</TableHead>
                <TableHead className="text-right min-w-[140px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">暂无设备会话</TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.ip}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <span className="font-mono">{s.ip}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderLastSeen(s.lastSeenTime)}</TableCell>
                    <TableCell>
                      {s.isCurrent ? (
                        <Badge variant="secondary" className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 当前设备
                        </Badge>
                      ) : (
                        <Badge variant="outline">其它设备</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={s.isCurrent}
                        onClick={() => setRemoveIp(s.ip)}
                      >
                        下线
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 下线其它设备确认 */}
      <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认下线其他设备</AlertDialogTitle>
            <AlertDialogDescription>
              将下线除当前设备（{currentIp || '未知IP'}）外的全部会话，确定继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={onRemoveOthers}>
              确认下线
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 下线单个设备确认 */}
      <AlertDialog open={!!removeIp} onOpenChange={(open) => setRemoveIp(open ? removeIp : null)}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认下线设备</AlertDialogTitle>
            <AlertDialogDescription>
              确定下线 IP 为 {removeIp} 的会话吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeIp && onRemoveIp(removeIp)} className="bg-destructive hover:bg-destructive/90">
              确认下线
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeviceManagementPage;
