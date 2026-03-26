import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, Plus, RefreshCw, Search, Trash2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPagination from '@shared/components/AdminPagination';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { SkillsService } from '@shared/services/api';
import type { PageResponse, SkillListDTO } from '@shared/types';
import { ROUTES } from '@shared/routes/routes';

type DeleteConfirmState = {
  isOpen: boolean;
  skillId: string | null;
};

const PAGE_SIZE = 10;

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN');
};

export const MySkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillListDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<{ current: number; size: number; total: number; pages: number }>({
    current: 1,
    size: PAGE_SIZE,
    total: 0,
    pages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ isOpen: false, skillId: null });

  const fetchSkills = useCallback(async (page: number = currentPage, kw: string = keyword) => {
    try {
      setIsLoading(true);
      const response: PageResponse<SkillListDTO> = await SkillsService.getMySkills({
        pageNum: page,
        pageSize: PAGE_SIZE,
        keyword: kw || undefined,
      });
      setSkills(response.records || []);
      setPageInfo({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages,
      });
      setCurrentPage(response.current);
    } catch (error) {
      console.error('获取我的 Skills 失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, keyword]);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  const handleSearch = () => {
    setCurrentPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleReset = () => {
    setKeywordInput('');
    setKeyword('');
    setCurrentPage(1);
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await SkillsService.deleteSkill(skillId);
      await fetchSkills(currentPage, keyword);
    } catch (error) {
      console.error('删除 Skill 失败:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的 Skills</h1>
          <p className="text-gray-600 mt-1">管理你创建并发布的 Skills 内容</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center space-x-2"
          onClick={() => navigate(ROUTES.USER_BACKEND_SKILLS_CREATE)}
        >
          <Plus className="h-4 w-4" />
          <span>创建 Skill</span>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 min-w-0">
            <div className="relative">
              <Input
                placeholder="搜索名称/简介关键词"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" /> 重置
            </Button>
            <Button variant="outline" onClick={() => void fetchSkills(currentPage, keyword)} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> 刷新
            </Button>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" /> 查询
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[280px]">名称/简介</TableHead>
                  <TableHead className="min-w-[260px]">GitHub URL</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[160px]">更新时间</TableHead>
                  <TableHead className="text-right min-w-[200px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">加载中...</TableCell>
                  </TableRow>
                ) : skills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="mx-auto max-w-sm space-y-4">
                        <div className="text-lg font-medium text-gray-900">
                          {keyword ? '暂无匹配结果' : '暂无 Skills'}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {keyword ? '试试更换关键词，或者直接创建一个新的 Skill。' : '先创建一个 Skill，开始展示你的能力与作品。'}
                        </p>
                        <Button onClick={() => navigate(ROUTES.USER_BACKEND_SKILLS_CREATE)}>
                          <Plus className="mr-2 h-4 w-4" />
                          创建 Skill
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  skills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <div className="max-w-[520px]">
                          <div className="font-medium text-gray-900 line-clamp-1" title={skill.name}>
                            {skill.name}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1" title={skill.summary}>
                            {skill.summary}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {skill.githubUrl ? (
                          <a
                            href={skill.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-[320px] items-center gap-1 truncate text-blue-600 hover:text-blue-700"
                            title={skill.githubUrl}
                          >
                            <span className="truncate">{skill.githubUrl}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(skill.createTime)}</TableCell>
                      <TableCell>{formatDateTime(skill.updateTime)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(ROUTES.USER_BACKEND_SKILLS_EDIT.replace(':id', skill.id))}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>编辑</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm({ isOpen: true, skillId: skill.id })}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
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
              onChange={(page) => setCurrentPage(page)}
              mode="full"
              alwaysShow
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, skillId: null })}
        onConfirm={() => {
          if (deleteConfirm.skillId) {
            void handleDeleteSkill(deleteConfirm.skillId);
            setDeleteConfirm({ isOpen: false, skillId: null });
          }
        }}
        title="确认删除 Skill"
        message="删除后该 Skill 将无法恢复，您确定要继续吗？"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  );
};

export default MySkillsPage;
