import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Shield, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { UserOAuth2Service } from '@shared/services/api';
import type { UserAuthorizationDTO } from '@shared/types';
import AdminPagination from '@shared/components/AdminPagination';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 用户已授权应用管理页面
 */
export const AuthorizedAppsPage: React.FC = () => {
  const [authorizations, setAuthorizations] = useState<UserAuthorizationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; app?: UserAuthorizationDTO }>({ open: false });

  // 加载授权列表
  const loadAuthorizations = useCallback(async (pageNum: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const res = await UserOAuth2Service.getUserAuthorizations({ pageNum, pageSize });
      setAuthorizations(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载已授权应用列表失败', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthorizations();
  }, [loadAuthorizations]);

  const handlePageChange = (page: number) => {
    loadAuthorizations(page, pagination.size);
  };

  const handleRefresh = () => {
    loadAuthorizations(pagination.current, pagination.size);
  };

  // 打开撤销授权对话框
  const confirmRevoke = (app: UserAuthorizationDTO) => {
    setRevokeDialog({ open: true, app });
  };

  // 执行撤销授权
  const handleRevoke = async () => {
    if (!revokeDialog.app) return;
    try {
      await UserOAuth2Service.revokeAuthorization(revokeDialog.app.clientId);
      setRevokeDialog({ open: false });
      await loadAuthorizations(pagination.current, pagination.size);
    } catch (error) {
      console.error('撤销授权失败', error);
    }
  };

  // 格式化时间距离
  const formatTimeDistance = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: zhCN });
    } catch {
      return dateString;
    }
  };

  // 计算 Token 剩余时间
  const getTokenTimeRemaining = (expiresAt: string) => {
    try {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) return '已过期';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) return `${days}天后过期`;
      if (hours > 0) return `${hours}小时后过期`;
      return '即将过期';
    } catch {
      return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            授权管理
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            管理已授权访问您账户的第三方应用
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 授权应用列表 */}
      {loading && authorizations.length === 0 ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : authorizations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">您还没有授权任何第三方应用</p>
            <p className="text-xs text-muted-foreground mt-2">
              当您通过 OAuth2 登录第三方应用时，授权记录会显示在这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {authorizations.map((auth) => (
              <Card key={auth.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {auth.clientLogoUrl ? (
                        <img
                          src={auth.clientLogoUrl}
                          alt={auth.clientName}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{auth.clientName}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          客户端 ID: <span className="font-mono">{auth.clientId}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={() => confirmRevoke(auth)}
                      variant="destructive"
                      size="sm"
                    >
                      撤销授权
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 应用描述 */}
                  {auth.clientDescription && (
                    <p className="text-sm text-muted-foreground">{auth.clientDescription}</p>
                  )}

                  {/* 授权信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">授权时间：</span>
                      <span>{formatTimeDistance(auth.createTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {auth.accessTokenValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-muted-foreground">Token 状态：</span>
                      {auth.accessTokenValid ? (
                        <Badge variant="default" className="bg-green-600">
                          有效 ({getTokenTimeRemaining(auth.accessTokenExpiresAt)})
                        </Badge>
                      ) : (
                        <Badge variant="destructive">已过期</Badge>
                      )}
                    </div>
                  </div>

                  {/* 权限范围 */}
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground">授权权限：</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {auth.scopes.split(' ').map((scope, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="mt-6">
              <AdminPagination
                currentPage={pagination.current}
                pageSize={pagination.size}
                totalItems={pagination.total}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* 撤销授权确认对话框 */}
      <AlertDialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ open })}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤销授权</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3 pt-2">
                <p>
                  确定要撤销对 <span className="font-semibold text-slate-900">{revokeDialog.app?.clientName}</span> 的授权吗?
                </p>
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800 leading-relaxed">
                    <p className="font-semibold mb-1">操作影响：</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>该应用将<span className="font-semibold">立即失去访问权限</span></li>
                      <li>所有已签发的 Token 将被撤销</li>
                      <li>您需要重新授权才能继续使用该应用</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-red-600 hover:bg-red-700">
              确认撤销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
