import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { showToast } from '@shared/utils/toast';
import { SystemConfigService } from '@shared/services/api/system-config.service';
import type { CreatorAboutPageConfigData, CreatorAboutProjectConfigData, SystemConfigDTO } from '@shared/types';

const createProjectDraft = (): CreatorAboutProjectConfigData => ({
  name: '',
  description: '',
  githubUrl: '',
});

const trim = (value: string): string => value.trim();

export const CreatorAboutPageConfigCard: React.FC = () => {
  const [form, setForm] = useState<CreatorAboutPageConfigData>({
    displayName: '',
    introduction: '',
    bilibiliUrl: '',
    githubProfileUrl: '',
    projects: [createProjectDraft()],
  });
  const [initialForm, setInitialForm] = useState<CreatorAboutPageConfigData>({
    displayName: '',
    introduction: '',
    bilibiliUrl: '',
    githubProfileUrl: '',
    projects: [createProjectDraft()],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm]);

  const normalize = useCallback((value: Partial<CreatorAboutPageConfigData> | undefined): CreatorAboutPageConfigData => {
    const projects = Array.isArray(value?.projects) && value?.projects.length > 0
      ? value.projects.map((project) => ({
        name: project?.name ?? '',
        description: project?.description ?? '',
        githubUrl: project?.githubUrl ?? '',
      }))
      : [createProjectDraft()];

    return {
      displayName: value?.displayName ?? '',
      introduction: value?.introduction ?? '',
      bilibiliUrl: value?.bilibiliUrl ?? '',
      githubProfileUrl: value?.githubProfileUrl ?? '',
      projects,
    };
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const cfg: SystemConfigDTO = await SystemConfigService.getCreatorAboutPageConfig();
      const next = normalize((cfg?.data as Partial<CreatorAboutPageConfigData> | undefined) ?? undefined);
      setForm(next);
      setInitialForm(next);
    } catch (error) {
      console.error('加载关于我页面配置失败', error);
      const fallback = normalize(undefined);
      setForm(fallback);
      setInitialForm(fallback);
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const updateProject = (index: number, patch: Partial<CreatorAboutProjectConfigData>) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((project, currentIndex) => (
        currentIndex === index ? { ...project, ...patch } : project
      )),
    }));
  };

  const moveProject = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.projects.length) {
        return prev;
      }
      const projects = [...prev.projects];
      [projects[index], projects[nextIndex]] = [projects[nextIndex], projects[index]];
      return { ...prev, projects };
    });
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, createProjectDraft()],
    }));
  };

  const removeProject = (index: number) => {
    setForm((prev) => {
      if (prev.projects.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        projects: prev.projects.filter((_, currentIndex) => currentIndex !== index),
      };
    });
  };

  const validateAndNormalize = (): CreatorAboutPageConfigData | null => {
    const payload: CreatorAboutPageConfigData = {
      displayName: trim(form.displayName),
      introduction: trim(form.introduction),
      bilibiliUrl: trim(form.bilibiliUrl),
      githubProfileUrl: trim(form.githubProfileUrl),
      projects: form.projects
        .map((project) => ({
          name: trim(project.name),
          description: trim(project.description),
          githubUrl: trim(project.githubUrl),
        }))
        .filter((project) => project.name || project.description || project.githubUrl),
    };

    if (!payload.displayName) return showToast.error('请输入名称'), null;
    if (!payload.introduction) return showToast.error('请输入个人介绍'), null;
    if (!payload.bilibiliUrl) return showToast.error('请输入 B 站链接'), null;
    if (!payload.githubProfileUrl) return showToast.error('请输入 GitHub 主页链接'), null;
    if (payload.projects.length === 0) return showToast.error('请至少配置一个项目'), null;

    for (let index = 0; index < payload.projects.length; index += 1) {
      const project = payload.projects[index];
      if (!project.name || !project.description || !project.githubUrl) {
        showToast.error(`第 ${index + 1} 个项目的字段未填写完整`);
        return null;
      }
    }

    return payload;
  };

  const handleSave = async () => {
    const payload = validateAndNormalize();
    if (!payload) return;

    try {
      setSaving(true);
      const response = await SystemConfigService.updateCreatorAboutPageConfig(payload);
      const next = normalize(response.data as CreatorAboutPageConfigData);
      setForm(next);
      setInitialForm(next);
    } catch (error) {
      console.error('保存关于我页面配置失败', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>关于我页面配置</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">管理公开“关于我”页面的基础信息和项目列表</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadConfig} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />刷新
          </Button>
          <Button variant="outline" onClick={addProject} disabled={saving}>
            <Plus className="mr-2 h-4 w-4" />新增项目
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || saving}>
            <Save className="mr-2 h-4 w-4" />保存配置
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>名称</Label>
            <Input
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="例如：Xhy"
            />
          </div>
          <div className="space-y-2">
            <Label>B 站链接</Label>
            <Input
              value={form.bilibiliUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, bilibiliUrl: e.target.value }))}
              placeholder="https://space.bilibili.com/..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>GitHub 主页链接</Label>
            <Input
              value={form.githubProfileUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, githubProfileUrl: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>个人介绍</Label>
            <Textarea
              value={form.introduction}
              onChange={(e) => setForm((prev) => ({ ...prev, introduction: e.target.value }))}
              placeholder="输入面对新粉丝的个人介绍"
              rows={6}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">项目列表</h3>
            <p className="text-sm text-muted-foreground mt-1">每个项目只配置名称、描述和 GitHub URL；Star 数由后端动态获取</p>
          </div>

          <div className="space-y-4">
            {form.projects.map((project, index) => (
              <div key={`${index}-${project.githubUrl}`} className="rounded-2xl border bg-muted/10 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">项目 {index + 1}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => moveProject(index, -1)} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveProject(index, 1)} disabled={index === form.projects.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    {form.projects.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeProject(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>项目名称</Label>
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(index, { name: e.target.value })}
                      placeholder="例如：qiaoya-community"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input
                      value={project.githubUrl}
                      onChange={(e) => updateProject(index, { githubUrl: e.target.value })}
                      placeholder="https://github.com/owner/repo"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>项目描述</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, { description: e.target.value })}
                      placeholder="输入项目描述"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
