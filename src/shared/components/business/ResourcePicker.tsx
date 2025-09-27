import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';
import { PagedResourceResponse, ResourceInfo } from '@shared/types/upload.types';
import { showToast } from '@shared/utils/toast';

type ResourceTypeFilter = 'ALL' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';

interface ResourcePickerProps {
  open: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}

export const ResourcePicker: React.FC<ResourcePickerProps> = ({ open, onClose, onInsert }) => {
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceTypeFilter>('ALL');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PagedResourceResponse>({ total: 0, pageNum: 1, pageSize, pages: 0, records: [] });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      await ResourceAccessService.ensureSession();
      const resp = await ResourceAccessService.getUserResources({
        pageNum,
        pageSize,
        resourceType: typeFilter === 'ALL' ? undefined : typeFilter,
      });
      // 简单客户端过滤关键字
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        resp.records = resp.records.filter(r => r.originalName.toLowerCase().includes(kw));
      }
      setData(resp);
    } catch (e) {
      console.error('加载资源失败:', e);
      showToast.error('加载资源失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, typeFilter, keyword]);

  useEffect(() => {
    if (open) {
      setPageNum(1);
      fetchList();
    }
  }, [open, typeFilter]);

  useEffect(() => {
    if (open) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const buildSnippet = useCallback((r: ResourceInfo): string => {
    const url = ResourceAccessService.getResourceAccessUrl(r.id);
    const name = r.originalName || 'resource';
    const type = r.resourceType;

    // 自定义语法规范：
    // 图片：![image#S #R #100% #auto](url)
    // 视频：!video[filename#100% #auto](url){poster=posterUrl}
    if (type === 'IMAGE') {
      return `![image#S #R #100% #auto](${url})`;
    }

    if (type === 'VIDEO') {
      // 从当前页数据里尝试寻找可能的poster（同名且包含poster/封面/cover关键字的图片）
      const base = name.replace(/\.[^.]+$/, '').toLowerCase();
      const posterCandidate = data.records.find(x => (
        x.resourceType === 'IMAGE' &&
        (
          x.originalName.toLowerCase().includes(`${base}`) ||
          x.originalName.toLowerCase().startsWith(base)
        ) && /poster|封面|cover/i.test(x.originalName)
      ));
      const posterUrl = posterCandidate ? ResourceAccessService.getResourceAccessUrl(posterCandidate.id) : '';
      const posterPart = posterUrl ? `{poster=${posterUrl}}` : '';
      return `!video[${name}#100% #auto](${url})${posterPart}`;
    }

    // 文档/其他
    return `[${name}](${url})`;
  }, [data.records]);

  const handleInsertSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const records = data.records.filter(r => selectedIds.has(r.id));
    if (records.length === 0) return;
    const combined = records.map(buildSnippet).join('\n\n');
    onInsert(combined + '\n');
    showToast.success('已插入所选资源');
    clearSelection();
    onClose();
  }, [selectedIds, data.records, buildSnippet, onInsert, onClose, clearSelection]);

  const handleCopy = useCallback(async (text: string, okMsg = '已复制到剪贴板') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success(okMsg);
    } catch {
      showToast.error('复制失败，请手动复制');
    }
  }, []);

  const totalPages = data.pages || Math.ceil((data.total || 0) / pageSize) || 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>资源库</DialogTitle>
          <DialogDescription>选择或搜索已有资源，可复制链接或插入到编辑器</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 筛选区 */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1">
              <Input placeholder="搜索文件名..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') fetchList(); }} />
            </div>
            <div className="w-40">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ResourceTypeFilter)}>
                <SelectTrigger><SelectValue placeholder="全部类型"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部</SelectItem>
                  <SelectItem value="IMAGE">图片</SelectItem>
                  <SelectItem value="VIDEO">视频</SelectItem>
                  <SelectItem value="DOCUMENT">文档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={() => { setPageNum(1); fetchList(); }} disabled={loading}>搜索</Button>
          </div>

          {/* 列表区 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.records.map((r) => {
              const url = ResourceAccessService.getResourceAccessUrl(r.id);
              const selected = selectedIds.has(r.id);
              return (
                <div key={r.id} className={`relative border rounded-lg overflow-hidden group bg-white`}> 
                  {/* 预览 */}
                  <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                    {r.resourceType === 'IMAGE' ? (
                      <img src={url} alt={r.originalName} className="w-full h-full object-cover" />
                    ) : r.resourceType === 'VIDEO' ? (
                      <div className="w-full h-full bg-black/60 text-white text-xs flex items-center justify-center">视频</div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center">文档</div>
                    )}
                  </div>
                  {/* 文件名 */}
                  <div className="px-2 py-2 text-sm truncate" title={r.originalName}>{r.originalName}</div>

                  {/* 操作条 */}
                  <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleCopy(url, '直链已复制')}>复制直链</Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleCopy(buildSnippet(r), 'Markdown已复制')}>复制Markdown</Button>
                  </div>

                  {/* 选择勾选 */}
                  <button
                    className={`absolute left-2 top-2 rounded-md px-2 py-1 text-xs ${selected ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700 border'}`}
                    onClick={() => toggleSelect(r.id)}
                    title={selected ? '取消选择' : '选择此资源'}
                  >{selected ? '已选' : '选择'}</button>
                </div>
              );
            })}
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between text-sm">
            <div>共 {data.total} 条 · 第 {pageNum}/{totalPages} 页</div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" disabled={pageNum <= 1 || loading} onClick={() => setPageNum((p) => Math.max(1, p - 1))}>上一页</Button>
              <Button variant="outline" size="sm" disabled={pageNum >= totalPages || loading} onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}>下一页</Button>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">已选择 {selectedIds.size} 个资源</div>
            <div className="space-x-2">
              <Button variant="outline" onClick={clearSelection} disabled={selectedIds.size === 0}>清空</Button>
              <Button onClick={handleInsertSelected} disabled={selectedIds.size === 0}>插入已选</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
