import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminPagination from '@shared/components/AdminPagination';
import { AdminLogsService } from '@shared/services/api/admin-logs.service';
import type { ActivityCategory, ActivityLogQueryRequest, ActivityType, PageResponse, UserActivityLogDTO } from '@shared/types';
import { RefreshCw, Search, XCircle, Eye } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

// 活动分类选项
const CATEGORY_OPTIONS: { value: ActivityCategory; label: string }[] = [
  { value: 'AUTHENTICATION', label: '认证相关' },
  { value: 'BROWSING', label: '内容浏览' },
  { value: 'CONTENT_CREATION', label: '内容创作' },
  { value: 'SOCIAL_INTERACTION', label: '社交互动' },
  { value: 'LEARNING', label: '学习行为' },
  { value: 'ADMINISTRATION', label: '管理操作' },
  { value: 'OTHER', label: '其他' },
];

// 活动类型选项
const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  // 认证
  { value: 'LOGIN_SUCCESS', label: '登录成功' },
  { value: 'LOGIN_FAILED', label: '登录失败' },
  { value: 'REGISTER_SUCCESS', label: '注册成功' },
  { value: 'REGISTER_FAILED', label: '注册失败' },
  { value: 'LOGOUT', label: '登出' },
  { value: 'CHANGE_PASSWORD', label: '修改密码' },
  { value: 'RESET_PASSWORD', label: '重置密码' },
  // 浏览
  { value: 'VIEW_POST', label: '查看文章' },
  { value: 'VIEW_COURSE', label: '查看课程' },
  { value: 'VIEW_USER_PROFILE', label: '查看用户资料' },
  { value: 'SEARCH_CONTENT', label: '搜索内容' },
  // 创作
  { value: 'CREATE_POST', label: '发表文章' },
  { value: 'UPDATE_POST', label: '编辑文章' },
  { value: 'DELETE_POST', label: '删除文章' },
  { value: 'CREATE_COURSE', label: '创建课程' },
  { value: 'UPDATE_COURSE', label: '编辑课程' },
  { value: 'DELETE_COURSE', label: '删除课程' },
  // 社交
  { value: 'LIKE_POST', label: '点赞文章' },
  { value: 'UNLIKE_POST', label: '取消点赞' },
  { value: 'COMMENT_POST', label: '评论文章' },
  { value: 'DELETE_COMMENT', label: '删除评论' },
  { value: 'FOLLOW_USER', label: '关注用户' },
  { value: 'UNFOLLOW_USER', label: '取消关注' },
  { value: 'SHARE_POST', label: '分享文章' },
  // 学习
  { value: 'ENROLL_COURSE', label: '注册课程' },
  { value: 'COMPLETE_CHAPTER', label: '完成章节' },
  { value: 'START_LEARNING', label: '开始学习' },
  // 管理
  { value: 'ADMIN_LOGIN', label: '管理员登录' },
  { value: 'ADMIN_UPDATE_USER', label: '管理员更新用户' },
  { value: 'ADMIN_DELETE_POST', label: '管理员删除文章' },
  { value: 'ADMIN_UPDATE_COURSE', label: '管理员更新课程' },
];

// (移除未使用的日期转换函数)

