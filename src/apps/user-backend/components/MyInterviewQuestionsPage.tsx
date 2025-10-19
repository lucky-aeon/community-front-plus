import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminPagination from '@shared/components/AdminPagination';
import { InterviewQuestionsService } from '@shared/services/api';
import type { InterviewQuestionDTO, InterviewQuestionQueryRequest, InterviewProblemStatus, PageResponse } from '@shared/types';
import { Archive, Edit, Plus, RefreshCw, XCircle, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategorySelect } from '@shared/components/common/CategorySelect';
import { showToast } from '@shared/utils/toast';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';

export const MyInterviewQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<InterviewQuestionDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<{ current: number; size: number; total: number; pages: number }>({ current: 1, size: 10, total: 0, pages: 0 });
  const [status, setStatus] = useState<'all' | InterviewProblemStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; questionId: string | null }>({ isOpen: false, questionId: null });
  // 批量创建弹窗
  const [batchDialog, setBatchDialog] = useState<{ open: boolean; submitting: boolean; categoryId: string; titles: string[] }>({ open: false, submitting: false, categoryId: '', titles: [''] });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadMyQuestions = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params: InterviewQuestionQueryRequest = { pageNum: page, pageSize: pageInfo.size, status: status === 'all' ? undefined : status };
      const resp: PageResponse<InterviewQuestionDTO> = await InterviewQuestionsService.getMyQuestions(params);
      setList(resp.records);
      setPageInfo({ current: resp.current, size: resp.size, total: resp.total, pages: resp.pages });
    } catch (e) {
      console.error('获取我的面试题失败:', e);
    } finally {
      setIsLoading(false);
    }
  }, [pageInfo.size, status]);

  useEffect(() => { void loadMyQuestions(1); }, [status, loadMyQuestions]);

  const onChangeStatus = async (id: string, newStatus: InterviewProblemStatus) => {
    try {
      await InterviewQuestionsService.changeStatus(id, newStatus);
      await loadMyQuestions(pageInfo.current);
    } catch (e) {
      console.error('修改状态失败:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await InterviewQuestionsService.delete(id);
      await loadMyQuestions(pageInfo.current);
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  const statusOptions: Array<{ value: 'all' | InterviewProblemStatus; label: string }> = useMemo(() => ([
    { value: 'all', label: '全部状态' },
    { value: 'DRAFT', label: '草稿' },
    { value: 'PUBLISHED', label: '已发布' },
  ]), []);

  // 前端关键词过滤（标题/描述）
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return list;
    const kw = searchTerm.trim().toLowerCase();
    return list.filter(q => (q.title || '').toLowerCase().includes(kw) || (q.description || '').toLowerCase().includes(kw));
  }, [list, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的题库</h1>
          <p className="text-gray-600 mt-1">查看与管理你创建的面试题</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setBatchDialog({ open: true, submitting: false, categoryId: '', titles: [''] })} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>批量创建</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard/user-backend/interviews/create')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>创建题目</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* 筛选区 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 min-w-0">
            <Input placeholder="搜索标题/描述关键词" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={status} onValueChange={(v) => setStatus((v as 'all' | InterviewProblemStatus))}>
              <SelectTrigger><SelectValue placeholder="全部状态" /></SelectTrigger>
              <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                {statusOptions.map(opt => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatus('all'); void loadMyQuestions(1); }} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={() => void loadMyQuestions(1)} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
          </div>

          {/* 表格 */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[280px]">标题/描述</TableHead>
                  <TableHead className="min-w-[80px]">难度</TableHead>
                  <TableHead className="min-w-[90px]">状态</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[160px]">更新时间</TableHead>
                  <TableHead className="text-right min-w-[220px]">操作</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">加载中...</TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                </TableRow>
              ) : (
                filteredList.map(q => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <div className="font-medium line-clamp-1" title={q.title}>{q.title}</div>
                      {q.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1" title={q.description}>{q.description}</div>
                      )}
                      {q.tags && q.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {q.tags.map((t, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{q.rating ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={q.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {q.status === 'PUBLISHED' ? '已发布' : '草稿'}
                      </Badge>
                    </TableCell>
                    <TableCell>{q.createTime || '-'}</TableCell>
                    <TableCell>{q.updateTime || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/user-backend/interviews/edit/${q.id}`)} className="flex items-center space-x-1">
                          <Edit className="h-4 w-4" />
                          <span>编辑</span>
                        </Button>
                        {q.status === 'DRAFT' ? (
                          <Button size="sm" onClick={() => onChangeStatus(q.id, 'PUBLISHED')} className="flex items-center space-x-1 bg-green-600 hover:bg-green-700">
                            <Send className="h-4 w-4" />
                            <span>发布</span>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => onChangeStatus(q.id, 'DRAFT')} className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200">
                            <Archive className="h-4 w-4" />
                            <span>撤回</span>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ isOpen: true, questionId: q.id })} className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                          <Trash2 className="h-4 w-4" />
                          <span>删除</span>
                        </Button>
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
            current={pageInfo.current}
            totalPages={pageInfo.pages}
            total={pageInfo.total}
            onChange={(p) => { void loadMyQuestions(p); }}
            mode="full"
          />
        </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, questionId: null })}
        onConfirm={() => {
          if (deleteConfirm.questionId) {
            handleDelete(deleteConfirm.questionId);
            setDeleteConfirm({ isOpen: false, questionId: null });
          }
        }}
        title="确认删除面试题"
        message="删除后面试题将无法恢复，您确定要继续吗？"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
      />

      {/* 批量创建弹窗 */}
      <Dialog open={batchDialog.open} onOpenChange={(open) => setBatchDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量创建面试题</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择分类</Label>
              <CategorySelect
                value={batchDialog.categoryId}
                onChange={(v) => setBatchDialog(prev => ({ ...prev, categoryId: v }))}
                label=""
                placeholder="请选择题库分类"
                categoryType="INTERVIEW"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>题目标题（逐条添加，支持粘贴多行）</Label>
              <div className="text-xs text-muted-foreground">在最后一行按 Enter 可自动新增一行</div>
              <div className="space-y-2">
                {batchDialog.titles.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      ref={(el) => (inputRefs.current[idx] = el)}
                      value={t}
                      placeholder={`标题 ${idx + 1}`}
                      onChange={(e) => setBatchDialog(prev => { const next = [...prev.titles]; next[idx] = e.target.value; return { ...prev, titles: next }; })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && idx === batchDialog.titles.length - 1) {
                          e.preventDefault();
                          setBatchDialog(prev => ({ ...prev, titles: [...prev.titles, ''] }));
                          // 聚焦到新添加的输入框
                          setTimeout(() => {
                            const nextIdx = batchDialog.titles.length;
                            inputRefs.current[nextIdx]?.focus();
                          }, 0);
                        }
                      }}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData('text');
                        if (text && text.includes('\n')) {
                          e.preventDefault();
                          const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                          setBatchDialog(prev => {
                            const next = [...prev.titles];
                            next[idx] = lines[0] || '';
                            const rest = lines.slice(1);
                            return { ...prev, titles: [...next, ...rest, ''].slice(0, 201) }; // 预留1个空行
                          });
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => setBatchDialog(prev => ({ ...prev, titles: prev.titles.filter((_, i) => i !== idx) }))} disabled={batchDialog.titles.length <= 1}>删除</Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <Button variant="secondary" size="sm" onClick={() => {
                  setBatchDialog(prev => ({ ...prev, titles: [...prev.titles, ''] }));
                  // 聚焦到新添加的输入框
                  setTimeout(() => {
                    const nextIdx = batchDialog.titles.length;
                    inputRefs.current[nextIdx]?.focus();
                  }, 0);
                }}>新增一行</Button>
                <div className="text-xs text-muted-foreground">最多 200 条，空行自动忽略；最后一行按 Enter 可新增一行</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setBatchDialog(prev => ({ ...prev, open: false }))} disabled={batchDialog.submitting}>取消</Button>
              <Button onClick={async () => {
                // 本地校验
                const raw = batchDialog.titles.map(s => s.trim()).filter(Boolean);
                const titles = Array.from(new Set(raw)).slice(0, 200);
                if (!batchDialog.categoryId) { showToast.error('请选择分类'); return; }
                if (titles.length === 0) { showToast.error('请输入至少一个标题'); return; }
                try {
                  setBatchDialog(prev => ({ ...prev, submitting: true }));
                  await InterviewQuestionsService.batchCreate({ categoryId: batchDialog.categoryId, titles });
                  setBatchDialog({ open: false, submitting: false, categoryId: '', titles: [''] });
                  await loadMyQuestions(1);
                } catch (e) {
                  console.error('批量创建失败:', e);
                } finally {
                  setBatchDialog(prev => ({ ...prev, submitting: false }));
                }
              }} disabled={batchDialog.submitting}>提交</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyInterviewQuestionsPage;
