import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RefreshCw, Plus, Trash2, Copy, Search, XCircle, Key, Check, PlayCircle, PauseCircle, Ban, Edit, Info, Globe, Shield, Settings, Zap, Smartphone, Server, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

import { OAuth2ClientService } from '@shared/services/api/oauth2-client.service';
import AdminPagination from '@shared/components/AdminPagination';
import type {
  OAuth2ClientDTO,
  OAuth2ClientQueryRequest,
  CreateOAuth2ClientRequest,
  UpdateOAuth2ClientRequest,
  OAuth2ClientStatus,
  PageResponse,
} from '@shared/types';
import { OAuth2ClientStatusMap, GRANT_TYPES, CLIENT_AUTH_METHODS, SCOPES } from '@shared/types/oauth2.types';
import { showToast } from '@shared/utils/toast';

type FilterState = {
  pageNum: number;
  pageSize: number;
  clientName?: string;
  status?: OAuth2ClientStatus;
};

// 配置模板
type ClientTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  config: {
    grantTypes: string[];
    scopes: string[];
    clientAuthenticationMethods: string[];
    accessTokenValiditySeconds: string;
    refreshTokenValiditySeconds: string;
    requireProofKey: boolean;
    requireAuthorizationConsent: boolean;
  };
};

const CLIENT_TEMPLATES: ClientTemplate[] = [
  {
    id: 'web',
    name: 'Web 应用',
    description: '适用于传统服务端渲染的 Web 应用，使用授权码模式',
    icon: <Globe className="h-5 w-5 text-blue-600" />,
    config: {
      grantTypes: ['authorization_code', 'refresh_token'],
      scopes: ['openid', 'profile', 'email'],
      clientAuthenticationMethods: ['client_secret_basic', 'client_secret_post'],
      accessTokenValiditySeconds: '3600',
      refreshTokenValiditySeconds: '86400',
      requireProofKey: false,
      requireAuthorizationConsent: true,
    },
  },
  {
    id: 'mobile',
    name: '移动应用',
    description: '适用于移动端 App，使用 PKCE 增强安全性',
    icon: <Smartphone className="h-5 w-5 text-green-600" />,
    config: {
      grantTypes: ['authorization_code', 'refresh_token'],
      scopes: ['openid', 'profile', 'email'],
      clientAuthenticationMethods: ['none'],
      accessTokenValiditySeconds: '3600',
      refreshTokenValiditySeconds: '2592000',
      requireProofKey: true,
      requireAuthorizationConsent: true,
    },
  },
  {
    id: 'service',
    name: '服务端应用',
    description: '适用于后端服务间调用，使用客户端凭证模式',
    icon: <Server className="h-5 w-5 text-purple-600" />,
    config: {
      grantTypes: ['client_credentials'],
      scopes: ['api'],
      clientAuthenticationMethods: ['client_secret_basic'],
      accessTokenValiditySeconds: '7200',
      refreshTokenValiditySeconds: '86400',
      requireProofKey: false,
      requireAuthorizationConsent: false,
    },
  },
];