export const LogsPage: React.FC = () => {
  // 查询参数（表单）
  const [form, setForm] = useState<{
    userId: string;
    ip: string;
    activityCategory: string; // 使用空字符串代表不限
    activityType: string;     // 使用空字符串代表不限
  }>({ userId: '', ip: '', activityCategory: '', activityType: '' });

  // 单控件的时间范围（开始/结束）
  const [timeRange, setTimeRange] = useState<{ from?: Date; to?: Date }>();

  // 列表数据 & 状态
  const [logs, setLogs] = useState<UserActivityLogDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paging, setPaging] = useState({ current: 1, size: 15, total: 0, pages: 0 });

  const [contextDialog, setContextDialog] = useState<{ open: boolean; log?: UserActivityLogDTO }>({ open: false });

  const resetForm = () => {
    setForm({ userId: '', ip: '', activityCategory: '', activityType: '' });
    setTimeRange(undefined);
  };

  const buildQuery = useCallback((pageNum?: number, pageSize?: number): ActivityLogQueryRequest => {
    const query: ActivityLogQueryRequest = {
      pageNum: pageNum ?? paging.current,
      pageSize: pageSize ?? paging.size,
    };
    if (form.userId.trim()) query.userId = form.userId.trim();
    if (form.ip.trim()) query.ip = form.ip.trim();
    if (form.activityCategory && !form.activityType) query.activityCategory = form.activityCategory as ActivityCategory;
    if (form.activityType && !form.activityCategory) query.activityType = form.activityType as ActivityType;
    if (timeRange?.from) query.startTime = format(timeRange.from as Date, 'yyyy-MM-dd 00:00:00');
    if (timeRange?.to) query.endTime = format(timeRange.to as Date, 'yyyy-MM-dd 23:59:59');
    return query;
  }, [form, timeRange, paging.current, paging.size]);

  const loadLogs = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const params = buildQuery(pageNum, pageSize);
      const res: PageResponse<UserActivityLogDTO> = await AdminLogsService.getUserActivityLogs(params);
      setLogs(res.records);
      setPaging({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch {
      // 错误提示由拦截器处理
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // 初次加载
  useEffect(() => {
    loadLogs(1, paging.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryDisabled = !!form.activityType; // 二选一
  const typeDisabled = !!form.activityCategory; // 二选一

  // 统一使用 AdminPagination（shadcn 适配器）

  return (
    <div className="h-full flex flex-col">
      {/* 单卡片：顶部为筛选行，下面是表格 */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="pt-6 flex-1 flex flex-col min-h-0">
          {/* 顶部筛选和操作区域 */}
          <div className="flex-shrink-0">
            {/* 顶部筛选行（无标签，使用占位符） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
              <Input
                id="userId"
                placeholder="用户ID"
                value={form.userId}
                onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))}
              />
              <Input
                id="ip"
                placeholder="IP 地址"
                value={form.ip}
                onChange={(e) => setForm(prev => ({ ...prev, ip: e.target.value }))}
              />
              <Select
                value={form.activityCategory}
                onValueChange={(v) => setForm(prev => ({ ...prev, activityCategory: v, activityType: '' }))}
                disabled={categoryDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoryDisabled ? '活动分类（类型已选不可选）' : '活动分类'} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.activityType}
                onValueChange={(v) => setForm(prev => ({ ...prev, activityType: v, activityCategory: '' }))}
                disabled={typeDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={typeDisabled ? '活动类型（分类已选不可选）' : '活动类型'} />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DateRangePicker value={timeRange} onChange={setTimeRange} placeholder="时间范围" />
            </div>

            {/* 操作按钮行 */}
            <div className="flex flex-wrap gap-2 mb-4 justify-end">
              <Button variant="outline" onClick={() => resetForm()}>
                <XCircle className="mr-2 h-4 w-4" /> 重置
              </Button>
              <Button variant="outline" onClick={() => loadLogs(paging.current, paging.size)} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" /> 刷新
              </Button>
              <Button onClick={() => loadLogs(1, paging.size)} disabled={loading}>
                <Search className="mr-2 h-4 w-4" /> 查询
              </Button>
            </div>
          </div>

          {/* 表格区域：使用flex-1自动填充剩余空间 */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border min-h-0">
              <Table enableVerticalScroll className="h-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>目标</TableHead>
                    <TableHead>IP/设备</TableHead>
                    <TableHead>请求路径</TableHead>
                    <TableHead className="text-right min-w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">{log.createTime}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.nickname || '未知用户'}</span>
                            <span className="text-xs text-muted-foreground">ID: {log.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="w-fit">{log.activityTypeDesc || log.activityType}</Badge>
                            {log.failureReason && (
                              <span className="text-xs text-red-600">失败：{log.failureReason}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.targetName || '—'}</span>
                            <span className="text-xs text-muted-foreground">{log.targetType || '—'}{log.targetId ? `（${log.targetId}）` : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{log.ip || '—'}</span>
                            <span className="text-xs text-muted-foreground line-clamp-2">{log.browser || log.equipment || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          <span className="text-sm text-muted-foreground break-all">{log.requestPath || '—'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setContextDialog({ open: true, log })}>
                            <Eye className="mr-2 h-4 w-4" /> 详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 分页组件：固定在底部 */}
          <div className="flex-shrink-0 pt-4">
            <AdminPagination
              current={paging.current}
              totalPages={paging.pages}
              total={paging.total}
              onChange={(p) => loadLogs(p, paging.size)}
              mode="full"
            />
          </div>
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={contextDialog.open} onOpenChange={(open) => setContextDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
            <DialogDescription>查看上下文数据与完整请求信息</DialogDescription>
          </DialogHeader>
          {contextDialog.log && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">时间</div>
                  <div className="font-medium">{contextDialog.log.createTime}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">用户</div>
                  <div className="font-medium">{contextDialog.log.nickname}（ID: {contextDialog.log.userId}）</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">类型</div>
                  <div className="font-medium">{contextDialog.log.activityTypeDesc || contextDialog.log.activityType}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">请求路径</div>
                  <div className="font-medium break-all">{contextDialog.log.requestPath || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">IP</div>
                  <div className="font-medium">{contextDialog.log.ip || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">设备/浏览器</div>
                  <div className="font-medium break-all">{contextDialog.log.browser || contextDialog.log.equipment || '—'}</div>
                </div>
                {contextDialog.log.failureReason && (
                  <div className="col-span-2">
                    <div className="text-muted-foreground">失败原因</div>
                    <div className="font-medium text-red-600">{contextDialog.log.failureReason}</div>
                  </div>
                )}
                <div className="col-span-2">
                  <div className="text-muted-foreground">目标</div>
                  <div className="font-medium">{contextDialog.log.targetType || '—'} {contextDialog.log.targetName ? `- ${contextDialog.log.targetName}` : ''} {contextDialog.log.targetId ? `（${contextDialog.log.targetId}）` : ''}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">上下文数据</div>
                <pre className="bg-muted/50 rounded-md p-3 text-xs overflow-auto max-h-72">
                  {(() => {
                    try {
                      const data = contextDialog.log?.contextData ? JSON.parse(contextDialog.log.contextData) : null;
                      return JSON.stringify(data, null, 2);
                    } catch {
                      return contextDialog.log?.contextData || '—';
                    }
                  })()}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
