import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, Github, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPagination from '@shared/components/AdminPagination';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { SkillsService } from '@shared/services/api/skills.service';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { ROUTES } from '@shared/routes/routes';
import { showToast } from '@shared/utils/toast';
import type { CreateSkillRequest, PageResponse, SkillDTO, UpdateSkillRequest } from '@shared/types';

const DEFAULT_PAGE_SIZE = 10;
const GITHUB_URL_PATTERN = /^https:\/\/(www\.)?github\.com\/.+$/;

const EMPTY_FORM: CreateSkillRequest = {
  name: '',
  summary: '',
  description: '',
  githubUrl: '',
};

export const SkillsManagementPage: React.FC = () => {
  useDocumentTitle('Skills 管理');

  const location = useLocation();
  const navigate = useNavigate();
  const [pageInfo, setPageInfo] = useState<PageResponse<SkillDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SkillDTO | null>(null);
  const [formData, setFormData] = useState<CreateSkillRequest>(EMPTY_FORM);

  const records = pageInfo?.records ?? [];
  const total = pageInfo?.total ?? 0;

  const loadSkills = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await SkillsService.getMySkills({
        pageNum: page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setPageInfo(response);
      setCurrentPage(response.current);
    } catch (error) {
      console.error('加载我的 skills 失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSkills(1);
  }, [loadSkills]);

  const dialogTitle = useMemo(() => editingSkill ? '编辑 Skill' : '创建 Skill', [editingSkill]);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setEditingSkill(null);
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  useEffect(() => {
    const action = new URLSearchParams(location.search).get('action');
    if (action !== 'create') {
      return;
    }

    openCreateDialog();
    navigate(ROUTES.USER_BACKEND_SKILLS, { replace: true });
  }, [location.search, navigate, openCreateDialog]);

  const openEditDialog = (skill: SkillDTO) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      summary: skill.summary,
      description: skill.description,
      githubUrl: skill.githubUrl,
    });
    setDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast.error('请输入 Skill 名称');
      return false;
    }
    if (!formData.summary.trim()) {
      showToast.error('请输入 Skill 简介');
      return false;
    }
    if (!formData.description.trim()) {
      showToast.error('请输入 Skill 描述');
      return false;
    }
    if (!GITHUB_URL_PATTERN.test(formData.githubUrl.trim())) {
      showToast.error('请输入有效的 GitHub 链接');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload: UpdateSkillRequest = {
        name: formData.name.trim(),
        summary: formData.summary.trim(),
        description: formData.description.trim(),
        githubUrl: formData.githubUrl.trim(),
      };

      if (editingSkill) {
        await SkillsService.updateSkill(editingSkill.id, payload);
      } else {
        await SkillsService.createSkill(payload);
      }

      setDialogOpen(false);
      resetForm();
      await loadSkills(editingSkill ? currentPage : 1);
    } catch (error) {
      console.error('保存 skill 失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await SkillsService.deleteSkill(deleteTarget.id);
      setDeleteTarget(null);
      await loadSkills(currentPage);
    } catch (error) {
      console.error('删除 skill 失败:', error);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills 管理</h1>
          <p className="mt-1 text-gray-600">管理你上传到社区市场里的所有 skills。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadSkills(currentPage)} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            创建 Skill
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="text-sm text-warm-gray-600">共 {total} 条记录</div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">名称 / 简介</TableHead>
                  <TableHead className="min-w-[320px]">描述</TableHead>
                  <TableHead className="min-w-[220px]">GitHub</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[160px]">更新时间</TableHead>
                  <TableHead className="text-right min-w-[180px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">加载中...</TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">你还没有上传任何 Skill</TableCell>
                  </TableRow>
                ) : (
                  records.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{skill.summary}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        <div className="line-clamp-4 whitespace-pre-wrap">{skill.description}</div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={skill.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-sm text-honey-700 hover:text-honey-800"
                        >
                          <Github className="mr-2 h-4 w-4" />
                          <span className="line-clamp-1 break-all">{skill.githubUrl}</span>
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </a>
                      </TableCell>
                      <TableCell>{new Date(skill.createTime).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>{new Date(skill.updateTime).toLocaleString('zh-CN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(skill)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleteTarget(skill)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pageInfo && pageInfo.pages > 1 && (
            <AdminPagination
              current={pageInfo.current}
              totalPages={pageInfo.pages}
              total={pageInfo.total}
              onChange={(page) => { void loadSkills(page); }}
              mode="full"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">名称</Label>
              <Input
                id="skill-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：React 组件库模板"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-summary">简介</Label>
              <Input
                id="skill-summary"
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="一句话说明这个 skill 的用途"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-description">描述</Label>
              <MarkdownEditor
                value={formData.description}
                onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                placeholder="补充更详细的能力说明、适用场景和使用方式，支持 Markdown"
                height={300}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-github-url">GitHub URL</Label>
              <Input
                id="skill-github-url"
                value={formData.githubUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/owner/repo"
                maxLength={500}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                取消
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : editingSkill ? '保存修改' : '立即创建'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="删除 Skill"
        message={`确认删除「${deleteTarget?.name || ''}」吗？删除后会立刻从市场中移除。`}
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { void handleDelete(); }}
      />
    </div>
  );
};

export default SkillsManagementPage;