export const OAuth2ClientsPage: React.FC = () => {
  // 列表 & 分页
  const [clients, setClients] = useState<OAuth2ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<FilterState>({ pageNum: 1, pageSize: 10 });

  // 创建/编辑对话框
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    submitting: boolean;
    editingId?: string;
    selectedTemplate?: string;
    clientId: string;
    clientName: string;
    redirectUris: string[];
    redirectUrisInput: string; // 一行一个（保留用于兼容）
    redirectUrisList: string[]; // 新增：数组形式管理
    newUri: string; // 新增：正在输入的 URI
    grantTypes: string[];
    scopes: string[];
    clientAuthenticationMethods: string[];
    accessTokenValiditySeconds: string;
    refreshTokenValiditySeconds: string;
    requireProofKey: boolean;
    requireAuthorizationConsent: boolean;
    result?: { client: OAuth2ClientDTO; clientSecret: string };
  }>({
    open: false,
    mode: 'create',
    submitting: false,
    selectedTemplate: undefined,
    clientId: '',
    clientName: '',
    redirectUris: [],
    redirectUrisInput: '',
    redirectUrisList: [],
    newUri: '',
    grantTypes: [],
    scopes: [],
    clientAuthenticationMethods: [],
    accessTokenValiditySeconds: '3600',
    refreshTokenValiditySeconds: '86400',
    requireProofKey: false,
    requireAuthorizationConsent: true,
  });

  // 重新生成密钥对话框
  const [regenerateDialog, setRegenerateDialog] = useState<{
    open: boolean;
    submitting: boolean;
    client?: OAuth2ClientDTO;
    result?: { clientId: string; clientSecret: string };
  }>({ open: false, submitting: false });

  // 删除对话框
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: OAuth2ClientDTO }>({ open: false });

  // 加载客户端列表
  const loadClients = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const req: OAuth2ClientQueryRequest = {
        pageNum: pageNum ?? filters.pageNum,
        pageSize: pageSize ?? filters.pageSize,
        ...(filters.clientName && { clientName: filters.clientName }),
        ...(filters.status && { status: filters.status }),
      };
      const res: PageResponse<OAuth2ClientDTO> = await OAuth2ClientService.getPagedClients(req);
      setClients(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载 OAuth2 客户端列表失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadClients();
  }, [filters.pageNum, filters.pageSize, filters.clientName, filters.status, loadClients]);

  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10 });
  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, pageNum: page }));
  const handleRefresh = () => loadClients(pagination.current, pagination.size);
  const handleQuery = () => { setFilters(prev => ({ ...prev, pageNum: 1 })); loadClients(1, pagination.size); };

  // 应用配置模板
  const applyTemplate = (templateId: string) => {
    const template = CLIENT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setFormDialog(prev => ({
      ...prev,
      selectedTemplate: templateId,
      ...template.config,
    }));
  };

  // URI 列表管理
  const addRedirectUri = () => {
    const uri = formDialog.newUri.trim();
    if (!uri) return showToast.error('请输入重定向 URI');
    if (!/^https?:\/\/.+/.test(uri)) return showToast.error('URI 必须以 http:// 或 https:// 开头');
    if (formDialog.redirectUrisList.includes(uri)) return showToast.error('该 URI 已存在');

    setFormDialog(prev => ({
      ...prev,
      redirectUrisList: [...prev.redirectUrisList, uri],
      newUri: '',
    }));
  };

  const removeRedirectUri = (uri: string) => {
    setFormDialog(prev => ({
      ...prev,
      redirectUrisList: prev.redirectUrisList.filter(u => u !== uri),
    }));
  };

  // 创建客户端
  const openCreate = () => {
    setFormDialog({
      open: true,
      mode: 'create',
      submitting: false,
      selectedTemplate: undefined,
      clientId: '',
      clientName: '',
      redirectUris: [],
      redirectUrisInput: '',
      redirectUrisList: [],
      newUri: '',
      grantTypes: [],
      scopes: [],
      clientAuthenticationMethods: [],
      accessTokenValiditySeconds: '3600',
      refreshTokenValiditySeconds: '86400',
      requireProofKey: false,
      requireAuthorizationConsent: true,
      result: undefined,
    });
  };

  // 编辑客户端
  const openEdit = (item: OAuth2ClientDTO) => {
    setFormDialog({
      open: true,
      mode: 'edit',
      submitting: false,
      editingId: item.id,
      selectedTemplate: undefined,
      clientId: item.clientId,
      clientName: item.clientName,
      redirectUris: item.redirectUris,
      redirectUrisInput: item.redirectUris.join('\n'),
      redirectUrisList: item.redirectUris,
      newUri: '',
      grantTypes: item.grantTypes,
      scopes: item.scopes,
      clientAuthenticationMethods: item.clientAuthenticationMethods,
      accessTokenValiditySeconds: item.accessTokenValiditySeconds.toString(),
      refreshTokenValiditySeconds: item.refreshTokenValiditySeconds.toString(),
      requireProofKey: item.requireProofKey,
      requireAuthorizationConsent: item.requireAuthorizationConsent,
      result: undefined,
    });
  };

  const submitForm = async () => {
    const {
      mode,
      editingId,
      clientId: cid,
      clientName,
      redirectUrisList,
      grantTypes,
      scopes,
      clientAuthenticationMethods,
      accessTokenValiditySeconds: atsStr,
      refreshTokenValiditySeconds: rtsStr,
      requireProofKey,
      requireAuthorizationConsent,
    } = formDialog;

    // 表单校验
    if (!cid || cid.length < 3 || cid.length > 100) return showToast.error('客户端ID长度必须在3-100之间');
    if (!/^[a-zA-Z0-9_-]+$/.test(cid)) return showToast.error('客户端ID只能包含字母、数字、下划线和连字符');
    if (!clientName || clientName.length > 200) return showToast.error('客户端名称不能为空且长度不能超过200');

    if (redirectUrisList.length === 0) return showToast.error('重定向URI列表不能为空');

    if (grantTypes.length === 0) return showToast.error('授权类型列表不能为空');
    if (scopes.length === 0) return showToast.error('Scope列表不能为空');
    if (clientAuthenticationMethods.length === 0) return showToast.error('客户端认证方式列表不能为空');

    const ats = parseInt(atsStr || '0', 10);
    if (!Number.isInteger(ats) || ats < 60 || ats > 86400) return showToast.error('Access Token有效期范围 60-86400 秒');

    const rts = parseInt(rtsStr || '0', 10);
    if (!Number.isInteger(rts) || rts < 3600 || rts > 31536000) return showToast.error('Refresh Token有效期范围 3600-31536000 秒');

    const payload: CreateOAuth2ClientRequest | UpdateOAuth2ClientRequest = {
      clientId: cid,
      clientName,
      redirectUris: redirectUrisList,
      grantTypes,
      scopes,
      clientAuthenticationMethods,
      accessTokenValiditySeconds: ats,
      refreshTokenValiditySeconds: rts,
      requireProofKey,
      requireAuthorizationConsent,
    };

    try {
      setFormDialog(prev => ({ ...prev, submitting: true }));

      if (mode === 'create') {
        const result = await OAuth2ClientService.createClient(payload as CreateOAuth2ClientRequest);
        setFormDialog(prev => ({ ...prev, submitting: false, result }));
      } else {
        if (!editingId) return;
        await OAuth2ClientService.updateClient(editingId, payload as UpdateOAuth2ClientRequest);
        setFormDialog({ ...formDialog, open: false, submitting: false });
      }

      await loadClients();
    } catch (e) {
      console.error(`${mode === 'create' ? '创建' : '更新'} OAuth2 客户端失败`, e);
      setFormDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const closeFormDialog = () => {
    setFormDialog(prev => ({ ...prev, open: false, result: undefined }));
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success(`${label}已复制到剪贴板`);
    } catch (error) {
      console.error('复制到剪贴板失败', error);
      showToast.error('复制失败，请手动复制');
    }
  };

  // 重新生成密钥
  const openRegenerateSecret = (item: OAuth2ClientDTO) => {
    setRegenerateDialog({ open: true, submitting: false, client: item, result: undefined });
  };

  const confirmRegenerateSecret = async () => {
    if (!regenerateDialog.client) return;
    try {
      setRegenerateDialog(prev => ({ ...prev, submitting: true }));
      const result = await OAuth2ClientService.regenerateClientSecret(regenerateDialog.client.id);
      setRegenerateDialog(prev => ({ ...prev, submitting: false, result }));
      await loadClients();
    } catch (e) {
      console.error('重新生成密钥失败', e);
      setRegenerateDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const closeRegenerateDialog = () => {
    setRegenerateDialog({ open: false, submitting: false, result: undefined });
  };

  // 删除客户端
  const confirmDelete = (item: OAuth2ClientDTO) => setDeleteDialog({ open: true, item });
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await OAuth2ClientService.deleteClient(deleteDialog.item.id);
      setDeleteDialog({ open: false });
      await loadClients();
    } catch (error) {
      console.error('删除 OAuth2 客户端失败', error);
    }
  };

  // 状态操作
  const handleActivate = async (item: OAuth2ClientDTO) => {
    try {
      await OAuth2ClientService.activateClient(item.id);
      await loadClients();
    } catch (e) {
      console.error('激活客户端失败', e);
    }
  };

  const handleSuspend = async (item: OAuth2ClientDTO) => {
    try {
      await OAuth2ClientService.suspendClient(item.id);
      await loadClients();
    } catch (e) {
      console.error('暂停客户端失败', e);
    }
  };

  const handleRevoke = async (item: OAuth2ClientDTO) => {
    try {
      await OAuth2ClientService.revokeClient(item.id);
      await loadClients();
    } catch (e) {
      console.error('撤销客户端失败', e);
    }
  };

  // 多选 Checkbox 处理器
  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">OAuth2 客户端管理</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            创建客户端
          </Button>
        </div>
      </div>

      {/* 筛选区 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>客户端名称</Label>
              <Input
                placeholder="搜索客户端名称"
                value={filters.clientName || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            <div>
              <Label>状态</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : v as OAuth2ClientStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="ACTIVE">激活</SelectItem>
                  <SelectItem value="SUSPENDED">暂停</SelectItem>
                  <SelectItem value="REVOKED">撤销</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleQuery} className="flex-1">
                <Search className="h-4 w-4 mr-1" />
                查询
              </Button>
              <Button onClick={handleReset} variant="outline">
                <XCircle className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客户端ID</TableHead>
                <TableHead>客户端名称</TableHead>
                <TableHead>重定向URI</TableHead>
                <TableHead>授权类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <TableCell key={i}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.clientId}</TableCell>
                    <TableCell>{item.clientName}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.redirectUris.join(', ')}</TableCell>
                    <TableCell className="text-xs">{item.grantTypes.join(', ')}</TableCell>
                    <TableCell>
                      <Badge variant={OAuth2ClientStatusMap[item.status].variant}>
                        {OAuth2ClientStatusMap[item.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(item.createTime).toLocaleString('zh-CN')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button onClick={() => openEdit(item)} variant="ghost" size="sm" title="编辑">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => openRegenerateSecret(item)} variant="ghost" size="sm" title="重新生成密钥">
                          <Key className="h-4 w-4" />
                        </Button>
                        {item.status !== 'ACTIVE' && (
                          <Button onClick={() => handleActivate(item)} variant="ghost" size="sm" title="激活">
                            <PlayCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {item.status === 'ACTIVE' && (
                          <Button onClick={() => handleSuspend(item)} variant="ghost" size="sm" title="暂停">
                            <PauseCircle className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        {item.status !== 'REVOKED' && (
                          <Button onClick={() => handleRevoke(item)} variant="ghost" size="sm" title="撤销">
                            <Ban className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        <Button onClick={() => confirmDelete(item)} variant="ghost" size="sm" title="删除">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4">
            <AdminPagination
              currentPage={pagination.current}
              pageSize={pagination.size}
              totalItems={pagination.total}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={formDialog.open} onOpenChange={(open) => !formDialog.submitting && setFormDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{formDialog.mode === 'create' ? '创建 OAuth2 客户端' : '编辑 OAuth2 客户端'}</DialogTitle>
            <DialogDescription>
              {formDialog.mode === 'create' ? '创建新的 OAuth2 客户端应用，密钥仅此一次展示，请妥善保管' : '更新 OAuth2 客户端配置信息'}
            </DialogDescription>
          </DialogHeader>

          {formDialog.result ? (
            <div className="space-y-6">
              {/* 成功提示 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">客户端创建成功！</h3>
                    <p className="text-sm text-green-800 leading-relaxed">
                      您的 OAuth2 客户端已成功创建。下方显示的<span className="font-semibold">客户端密钥仅此一次展示</span>，
                      请务必立即复制并妥善保管，后续将无法再次查看。
                    </p>
                  </div>
                </div>
              </div>

              {/* 凭证信息 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="h-5 w-5 text-slate-700" />
                  <h4 className="font-semibold text-slate-900">客户端凭证</h4>
                </div>

                {/* 客户端 ID */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                    <Info className="h-4 w-4" />
                    客户端 ID (Client ID)
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={formDialog.result.client.clientId}
                        readOnly
                        className="font-mono text-sm pr-20 bg-slate-50 border-slate-300"
                      />
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                        公开
                      </Badge>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(formDialog.result!.client.clientId, '客户端 ID')}
                      variant="outline"
                      size="sm"
                      className="px-4"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      复制
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">用于标识您的应用，可以公开</p>
                </div>

                {/* 客户端密钥 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    客户端密钥 (Client Secret)
                    <Badge variant="destructive" className="ml-2">仅此一次</Badge>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={formDialog.result.clientSecret}
                        readOnly
                        className="font-mono text-sm pr-20 bg-amber-50 border-amber-300 text-amber-900"
                      />
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-100 text-red-700 hover:bg-red-100">
                        机密
                      </Badge>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(formDialog.result!.clientSecret, '客户端密钥')}
                      className="px-4 bg-amber-600 hover:bg-amber-700"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      复制
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <Info className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-semibold">安全提示：</span>
                      此密钥用于服务端认证，关闭弹窗后将无法再次查看。请立即复制并保存到安全的密钥管理系统中，
                      切勿泄露或提交到代码仓库。如遗失可重新生成，但旧密钥会立即失效。
                    </p>
                  </div>
                </div>
              </div>

              {/* 下一步指引 */}
              <div className="border-t pt-5">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  下一步
                </h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    <span>将客户端 ID 和密钥配置到您的应用中</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    <span>参考 OAuth2 文档实现授权流程</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    <span>测试授权流程并确保重定向 URI 配置正确</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={closeFormDialog} className="w-full sm:w-auto">
                  我已保存，关闭
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 快速配置模板 */}
              {formDialog.mode === 'create' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <Label className="text-base font-semibold">快速配置模板</Label>
                    <span className="text-xs text-muted-foreground">（可选）选择预设模板快速配置</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {CLIENT_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          formDialog.selectedTemplate === template.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {template.icon}
                          <span className="font-semibold text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 手风琴配置区 */}
              <Accordion type="multiple" defaultValue={['basic', 'auth', 'security']} className="space-y-3">
                {/* 基础信息 */}
                <AccordionItem value="basic" className="border rounded-lg px-4 bg-slate-50/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">基础信息</span>
                      <span className="text-xs text-muted-foreground ml-2">设置客户端标识信息</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          客户端ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="my-oauth-app"
                          value={formDialog.clientId}
                          onChange={(e) => setFormDialog(prev => ({ ...prev, clientId: e.target.value }))}
                          disabled={formDialog.mode === 'edit'}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>仅支持字母、数字、下划线和连字符，3-100个字符，创建后不可修改</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          客户端名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="我的应用"
                          value={formDialog.clientName}
                          onChange={(e) => setFormDialog(prev => ({ ...prev, clientName: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>便于识别的应用名称，最多200个字符</span>
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 授权配置 */}
                <AccordionItem value="auth" className="border rounded-lg px-4 bg-amber-50/30">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">授权配置</span>
                      <span className="text-xs text-muted-foreground ml-2">配置 OAuth2 授权流程参数</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 space-y-5">
                    {/* 重定向 URI 列表 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        重定向 URI 列表 <span className="text-red-500">*</span>
                      </Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com/oauth/callback"
                            value={formDialog.newUri}
                            onChange={(e) => setFormDialog(prev => ({ ...prev, newUri: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRedirectUri())}
                            className="flex-1"
                          />
                          <Button type="button" onClick={addRedirectUri} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            添加
                          </Button>
                        </div>
                        <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 flex-shrink-0" />
                            什么是重定向 URI？
                          </p>
                          <p className="text-xs text-blue-800 leading-relaxed ml-5">
                            用户授权成功后，OAuth2 服务器将用户重定向回您的应用的地址。必须以 http:// 或 https:// 开头。
                          </p>
                          <div className="text-xs text-blue-800 ml-5 space-y-1">
                            <p className="font-semibold">常见示例：</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                              <li><code className="bg-blue-100 px-1 rounded">https://example.com/oauth/callback</code> - Web 应用回调地址</li>
                              <li><code className="bg-blue-100 px-1 rounded">http://localhost:3000/callback</code> - 本地开发测试地址</li>
                              <li><code className="bg-blue-100 px-1 rounded">myapp://oauth/callback</code> - 移动应用自定义协议（需服务端支持）</li>
                            </ul>
                          </div>
                        </div>
                        {formDialog.redirectUrisList.length > 0 && (
                          <div className="border rounded-md p-3 bg-white space-y-1.5 max-h-40 overflow-y-auto">
                            {formDialog.redirectUrisList.map((uri, index) => (
                              <div key={index} className="flex items-center gap-2 group">
                                <span className="flex-1 text-sm font-mono text-slate-700 truncate">{uri}</span>
                                <Button
                                  type="button"
                                  onClick={() => removeRedirectUri(uri)}
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 授权类型 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        授权类型 <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {GRANT_TYPES.map((gt) => (
                          <div
                            key={gt.value}
                            className={`flex items-start space-x-2 p-3 rounded-md border transition-colors ${
                              formDialog.grantTypes.includes(gt.value) ? 'bg-blue-50 border-blue-200' : 'bg-white'
                            }`}
                          >
                            <Checkbox
                              id={`grant-${gt.value}`}
                              checked={formDialog.grantTypes.includes(gt.value)}
                              onCheckedChange={() => setFormDialog(prev => ({
                                ...prev,
                                grantTypes: toggleArrayItem(prev.grantTypes, gt.value),
                              }))}
                              className="mt-0.5"
                            />
                            <label htmlFor={`grant-${gt.value}`} className="text-sm cursor-pointer flex-1">
                              <div className="font-medium">{gt.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{gt.description || '标准授权流程'}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scope 列表 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        权限范围 (Scopes) <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {SCOPES.map((sc) => (
                          <div
                            key={sc.value}
                            className={`flex items-start space-x-2 p-3 rounded-md border transition-colors ${
                              formDialog.scopes.includes(sc.value) ? 'bg-green-50 border-green-200' : 'bg-white'
                            }`}
                          >
                            <Checkbox
                              id={`scope-${sc.value}`}
                              checked={formDialog.scopes.includes(sc.value)}
                              onCheckedChange={() => setFormDialog(prev => ({
                                ...prev,
                                scopes: toggleArrayItem(prev.scopes, sc.value),
                              }))}
                              className="mt-0.5"
                            />
                            <label htmlFor={`scope-${sc.value}`} className="text-sm cursor-pointer flex-1">
                              <div className="font-medium">{sc.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{sc.description || '访问权限'}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 安全设置 */}
                <AccordionItem value="security" className="border rounded-lg px-4 bg-purple-50/30">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">安全设置</span>
                      <span className="text-xs text-muted-foreground ml-2">配置认证方式和 Token 有效期</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 space-y-5">
                    {/* 客户端认证方式 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        客户端认证方式 <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        {CLIENT_AUTH_METHODS.map((cam) => (
                          <div
                            key={cam.value}
                            className={`flex items-start space-x-2 p-3 rounded-md border transition-colors ${
                              formDialog.clientAuthenticationMethods.includes(cam.value) ? 'bg-purple-50 border-purple-200' : 'bg-white'
                            }`}
                          >
                            <Checkbox
                              id={`auth-${cam.value}`}
                              checked={formDialog.clientAuthenticationMethods.includes(cam.value)}
                              onCheckedChange={() => setFormDialog(prev => ({
                                ...prev,
                                clientAuthenticationMethods: toggleArrayItem(prev.clientAuthenticationMethods, cam.value),
                              }))}
                              className="mt-0.5"
                            />
                            <label htmlFor={`auth-${cam.value}`} className="text-sm cursor-pointer flex-1">
                              <div className="font-medium">{cam.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{cam.description || '认证方式'}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Token 有效期 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Access Token 有效期 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="3600"
                          value={formDialog.accessTokenValiditySeconds}
                          onChange={(e) => setFormDialog(prev => ({ ...prev, accessTokenValiditySeconds: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">60-86400 秒（1分钟-24小时）</p>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { label: '1小时', value: '3600' },
                            { label: '6小时', value: '21600' },
                            { label: '24小时', value: '86400' },
                          ].map((preset) => (
                            <Button
                              key={preset.value}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => setFormDialog(prev => ({ ...prev, accessTokenValiditySeconds: preset.value }))}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Refresh Token 有效期 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="86400"
                          value={formDialog.refreshTokenValiditySeconds}
                          onChange={(e) => setFormDialog(prev => ({ ...prev, refreshTokenValiditySeconds: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">3600-31536000 秒（1小时-1年）</p>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { label: '1天', value: '86400' },
                            { label: '7天', value: '604800' },
                            { label: '30天', value: '2592000' },
                          ].map((preset) => (
                            <Button
                              key={preset.value}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => setFormDialog(prev => ({ ...prev, refreshTokenValiditySeconds: preset.value }))}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 高级选项 */}
                    <div className="space-y-3 pt-2">
                      <Label className="text-sm font-semibold">高级选项</Label>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 rounded-md border bg-white">
                          <Checkbox
                            id="requireProofKey"
                            checked={formDialog.requireProofKey}
                            onCheckedChange={(checked) => setFormDialog(prev => ({ ...prev, requireProofKey: !!checked }))}
                            className="mt-0.5"
                          />
                          <label htmlFor="requireProofKey" className="text-sm cursor-pointer flex-1">
                            <div className="font-medium">强制要求 PKCE</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              推荐用于移动应用和单页应用，增强授权码交换的安全性
                            </div>
                          </label>
                        </div>
                        <div className="flex items-start space-x-3 p-3 rounded-md border bg-white">
                          <Checkbox
                            id="requireAuthorizationConsent"
                            checked={formDialog.requireAuthorizationConsent}
                            onCheckedChange={(checked) => setFormDialog(prev => ({ ...prev, requireAuthorizationConsent: !!checked }))}
                            className="mt-0.5"
                          />
                          <label htmlFor="requireAuthorizationConsent" className="text-sm cursor-pointer flex-1">
                            <div className="font-medium">需要用户授权同意</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              授权时显示同意页面，让用户确认授权的权限范围
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <DialogFooter className="gap-2">
                <Button onClick={closeFormDialog} variant="outline" disabled={formDialog.submitting}>
                  取消
                </Button>
                <Button onClick={submitForm} disabled={formDialog.submitting}>
                  {formDialog.submitting ? '提交中...' : formDialog.mode === 'create' ? '创建客户端' : '保存更改'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 重新生成密钥对话框 */}
      <AlertDialog open={regenerateDialog.open} onOpenChange={(open) => !regenerateDialog.submitting && setRegenerateDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" />
              重新生成客户端密钥
            </AlertDialogTitle>
            <AlertDialogDescription>
              {regenerateDialog.result ? (
                <div className="space-y-5 pt-2">
                  {/* 成功提示 */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 mb-1">密钥重新生成成功！</h4>
                        <p className="text-sm text-green-800 leading-relaxed">
                          旧密钥已立即失效。下方显示的<span className="font-semibold">新密钥仅此一次展示</span>，请立即复制保存。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 新密钥 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      新客户端密钥
                      <Badge variant="destructive" className="ml-2">仅此一次</Badge>
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          value={regenerateDialog.result.clientSecret}
                          readOnly
                          className="font-mono text-sm bg-amber-50 border-amber-300 text-amber-900"
                        />
                      </div>
                      <Button
                        onClick={() => copyToClipboard(regenerateDialog.result!.clientSecret, '客户端密钥')}
                        className="px-4 bg-amber-600 hover:bg-amber-700"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-1.5" />
                        复制
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <Info className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        请立即更新应用中的密钥配置，旧密钥已无法使用。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    确定要为客户端 <span className="font-semibold text-slate-900">{regenerateDialog.client?.clientName}</span> 重新生成密钥吗？
                  </p>
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <Info className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800 leading-relaxed">
                      <p className="font-semibold mb-1">操作影响：</p>
                      <ul className="list-disc list-inside space-y-0.5 text-xs">
                        <li>旧密钥将<span className="font-semibold">立即失效</span></li>
                        <li>使用旧密钥的请求将被拒绝</li>
                        <li>新密钥仅此一次展示，请务必保存</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {regenerateDialog.result ? (
              <AlertDialogAction onClick={closeRegenerateDialog} className="w-full sm:w-auto">
                我已保存，关闭
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel disabled={regenerateDialog.submitting}>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmRegenerateSecret}
                  disabled={regenerateDialog.submitting}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {regenerateDialog.submitting ? '生成中...' : '确认重新生成'}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除客户端 <span className="font-semibold">{deleteDialog.item?.clientName}</span> 吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
