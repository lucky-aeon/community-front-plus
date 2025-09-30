import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Eye, ExternalLink, RefreshCw, UploadCloud, EyeOff, CheckCircle } from 'lucide-react';
import { AdminAiNewsService } from '@shared/services/api';
import type { AdminDailyItemDTO, AdminDailyQueryRequest, DailyItemStatus } from '@shared/types';
import AdminPagination from '@shared/components/AdminPagination';

export const AiDailyNewsPage: React.FC = () => {
  const [items, setItems] = useState<AdminDailyItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });

  // 查询条件
  const [query, setQuery] = useState<AdminDailyQueryRequest>({ pageNum: 1, pageSize: 10, status: undefined, date: undefined, withContent: false });

  // 详情弹窗
  const [detail, setDetail] = useState<{ open: boolean; item: AdminDailyItemDTO | null }>({ open: false, item: null });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await AdminAiNewsService.page(query);
      setItems(resp.records);
      setPagination({ current: resp.current, size: resp.size, total: resp.total, pages: resp.pages });
    } catch (e) {
      console.error('加载AI日报失败:', e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadData(); }, [query.pageNum, query.pageSize, query.status, query.date, query.withContent, loadData]);

  const handleRefresh = () => loadData();

  const handleIngest = async () => {
    try {
      await AdminAiNewsService.ingest();
      // 采集成功后刷新
      loadData();
    } catch (e) {
      console.error('手动采集失败:', e);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await AdminAiNewsService.publish(id);
      // 前端本地更新状态，避免重新拉取
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'PUBLISHED' } : it));
    } catch (e) {
      console.error('发布失败:', e);
    }
  };

  const handleHide = async (id: string) => {
    try {
      await AdminAiNewsService.hide(id);
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'HIDDEN' } : it));
    } catch (e) {
      console.error('隐藏失败:', e);
    }
  };

  const onPageChange = (page: number) => setQuery(prev => ({ ...prev, pageNum: page }));

  const renderStatusBadge = (status: DailyItemStatus) => (
    <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
      {AdminAiNewsService.getStatusDescription(status)}
    </Badge>
  );

  const formatDateTime = (s?: string) => {
    if (!s) return '-';
    try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; }
  };

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          {/* 筛选区 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                value={query.date || ''}
                onChange={(e) => setQuery(prev => ({ ...prev, date: e.target.value || undefined, pageNum: 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={query.status || 'all'}
                onValueChange={(v) => setQuery(prev => ({ ...prev, status: v === 'all' ? undefined : (v as DailyItemStatus), pageNum: 1 }))}
              >
                <SelectTrigger><SelectValue placeholder="选择状态" /></SelectTrigger>
                <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="PUBLISHED">已发布</SelectItem>
                  <SelectItem value="HIDDEN">隐藏</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>携带正文</Label>
              <div className="h-10 flex items-center">
                <Switch
                  checked={!!query.withContent}
                  onCheckedChange={(v) => setQuery(prev => ({ ...prev, withContent: !!v, pageNum: 1 }))}
                />
              </div>
            </div>
          </div>

          {/* 操作区 */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button onClick={handleIngest} disabled={loading}>
              <UploadCloud className="mr-2 h-4 w-4" /> 采集最新
            </Button>
          </div>

          {/* 表格 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">来源</TableHead>
                  <TableHead className="min-w-[320px]">标题</TableHead>
                  <TableHead className="min-w-[120px]">发布时间</TableHead>
                  <TableHead className="min-w-[120px]">抓取时间</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[140px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="whitespace-nowrap">{it.source}</TableCell>
                      <TableCell>
                        <div className="max-w-[520px]">
                          <div className="font-medium line-clamp-1">{it.title}</div>
                          {query.withContent ? (
                            <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: it.content || '' }} />
                          ) : (
                            <div className="text-sm text-muted-foreground line-clamp-2">{it.summary || ''}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <a href={it.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center">
                              <ExternalLink className="w-3 h-3 mr-1" /> 原文
                            </a>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => setDetail({ open: true, item: it })}>
                              <Eye className="w-3 h-3 mr-1" /> 查看详情
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(it.publishedAt)}</TableCell>
                      <TableCell>{formatDateTime(it.fetchedAt)}</TableCell>
                      <TableCell>
                        {renderStatusBadge(it.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {it.status === 'PUBLISHED' ? (
                            <Button variant="outline" size="sm" onClick={() => handleHide(it.id)}>
                              <EyeOff className="w-4 h-4 mr-1" /> 隐藏
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handlePublish(it.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" /> 发布
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="mt-4">
            <AdminPagination
              current={pagination.current}
              totalPages={pagination.pages}
              total={pagination.total}
              onChange={onPageChange}
              mode="full"
            />
          </div>
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={detail.open} onOpenChange={(open) => setDetail({ open, item: null })}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI 日报详情</DialogTitle>
            <DialogDescription>
              {detail.item?.title}
            </DialogDescription>
          </DialogHeader>
          {detail.item && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
                <span>来源：{detail.item.source}</span>
                <span>发布时间：{formatDateTime(detail.item.publishedAt)}</span>
                <span>抓取时间：{formatDateTime(detail.item.fetchedAt)}</span>
                <span>状态：{AdminAiNewsService.getStatusDescription(detail.item.status)}</span>
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: detail.item.content || detail.item.summary || '' }} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail({ open: false, item: null })}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

