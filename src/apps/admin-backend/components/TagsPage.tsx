import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Edit, UserPlus, ShieldPlus, Search, XCircle, Check } from 'lucide-react';
import AdminPagination from '@shared/components/AdminPagination';
import { AdminTagService } from '@shared/services/api/admin-tag.service';
import type {
  PageResponse,
  TagDefinitionDTO,
  TagQueryRequest,
  CreateTagRequest,
  UpdateTagRequest,
  TagSourceType,
} from '@shared/types';
import { showToast } from '@shared/utils/toast';
import { ImageUpload } from '@shared/components/common/ImageUpload';
import { CoursesService } from '@shared/services/api/courses.service';
import type { CourseDTO, TagScopeDTO } from '@shared/types';

export const TagsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<TagDefinitionDTO[]>([]);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [query, setQuery] = useState<TagQueryRequest>({ pageNum: 1, pageSize: 10, name: '', category: undefined, enabled: undefined });

  // 创建/编辑对话框
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<TagDefinitionDTO | null>(null);
  const [form, setForm] = useState<{ code: string; name: string; category: string; iconUrl?: string; description?: string; publicVisible?: boolean; uniquePerUser?: boolean; enabled?: boolean }>(
    { code: '', name: '', category: '', iconUrl: '', description: '', publicVisible: true, uniquePerUser: false, enabled: true }
  );
  const [submitting, setSubmitting] = useState(false);

  // 授予标签对话框
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<{ userId: string; sourceType: TagSourceType | 'NONE'; sourceId?: string }>({ userId: '', sourceType: 'NONE', sourceId: '' });
  const [assigning, setAssigning] = useState(false);

  // 添加作用域对话框（仅课程）
  const [scopeOpen, setScopeOpen] = useState(false);
  const [scoping, setScoping] = useState(false);
  const [courseKeyword, setCourseKeyword] = useState('');
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseList, setCourseList] = useState<CourseDTO[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [scopesLoading, setScopesLoading] = useState(false);
  const [scopes, setScopes] = useState<TagScopeDTO[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [scopeCourseTitles, setScopeCourseTitles] = useState<Record<string, string>>({});

  // 撤销标签对话框
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeForm, setRevokeForm] = useState<{ userId: string }>({ userId: '' });
  const [revoking, setRevoking] = useState(false);

  // 加载列表
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page: PageResponse<TagDefinitionDTO> = await AdminTagService.getTags(query);
      setList(page.records);
      setPagination({ current: page.current, size: page.size, total: page.total, pages: page.pages });
    } catch (e) {
      console.error('加载标签列表失败:', e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [query.pageNum, query.pageSize, query.category, query.enabled]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', category: '', iconUrl: '', description: '', publicVisible: true, uniquePerUser: false, enabled: true });
    setEditOpen(true);
  };
  const openEdit = (row: TagDefinitionDTO) => {
    setEditing(row);
    setForm({
      code: row.code,
      name: row.name,
      category: row.category,
      iconUrl: row.iconUrl || '',
      description: row.description || '',
      publicVisible: !!row.publicVisible,
      uniquePerUser: !!row.uniquePerUser,
      enabled: !!row.enabled,
    });
    setEditOpen(true);
  };

  const valid = useMemo(() => form.name.trim() && form.category.trim() && (!editing ? form.code.trim() : true), [form, editing]);

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      if (!editing) {
        const payload: CreateTagRequest = {
          code: form.code.trim(),
          name: form.name.trim(),
          category: form.category.trim(),
          iconUrl: form.iconUrl?.trim() || undefined,
          description: form.description?.trim() || undefined,
          publicVisible: !!form.publicVisible,
          uniquePerUser: !!form.uniquePerUser,
          enabled: !!form.enabled,
        };
        if (!payload.code) { showToast.error('请输入标签编码'); setSubmitting(false); return; }
        await AdminTagService.createTag(payload);
      } else {
        const payload: UpdateTagRequest = {
          name: form.name.trim(),
          category: form.category.trim(),
          iconUrl: form.iconUrl?.trim() || undefined,
          description: form.description?.trim() || undefined,
          publicVisible: !!form.publicVisible,
          uniquePerUser: !!form.uniquePerUser,
          enabled: !!form.enabled,
        };
        await AdminTagService.updateTag(editing.id, payload);
      }
      setEditOpen(false);
      await load();
    } catch (e) {
      console.error('提交失败:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const openAssign = (row: TagDefinitionDTO) => {
    setEditing(row);
    setAssignForm({ userId: '', sourceType: 'NONE', sourceId: '' });
    setAssignOpen(true);
  };
  const doAssign = async () => {
    if (!editing) return;
    if (!assignForm.userId.trim()) { showToast.error('请输入用户ID'); return; }
    setAssigning(true);
    try {
      await AdminTagService.assign({
        userId: assignForm.userId.trim(),
        tagId: editing.id,
        ...(assignForm.sourceType !== 'NONE' ? { sourceType: assignForm.sourceType } : {}),
        ...(assignForm.sourceId?.trim() ? { sourceId: assignForm.sourceId.trim() } : {}),
      });
      setAssignOpen(false);
    } catch (e) {
      console.error('授予标签失败:', e);
    } finally {
      setAssigning(false);
    }
  };

  const openRevoke = (row: TagDefinitionDTO) => {
    setEditing(row);
    setRevokeForm({ userId: '' });
    setRevokeOpen(true);
  };
  const doRevoke = async () => {
    if (!editing) return;
    if (!revokeForm.userId.trim()) { showToast.error('请输入用户ID'); return; }
    setRevoking(true);
    try {
      await AdminTagService.revoke({ userId: revokeForm.userId.trim(), tagId: editing.id });
      setRevokeOpen(false);
    } catch (e) {
      console.error('撤销用户标签失败:', e);
    } finally {
      setRevoking(false);
    }
  };

  const openScope = (row: TagDefinitionDTO) => {
    setEditing(row);
    setCourseKeyword('');
    setSelectedCourseId('');
    setCourseList([]);
    setScopes([]);
    setScopeOpen(true);
  };
  const doAddScope = async () => {
    if (!editing) return;
    if (!selectedCourseId) { showToast.error('请选择课程'); return; }
    setScoping(true);
    try {
      await AdminTagService.addScope(editing.id, { targetType: 'COURSE', targetId: selectedCourseId });
      setScopeOpen(false);
    } catch (e) {
      console.error('添加作用域失败:', e);
    } finally {
      setScoping(false);
    }
  };

  // 课程搜索（对话框打开/关键词变更时触发）
  useEffect(() => {
    if (!scopeOpen) return;
    // 加载已添加范围
    const loadScopes = async () => {
      if (!editing) return;
      setScopesLoading(true);
      try {
        const list = await AdminTagService.getScopes(editing.id);
        setScopes(list || []);
        // 并发加载课程标题（仅 COURSE 类型）
        const courseIds = Array.from(new Set((list || []).filter(s => s.targetType === 'COURSE').map(s => s.targetId)));
        if (courseIds.length) {
          const results = await Promise.all(courseIds.map(id => CoursesService.getCourseById(id).then(c => ({ id, title: c.title })).catch(() => ({ id, title: '' }))));
          const map: Record<string, string> = {};
          results.forEach(r => { if (r && r.id) map[r.id] = r.title || ''; });
          setScopeCourseTitles(map);
        } else {
          setScopeCourseTitles({});
        }
      } catch (e) {
        console.error('加载标签范围失败:', e);
      } finally {
        setScopesLoading(false);
      }
    };
    loadScopes();
    let cancelled = false;
    const fetchCourses = async () => {
      setCourseLoading(true);
      try {
        const page = await CoursesService.getCoursesList({ pageNum: 1, pageSize: 10, keyword: courseKeyword || undefined });
        if (!cancelled) setCourseList(page.records || []);
      } catch (e) {
        console.error('加载课程列表失败:', e);
      } finally {
        if (!cancelled) setCourseLoading(false);
      }
    };
    const t = setTimeout(fetchCourses, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [scopeOpen, courseKeyword]);

  const doRemoveScope = async (scopeId: string) => {
    if (!scopeId) return;
    setRemoving(scopeId);
    try {
      await AdminTagService.removeScope(scopeId);
      const next = scopes.filter(s => s.id !== scopeId);
      setScopes(next);
    } catch (e) {
      console.error('删除范围失败:', e);
    } finally {
      setRemoving(null);
    }
  };

  const resetFilters = () => {
    setQuery({ pageNum: 1, pageSize: 10, name: '', category: undefined, enabled: undefined });
  };

  return (
    <div className="h-full flex flex-col">
      {/* 筛选 + 操作 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 min-w-0">
            <Input placeholder="按名称搜索" value={query.name || ''} onChange={(e) => setQuery(prev => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="按分类搜索" value={query.category || ''} onChange={(e) => setQuery(prev => ({ ...prev, category: e.target.value }))} />
            <Select value={typeof query.enabled === 'boolean' ? (query.enabled ? 'enabled' : 'disabled') : 'all'} onValueChange={(v) => setQuery(prev => ({ ...prev, enabled: v === 'all' ? undefined as any : v === 'enabled' }))}>
              <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="enabled">启用</SelectItem>
                <SelectItem value="disabled">停用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetFilters} disabled={loading}>
                <XCircle className="mr-2 h-4 w-4" /> 重置
              </Button>
              <Button variant="outline" onClick={() => load()} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" /> 刷新
              </Button>
              <Button onClick={() => setQuery(prev => ({ ...prev, pageNum: 1 }))} disabled={loading}>
                <Search className="mr-2 h-4 w-4" /> 查询
              </Button>
            </div>
            <div>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> 新增标签
              </Button>
            </div>
          </div>

          {/* 表格 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">名称 / 编码</TableHead>
                  <TableHead className="min-w-[120px]">分类</TableHead>
                  <TableHead className="min-w-[100px]">图标</TableHead>
                  <TableHead className="min-w-[220px]">描述</TableHead>
                  <TableHead className="min-w-[160px]">可见/唯一/启用</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[260px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-52 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  list.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        {row.iconUrl ? (
                          <img src={row.iconUrl.startsWith('http') || row.iconUrl.startsWith('/') ? row.iconUrl : row.iconUrl} alt="icon" className="h-8 w-8 object-cover rounded" />
                        ) : (
                          <span className="text-xs text-muted-foreground">无</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[360px] truncate" title={row.description || ''}>{row.description || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={row.publicVisible ? 'default' : 'secondary'}>{row.publicVisible ? '可见' : '隐藏'}</Badge>
                          <Badge variant={row.uniquePerUser ? 'default' : 'secondary'}>{row.uniquePerUser ? '唯一' : '可重复'}</Badge>
                          <Badge variant={row.enabled ? 'default' : 'secondary'}>{row.enabled ? '启用' : '停用'}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{row.createTime || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                            <Edit className="h-3 w-3 mr-1" /> 编辑
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openAssign(row)}>
                            <UserPlus className="h-3 w-3 mr-1" /> 授予用户
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openRevoke(row)}>
                            撤销用户标签
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openScope(row)}>
                            <ShieldPlus className="h-3 w-3 mr-1" /> 添加范围
                          </Button>
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
            <AdminPagination current={pagination.current} totalPages={pagination.pages} total={pagination.total} onChange={(p) => setQuery(prev => ({ ...prev, pageNum: p }))} />
          </div>
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) setEditOpen(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑标签' : '新增标签'}</DialogTitle>
            <DialogDescription>填写标签信息并保存</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editing && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">编码</Label>
                <Input className="col-span-3" placeholder="唯一编码，如 VIP_USER" value={form.code} onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">名称</Label>
              <Input className="col-span-3" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">分类</Label>
              <Input className="col-span-3" value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} placeholder="如 USER/COURSE 等" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">图标</Label>
              <div className="col-span-3">
                <ImageUpload
                  value={form.iconUrl || ''}
                  onChange={(url) => setForm(prev => ({ ...prev, iconUrl: url }))}
                  onUploadSuccess={(rid) => { if (rid) setForm(prev => ({ ...prev, iconUrl: form.iconUrl || '' })); }}
                  placeholder="点击上传或拖拽图片到此处"
                  previewSize="md"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">描述</Label>
              <Input className="col-span-3" value={form.description || ''} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="可选" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">前台可见</Label>
              <div className="col-span-3"><Switch checked={!!form.publicVisible} onCheckedChange={(v) => setForm(prev => ({ ...prev, publicVisible: v }))} /></div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">用户唯一</Label>
              <div className="col-span-3"><Switch checked={!!form.uniquePerUser} onCheckedChange={(v) => setForm(prev => ({ ...prev, uniquePerUser: v }))} /></div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">启用</Label>
              <div className="col-span-3"><Switch checked={!!form.enabled} onCheckedChange={(v) => setForm(prev => ({ ...prev, enabled: v }))} /></div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={submit} disabled={!valid || submitting}>{submitting ? '提交中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 授予标签对话框 */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>授予标签：{editing?.name}</DialogTitle>
            <DialogDescription>输入用户ID，将该标签授予用户</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">用户ID</Label>
              <Input className="col-span-3" value={assignForm.userId} onChange={(e) => setAssignForm(prev => ({ ...prev, userId: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">来源类型</Label>
              <div className="col-span-3">
                <Select value={assignForm.sourceType} onValueChange={(v) => setAssignForm(prev => ({ ...prev, sourceType: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="选择来源类型" /></SelectTrigger>
                  <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                    <SelectItem value="NONE">不指定</SelectItem>
                    <SelectItem value="MANUAL">人工操作</SelectItem>
                    <SelectItem value="COURSE_COMPLETION">课程完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">来源ID</Label>
              <Input className="col-span-3" placeholder="可留空" value={assignForm.sourceId || ''} onChange={(e) => setAssignForm(prev => ({ ...prev, sourceId: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>取消</Button>
            <Button onClick={doAssign} disabled={assigning}>{assigning ? '提交中...' : '授予'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 撤销标签对话框 */}
      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>撤销标签：{editing?.name}</DialogTitle>
            <DialogDescription>输入用户ID，撤销该用户的此标签</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">用户ID</Label>
              <Input className="col-span-3" value={revokeForm.userId} onChange={(e) => setRevokeForm(prev => ({ ...prev, userId: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRevokeOpen(false)}>取消</Button>
            <Button onClick={doRevoke} disabled={revoking}>{revoking ? '提交中...' : '撤销'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加作用域对话框（仅课程） */}
      <Dialog open={scopeOpen} onOpenChange={setScopeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>添加作用域：{editing?.name}</DialogTitle>
            <DialogDescription>仅支持课程范围，搜索并选择课程</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-hidden">
            <div className="border rounded p-3 max-h-40 overflow-auto">
              <div className="text-sm font-medium mb-2">已添加范围</div>
              {scopesLoading ? (
                <div className="text-sm text-muted-foreground">加载中...</div>
              ) : scopes.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无范围</div>
              ) : (
                <ul className="space-y-2">
                  {scopes.map(s => (
                    <li key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary">{s.targetType}</Badge>
                        <span className="truncate text-sm" title={s.targetId}>
                          {s.targetType === 'COURSE' && scopeCourseTitles[s.targetId] ? scopeCourseTitles[s.targetId] : s.targetId}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" disabled={removing === s.id} onClick={() => doRemoveScope(s.id)}>
                        {removing === s.id ? '删除中...' : '删除'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">课程搜索</Label>
              <Input placeholder="输入关键词搜索课程" value={courseKeyword} onChange={(e) => setCourseKeyword(e.target.value)} />
            </div>
            <div className="border rounded h-64 overflow-auto">
              {courseLoading ? (
                <div className="p-3 text-sm text-muted-foreground">加载中...</div>
              ) : courseList.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">无匹配课程</div>
              ) : (
                <ul>
                  {courseList.map(c => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2 hover:bg-accent ${selectedCourseId === c.id ? 'bg-accent' : ''}`}
                        onClick={() => setSelectedCourseId(c.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate pr-2">{c.title}</span>
                          {selectedCourseId === c.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setScopeOpen(false)}>取消</Button>
            <Button onClick={doAddScope} disabled={scoping}>{scoping ? '提交中...' : '添加'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagsPage;
