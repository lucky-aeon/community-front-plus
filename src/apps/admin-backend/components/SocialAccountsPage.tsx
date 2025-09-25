import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Search, Unplug } from 'lucide-react';
import AdminPagination from '@shared/components/AdminPagination';
import type { AdminSocialAccountDTO, AdminSocialAccountQueryRequest } from '@shared/types/oauth';
import type { PageResponse } from '@shared/types';
import { AdminSocialAccountsService } from '@shared/services/api/admin-social-accounts.service';

export const SocialAccountsPage: React.FC = () => {
  const [records, setRecords] = useState<AdminSocialAccountDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [params, setParams] = useState<AdminSocialAccountQueryRequest>({ pageNum: 1, pageSize: 10, provider: 'GITHUB', login: '' });
  const [unbind, setUnbind] = useState<{ open: boolean; id?: string }>({ open: false });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const page: PageResponse<AdminSocialAccountDTO> = await AdminSocialAccountsService.page(params);
      setRecords(page.records);
      setPagination({ current: page.current, size: page.size, total: page.total, pages: page.pages });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(); }, [params.pageNum, params.pageSize, params.provider, load]);

  const handleQuery = () => { setParams(prev => ({ ...prev, pageNum: 1 })); load(); };
  const handleReset = () => setParams({ pageNum: 1, pageSize: 10, provider: 'GITHUB', login: '', userId: '' });

  const formatTime = (s: string) => new Date(s).toLocaleString('zh-CN');

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            <Select value={params.provider || 'all'} onValueChange={(v) => setParams(prev => ({ ...prev, provider: v === 'all' ? undefined : v }))}>
              <SelectTrigger><SelectValue placeholder="平台" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部平台</SelectItem>
                <SelectItem value="GITHUB">GitHub</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="按登录名(login)搜索" value={params.login || ''} onChange={(e) => setParams(prev => ({ ...prev, login: e.target.value }))} />
            <Input placeholder="按用户ID搜索" value={params.userId || ''} onChange={(e) => setParams(prev => ({ ...prev, userId: e.target.value }))} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleReset} disabled={loading}>重置</Button>
            <Button variant="outline" onClick={() => load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />刷新</Button>
            <Button onClick={handleQuery} disabled={loading}><Search className="mr-2 h-4 w-4" />查询</Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">登录名</TableHead>
                  <TableHead className="min-w-[120px]">平台</TableHead>
                  <TableHead className="min-w-[240px]">用户邮箱</TableHead>
                  <TableHead className="min-w-[180px]">绑定时间</TableHead>
                  <TableHead className="text-right min-w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5}>加载中...</TableCell></TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">暂无数据</TableCell></TableRow>
                ) : (
                  records.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.login}</TableCell>
                      <TableCell>{r.provider}</TableCell>
                      <TableCell>{r.userEmail}</TableCell>
                      <TableCell>{formatTime(r.createTime)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setUnbind({ open: true, id: r.id })}>
                          <Unplug className="h-4 w-4 mr-1" /> 解绑
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
              <div className="text-sm text-muted-foreground">共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页</div>
              {pagination.pages > 1 && (
                <AdminPagination current={pagination.current} totalPages={pagination.pages} onChange={(p) => setParams(prev => ({ ...prev, pageNum: p }))} mode="full" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={unbind.open} onOpenChange={(open) => setUnbind({ open })}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认解绑</AlertDialogTitle>
            <AlertDialogDescription>解绑后，该 GitHub 账号将与用户解除关联。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!unbind.id) return;
                try {
                  await AdminSocialAccountsService.unbind(unbind.id);
                  setUnbind({ open: false });
                  load();
                } catch { /* 错误交由拦截器提示 */ }
              }}
            >
              确认解绑
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SocialAccountsPage;

