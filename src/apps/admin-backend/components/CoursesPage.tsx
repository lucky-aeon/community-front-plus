import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus, Pencil, Trash2, GripVertical, Search, XCircle } from 'lucide-react';
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { Rating } from '@/components/ui/rating';
import { TagsInput } from '@/components/ui/tags-input';
import { ChaptersService } from '@shared/services/api/chapters.service';
import type { ChapterDTO, CreateChapterRequest, UpdateChapterRequest } from '@shared/types';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CoursesService } from '@shared/services/api/courses.service';
import type {
  CourseDTO,
  PageResponse,
  CourseStatus,
  CourseQueryRequest,
  CreateCourseRequest,
  UpdateCourseRequest
} from '@shared/types';
import AdminPagination from '@shared/components/AdminPagination';
import { ImageUpload } from '@shared/components/common/ImageUpload';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';

type Filters = { pageNum: number; pageSize: number; keyword: string; status?: CourseStatus };

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<Filters>({ pageNum: 1, pageSize: 10, keyword: '' });
  // 资源库弹窗与编辑器目标
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'course' | 'chapter' | null>(null);
  const courseDescRef = useRef<MarkdownEditorHandle>(null);
  const chapterEditorRef = useRef<MarkdownEditorHandle>(null);

  // 创建/编辑
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    submitting: boolean;
    id?: string;
    form: {
      title: string;
      description: string;
      status: CourseStatus | '';
      price?: string;
      originalPrice?: string;
      rating?: number;
      tags: string[];
      techStack: string[];
      coverUrl?: string;
      coverResourceId?: string;
      sortOrder?: string;
    };
  }>({ open: false, mode: 'create', submitting: false, form: { title: '', description: '', status: '' as CourseStatus | '', price: '', originalPrice: '', rating: 0, tags: [], techStack: [], coverUrl: '', coverResourceId: '', sortOrder: '' } });

  // 删除
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: CourseDTO }>({ open: false });

  const loadCourses = useCallback(async (pageNum?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const req: CourseQueryRequest = {
        pageNum: pageNum ?? filters.pageNum,
        pageSize: pageSize ?? filters.pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.keyword && { keyword: filters.keyword })
      };
      const res: PageResponse<CourseDTO> = await CoursesService.getCoursesList(req);
      setCourses(res.records);
      setPagination({ current: res.current, size: res.size, total: res.total, pages: res.pages });
    } catch (e) {
      console.error('加载课程失败', e);
    } finally {
      setLoading(false);
    }
  }, [filters.pageNum, filters.pageSize, filters.status, filters.keyword]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  // 前端过滤（若后端不支持 keyword/status 时用于当前页过滤）
  const filtered = useMemo(() => {
    let list = courses;
    if (filters.keyword.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw));
    }
    if (filters.status) list = list.filter(c => c.status === filters.status);
    return list;
  }, [courses, filters.keyword, filters.status]);

  const handleReset = () => setFilters({ pageNum: 1, pageSize: 10, keyword: '', status: undefined });
  const handlePageChange = (p: number) => setFilters(prev => ({ ...prev, pageNum: p }));
  const handleRefresh = () => loadCourses(pagination.current, pagination.size);
  const handleQuery = () => { setFilters(prev => ({ ...prev, pageNum: 1 })); loadCourses(1, pagination.size); };

  // 打开创建/编辑
  const openCreate = () => setEditDialog({ open: true, mode: 'create', submitting: false, form: { title: '', description: '', status: '' as CourseStatus | '', price: '', originalPrice: '', rating: 0, tags: [], techStack: [], coverUrl: '', coverResourceId: '', sortOrder: '' } });
  const openEdit = (item: CourseDTO) => setEditDialog({
    open: true,
    mode: 'edit',
    submitting: false,
    id: item.id,
    form: {
      title: item.title,
      description: item.description || '',
      status: item.status,
      price: item.price != null ? String(item.price) : '',
      originalPrice: item.originalPrice != null ? String(item.originalPrice) : '',
      rating: item.rating != null ? item.rating : 0,
      tags: (item.tags || []),
      techStack: (item.techStack || []),
      coverUrl: (() => {
        if (item.coverImage && !(item.coverImage.startsWith('http') || item.coverImage.startsWith('/'))) {
          try { return ResourceAccessService.getResourceAccessUrl(item.coverImage); } catch { return item.coverImage; }
        }
        return item.coverImage || '';
      })(),
      coverResourceId: (item.coverImage && !(item.coverImage.startsWith('http') || item.coverImage.startsWith('/'))) ? item.coverImage : '',
      sortOrder: item.sortOrder != null ? String(item.sortOrder) : ''
    }
  });

  const submitEdit = async () => {
    const { mode, id, form } = editDialog;
    // 校验
    if (!form.title.trim()) return;
    if (!form.status) return;
    const payloadBase: Partial<CreateCourseRequest & UpdateCourseRequest> = {
      title: form.title.trim(),
      ...(form.description && { description: form.description }),
      status: form.status as CourseStatus,
      ...(form.price ? { price: Number(form.price) } : {}),
      ...(form.originalPrice ? { originalPrice: Number(form.originalPrice) } : {}),
      ...(form.rating ? { rating: Number(form.rating) } : {}),
      ...(form.tags && form.tags.length ? { tags: form.tags } : {}),
      ...(form.techStack && form.techStack.length ? { techStack: form.techStack } : {}),
      ...(form.coverResourceId ? { coverImage: form.coverResourceId } : (form.coverUrl ? { coverImage: form.coverUrl } : {})),
      ...(form.sortOrder !== undefined && form.sortOrder !== '' ? { sortOrder: Number(form.sortOrder) } : {}),
    };
    try {
      setEditDialog(prev => ({ ...prev, submitting: true }));
      if (mode === 'create') {
        await CoursesService.createCourse(payloadBase as CreateCourseRequest);
      } else if (id) {
        await CoursesService.updateCourse(id, payloadBase as UpdateCourseRequest);
      }
      setEditDialog({ open: false, mode: 'create', submitting: false, form: { title: '', description: '', status: '' as CourseStatus | '', price: '', originalPrice: '', rating: 0, tags: [], techStack: [], coverUrl: '', coverResourceId: '', sortOrder: '' } });
      await loadCourses();
    } catch (e) {
      console.error('保存课程失败', e);
      setEditDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // 删除
  const confirmDelete = (item: CourseDTO) => setDeleteDialog({ open: true, item });
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await CoursesService.deleteCourse(deleteDialog.item.id);
      setDeleteDialog({ open: false });
      await loadCourses();
    } catch (e) {
      console.error('删除课程失败', e);
    }
  };

  const statusBadge = (s: CourseStatus) => {
    const text = CoursesService.getStatusText(s);
    const variant = CoursesService.getStatusVariant(s);
    return <Badge variant={variant === 'success' ? 'default' : 'secondary'}>{text}</Badge>;
  };

  // 章节管理
  const [chapterDialog, setChapterDialog] = useState<{
    open: boolean;
    course?: CourseDTO;
    loading: boolean;
    saving: boolean;
    items: ChapterDTO[];
    edit?: { index?: number; data: { title: string; content: string; sortOrder: string; readingTime?: string } };
  }>({ open: false, loading: false, saving: false, items: [] });

  const openChapters = async (course: CourseDTO) => {
    try {
      setChapterDialog({ open: true, course, loading: true, saving: false, items: [] });
      const items = await ChaptersService.getAllCourseChapters(course.id);
      setChapterDialog({ open: true, course, loading: false, saving: false, items });
    } catch (e) {
      console.error('加载章节失败', e);
      setChapterDialog({ open: false, loading: false, saving: false, items: [] });
    }
  };

  const onChapterDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setChapterDialog(prev => {
      const from = prev.items.findIndex(ch => ch.id === String(active.id));
      const to = prev.items.findIndex(ch => ch.id === String(over.id));
      if (from < 0 || to < 0) return prev;
      const items = arrayMove(prev.items, from, to);
      return { ...prev, items };
    });
  };

  const saveChapterOrder = async () => {
    if (!chapterDialog.course) return;
    try {
      setChapterDialog(prev => ({ ...prev, saving: true }));
      await ChaptersService.updateChaptersOrder(chapterDialog.items.map(i => i.id));
      setChapterDialog(prev => ({ ...prev, saving: false }));
    } catch (e) {
      console.error('保存章节顺序失败', e);
      setChapterDialog(prev => ({ ...prev, saving: false }));
    }
  };

  const openChapterEdit = (index?: number) => {
    if (!chapterDialog.course) return;
    if (index !== undefined) {
      const ch = chapterDialog.items[index];
      setChapterDialog(prev => ({ ...prev, edit: { index, data: { title: ch.title, content: ch.content, sortOrder: String(ch.sortOrder), readingTime: ch.readingTime ? String(ch.readingTime) : '' } } }));
    } else {
      setChapterDialog(prev => ({ ...prev, edit: { data: { title: '', content: '', sortOrder: String(prev.items.length), readingTime: '' } } }));
    }
  };

  const submitChapterEdit = async () => {
    if (!chapterDialog.course || !chapterDialog.edit) return;
    const { index, data } = chapterDialog.edit;
    const reading = data.readingTime ? Number(data.readingTime) : ChaptersService.estimateReadingTime(data.content);
    try {
      setChapterDialog(prev => ({ ...prev, saving: true }));
      if (index === undefined) {
        const created = await ChaptersService.createChapter({
          title: data.title.trim(),
          content: data.content,
          courseId: chapterDialog.course!.id,
          sortOrder: Number(data.sortOrder || '0'),
          readingTime: reading,
        } as CreateChapterRequest);
        setChapterDialog(prev => ({ ...prev, saving: false, edit: undefined, items: [...prev.items, created] }));
      } else {
        const target = chapterDialog.items[index];
        const updated = await ChaptersService.updateChapter(target.id, {
          title: data.title.trim(),
          content: data.content,
          courseId: chapterDialog.course!.id,
          sortOrder: Number(data.sortOrder || String(target.sortOrder)),
          readingTime: reading,
        } as UpdateChapterRequest);
        const next = [...chapterDialog.items];
        next[index] = updated;
        setChapterDialog(prev => ({ ...prev, saving: false, edit: undefined, items: next }));
      }
    } catch (e) {
      console.error('保存章节失败', e);
      setChapterDialog(prev => ({ ...prev, saving: false }));
    }
  };

  const deleteChapter = async (index: number) => {
    const ch = chapterDialog.items[index];
    try {
      setChapterDialog(prev => ({ ...prev, saving: true }));
      await ChaptersService.deleteChapter(ch.id);
      const next = chapterDialog.items.filter((_, i) => i !== index);
      setChapterDialog(prev => ({ ...prev, saving: false, items: next }));
    } catch (e) {
      console.error('删除章节失败', e);
      setChapterDialog(prev => ({ ...prev, saving: false }));
    }
  };

  // 章节删除二次确认
  const [chapterDeleteConfirm, setChapterDeleteConfirm] = useState<{ open: boolean; index?: number }>({ open: false });

  const SortableChapterRow: React.FC<{ item: ChapterDTO; index: number }> = ({ item, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
    return (
      <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-2 border rounded-md ${isDragging ? 'shadow ring-2 ring-primary' : ''}`}>
        <button type="button" {...attributes} {...listeners} className="h-8 w-8 inline-flex items-center justify-center rounded-md border cursor-grab active:cursor-grabbing" aria-label="拖拽排序">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{item.title}</div>
          <div className="text-xs text-muted-foreground">阅读时长：{ChaptersService.formatReadingTime(item.readingTime || 0)} · 排序：{item.sortOrder}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openChapterEdit(index)}>编辑</Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => setChapterDeleteConfirm({ open: true, index })}
          >
            删除
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 单卡片：筛选 + 操作 + 表格 + 分页 */}
      <Card>
        <CardContent className="pt-6">
          {/* 筛选行：placeholder，无标签 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3 min-w-0">
            <Input placeholder="按标题/描述搜索" value={filters.keyword} onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))} />
            <Select value={filters.status || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : (v as CourseStatus) }))}>
              <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="PENDING">待更新</SelectItem>
                <SelectItem value="IN_PROGRESS">更新中</SelectItem>
                <SelectItem value="COMPLETED">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* 操作按钮行：左新建，右重置/刷新/查询 */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> 新建课程</Button>
            </div>
            <div className="flex items-center gap-2">
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
          </div>

          {/* 列表 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[280px]">标题/描述</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[80px]">评分</TableHead>
                  <TableHead className="min-w-[90px]">排序</TableHead>
                  <TableHead className="min-w-[120px]">价格</TableHead>
                  <TableHead className="min-w-[120px]">标签</TableHead>
                  <TableHead className="min-w-[140px]">总阅读时长</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="text-right min-w-[260px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium line-clamp-1" title={item.title}>{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1" title={item.description}>{item.description}</div>
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(item.status)}</TableCell>
                      <TableCell>{item.rating ?? '-'}</TableCell>
                      <TableCell>{item.sortOrder ?? '-'}</TableCell>
                      <TableCell>
                        {item.price != null ? `¥${item.price}` : '-'}
                        {item.originalPrice != null && item.originalPrice !== item.price && (
                          <span className="ml-1 text-xs text-muted-foreground line-through">¥{item.originalPrice}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{(item.tags || []).join('、') || '-'}</TableCell>
                      <TableCell>{CoursesService.formatReadingTime(item.totalReadingTime)}</TableCell>
                      <TableCell className="text-xs">{new Date(item.createTime).toLocaleString('zh-CN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4 mr-2" /> 编辑</Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => confirmDelete(item)}><Trash2 className="w-4 h-4 mr-2" /> 删除</Button>
                          <Button variant="outline" size="sm" onClick={() => openChapters(item)}>章节管理</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页：统计始终可见；多页时显示按钮 */}
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">共 {pagination.total} 条，第 {Math.max(pagination.current, 1)} / {Math.max(pagination.pages, 1)} 页</div>
              {pagination.pages > 1 && (
                <AdminPagination
                  current={pagination.current}
                  totalPages={pagination.pages}
                  onChange={(p) => { handlePageChange(p); loadCourses(p, pagination.size); }}
                  mode="full"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>删除后不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 创建/编辑对话框 */}
      <Dialog open={editDialog.open} onOpenChange={(open) => {
        if (!editDialog.submitting) {
          setEditDialog(prev => ({ ...prev, open }));
          if (!open) setEditDialog({ open: false, mode: 'create', submitting: false, form: { title: '', description: '', status: '' as CourseStatus | '', price: '', originalPrice: '', rating: 0, tags: [], techStack: [], sortOrder: '' } });
        }
      }}>
        <DialogContent
          className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-5xl"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editDialog.mode === 'create' ? '新建课程' : '编辑课程'}</DialogTitle>
            <DialogDescription>填写课程基础信息（更多高级字段后续在详情中维护）</DialogDescription>
          </DialogHeader>
          {/* 左右两栏布局：左侧基础信息，右侧封面+描述 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：基础字段 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={editDialog.form.title}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, title: e.target.value } }))}
                  placeholder="课程标题"
                />
              </div>

              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={editDialog.form.status}
                  onValueChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, status: v as CourseStatus } }))}
                >
                  <SelectTrigger><SelectValue placeholder="选择状态" /></SelectTrigger>
                  <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                    <SelectItem value="PENDING">待更新</SelectItem>
                    <SelectItem value="IN_PROGRESS">更新中</SelectItem>
                    <SelectItem value="COMPLETED">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>排序值</Label>
                <Input
                  type="number"
                  min={0}
                  value={editDialog.form.sortOrder ?? ''}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, sortOrder: e.target.value } }))}
                  placeholder="越大越靠前（后端倒序）"
                />
              </div>

              <div className="space-y-2">
                <Label>价格（¥）</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={editDialog.form.price}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, price: e.target.value } }))}
                  placeholder="如 99.00"
                />
              </div>

              <div className="space-y-2">
                <Label>原价（¥，可选）</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={editDialog.form.originalPrice}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, originalPrice: e.target.value } }))}
                  placeholder="如 199.00"
                />
              </div>

              <div className="space-y-2">
                <Label>评分</Label>
                <Rating
                  value={editDialog.form.rating || 0}
                  onChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, rating: v } }))}
                />
              </div>

              <div className="space-y-2">
                <Label>技术栈</Label>
                <TagsInput
                  value={editDialog.form.techStack}
                  onChange={(techStack) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, techStack } }))}
                  placeholder="输入技术栈，回车或逗号添加"
                />
              </div>

              <div className="space-y-2">
                <Label>标签</Label>
                <TagsInput
                  value={editDialog.form.tags}
                  onChange={(tags) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, tags } }))}
                />
              </div>
            </div>

            {/* 右侧：封面 + 描述 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>封面图片</Label>
                <ImageUpload
                  value={editDialog.form.coverUrl || ''}
                  onChange={(url) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, coverUrl: url } }))}
                  onUploadSuccess={(rid) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, coverResourceId: rid } }))}
                  placeholder="上传课程封面（可选）"
                  showPreview
                  previewSize="md"
                />
              </div>

              <div className="space-y-2">
                <Label>描述（Markdown）</Label>
                <MarkdownEditor
                  ref={courseDescRef}
                  value={editDialog.form.description}
                  onChange={(v) => setEditDialog(prev => ({ ...prev, form: { ...prev.form, description: v } }))}
                  height={300}
                  onOpenResourcePicker={() => { setPickerTarget('course'); setShowResourcePicker(true); }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, mode: 'create', submitting: false, form: { title: '', description: '', status: '' as CourseStatus | '', price: '', originalPrice: '', rating: 0, tags: [], techStack: [], sortOrder: '' } })} disabled={editDialog.submitting}>取消</Button>
            <Button onClick={submitEdit} disabled={editDialog.submitting}>{editDialog.submitting ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 章节管理对话框 */}
      <Dialog open={chapterDialog.open} onOpenChange={(open) => {
        if (!chapterDialog.saving) {
          setChapterDialog(prev => ({ ...prev, open }));
          if (!open) setChapterDialog({ open: false, loading: false, saving: false, items: [] });
        }
      }}>
        <DialogContent
          className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-4xl max-h-[85vh] overflow-y-auto"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>章节管理 - {chapterDialog.course?.title}</DialogTitle>
            <DialogDescription>拖拽排序，新增/编辑/删除章节</DialogDescription>
          </DialogHeader>
          {chapterDialog.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">共 {chapterDialog.items.length} 个章节</div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openChapterEdit()}>新增章节</Button>
                  <Button onClick={saveChapterOrder} disabled={chapterDialog.saving}>保存排序</Button>
                </div>
              </div>
              <DndContext onDragEnd={onChapterDragEnd}>
                <SortableContext items={chapterDialog.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {chapterDialog.items.length === 0 ? (
                      <div className="text-sm text-muted-foreground">暂无章节</div>
                    ) : (
                      chapterDialog.items.map((ch, idx) => (
                        <SortableChapterRow key={ch.id} item={ch} index={idx} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              {chapterDialog.edit && (
                <div className="border rounded-md p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>标题</Label>
                      <Input
                        value={chapterDialog.edit.data.title}
                        onChange={(e) => setChapterDialog(prev => ({ ...prev, edit: prev.edit && { ...prev.edit, data: { ...prev.edit.data, title: e.target.value } } }))}
                        placeholder="章节标题"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>排序</Label>
                      <Input
                        type="number"
                        min={0}
                        value={chapterDialog.edit.data.sortOrder}
                        onChange={(e) => setChapterDialog(prev => ({ ...prev, edit: prev.edit && { ...prev.edit, data: { ...prev.edit.data, sortOrder: e.target.value } } }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>阅读时长（分钟，可留空自动估算）</Label>
                      <Input
                        type="number"
                        min={0}
                        value={chapterDialog.edit.data.readingTime || ''}
                        onChange={(e) => setChapterDialog(prev => ({ ...prev, edit: prev.edit && { ...prev.edit, data: { ...prev.edit.data, readingTime: e.target.value } } }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>内容（Markdown）</Label>
                    <MarkdownEditor
                      ref={chapterEditorRef}
                      value={chapterDialog.edit.data.content}
                      onChange={(v) => setChapterDialog(prev => ({ ...prev, edit: prev.edit && { ...prev.edit, data: { ...prev.edit.data, content: v } } }))}
                      height={260}
                      onOpenResourcePicker={() => { setPickerTarget('chapter'); setShowResourcePicker(true); }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setChapterDialog(prev => ({ ...prev, edit: undefined }))}>取消</Button>
                    <Button onClick={submitChapterEdit} disabled={chapterDialog.saving}>{chapterDialog.saving ? '保存中...' : '保存'}</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 章节删除确认 */}
      <AlertDialog open={chapterDeleteConfirm.open} onOpenChange={(open) => setChapterDeleteConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除章节</AlertDialogTitle>
            <AlertDialogDescription>该操作为软删除，仍不可撤销，确认继续？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChapterDeleteConfirm({ open: false })}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (chapterDeleteConfirm.index !== undefined) await deleteChapter(chapterDeleteConfirm.index);
                setChapterDeleteConfirm({ open: false });
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ResourcePicker
        open={showResourcePicker}
        onClose={() => { setShowResourcePicker(false); setPickerTarget(null); }}
        onInsert={(snippet) => {
          if (pickerTarget === 'course') {
            courseDescRef.current?.insertMarkdown(snippet);
          }
          if (pickerTarget === 'chapter') {
            chapterEditorRef.current?.insertMarkdown(snippet);
          }
          setShowResourcePicker(false);
          setPickerTarget(null);
        }}
      />
    </div>
  );
};
