import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Link as LinkIcon, RefreshCw, Search, XCircle } from 'lucide-react';
import { ResourceService } from '@shared/services/api/resource.service';
import { PageResponse, ResourceDTO, ResourceQueryRequest } from '@shared/types';
import AdminPagination from '@shared/components/AdminPagination';

function formatSize(size?: number) {
  if (!size || size <= 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = size;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}

export const MyResourcesPage: React.FC = () => {
  const [list, setList] = useState<ResourceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });

  const [query, setQuery] = useState<ResourceQueryRequest>({ pageNum: 1, pageSize: 10, resourceType: undefined });
  const [keyword, setKeyword] = useState('');

  const filteredList = useMemo(() => {
    if (!keyword.trim()) return list;
    const k = keyword.toLowerCase();
    return list.filter(r =>
      r.originalName?.toLowerCase().includes(k) ||
      r.format?.toLowerCase().includes(k)
    );
  }, [list, keyword]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res: PageResponse<ResourceDTO> = await ResourceService.getMyResources(query);
      setList(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [query.pageNum, query.pageSize, query.resourceType, load]);

  const reset = () => {
    setKeyword('');
    setQuery({ pageNum: 1, pageSize: 10, resourceType: undefined });
  };

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">我的资源</h2>
          </div>

          {/* 筛选区 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 min-w-0">
            <Input placeholder="搜索文件名/格式" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <Select
              value={query.resourceType || 'all'}
              onValueChange={(v) => setQuery(prev => ({ ...prev, pageNum: 1, resourceType: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger><SelectValue placeholder="资源类型" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="IMAGE">图片</SelectItem>
                <SelectItem value="VIDEO">视频</SelectItem>
                <SelectItem value="DOCUMENT">文档</SelectItem>
                <SelectItem value="AUDIO">音频</SelectItem>
                <SelectItem value="OTHER">其他</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(query.pageSize || 10)}
              onValueChange={(v) => setQuery(prev => ({ ...prev, pageNum: 1, pageSize: Number(v) }))}
            >
              <SelectTrigger><SelectValue placeholder="每页数量" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="10">每页 10 条</SelectItem>
                <SelectItem value="20">每页 20 条</SelectItem>
                <SelectItem value="50">每页 50 条</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={reset} disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={() => load()} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button onClick={() => setQuery(prev => ({ ...prev, pageNum: 1 }))} disabled={loading}>
              <Search className="mr-2 h-4 w-4" /> 查询
            </Button>
          </div>

          {/* 表格 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">文件名</TableHead>
                  <TableHead className="min-w-[100px]">类型</TableHead>
                  <TableHead className="min-w-[90px]">格式</TableHead>
                  <TableHead className="min-w-[100px]">大小</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="text-right min-w-[160px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">加载中...</TableCell>
                  </TableRow>
                ) : filteredList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredList.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium break-all">{r.originalName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.resourceType || '-'}</Badge>
                      </TableCell>
                      <TableCell>{r.format || '-'}</TableCell>
                      <TableCell>{formatSize(r.size)}</TableCell>
                      <TableCell>{r.createTime ? new Date(r.createTime).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={ResourceService.buildAccessUrl(r.id)} target="_blank" rel="noreferrer">
                              <LinkIcon className="w-4 h-4 mr-1" /> 访问
                            </a>
                          </Button>
                          {r.downloadUrl && (
                            <Button asChild variant="outline" size="sm">
                              <a href={r.downloadUrl} target="_blank" rel="noreferrer">
                                <Download className="w-4 h-4 mr-1" /> 下载
                              </a>
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

          <div className="pt-4">
            <AdminPagination
              current={pagination.current}
              totalPages={pagination.pages}
              total={pagination.total}
              onChange={(p) => setQuery(prev => ({ ...prev, pageNum: p }))}
              mode="full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyResourcesPage;

