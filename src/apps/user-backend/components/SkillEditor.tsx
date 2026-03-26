import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { showToast } from '@shared/utils/toast';
import { SkillsService } from '@shared/services/api';
import type { CreateSkillRequest, SkillDetailDTO, UpdateSkillRequest } from '@shared/types';

interface SkillEditorProps {
  initialData?: SkillDetailDTO | null;
  onSubmitted: () => void;
}

const isGithubUrl = (value: string) => {
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLowerCase();
    return host === 'github.com' || host.endsWith('.github.com');
  } catch {
    return false;
  }
};

export const SkillEditor: React.FC<SkillEditorProps> = ({ initialData, onSubmitted }) => {
  const isEditMode = Boolean(initialData);
  const [name, setName] = useState(initialData?.name ?? '');
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(initialData?.name ?? '');
    setSummary(initialData?.summary ?? '');
    setGithubUrl(initialData?.githubUrl ?? '');
    setDescription(initialData?.description ?? '');
  }, [initialData]);

  const validate = () => {
    if (!name.trim()) {
      showToast.error('请输入名称');
      return false;
    }
    if (!summary.trim()) {
      showToast.error('请输入简介');
      return false;
    }
    if (!description.trim()) {
      showToast.error('请输入描述');
      return false;
    }
    if (!githubUrl.trim()) {
      showToast.error('请输入 GitHub URL');
      return false;
    }
    if (!isGithubUrl(githubUrl)) {
      showToast.error('GitHub URL 必须是 github.com 域名');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateSkillRequest | UpdateSkillRequest = {
      name: name.trim(),
      summary: summary.trim(),
      description: description.trim(),
      githubUrl: githubUrl.trim(),
    };

    try {
      setIsSubmitting(true);
      if (isEditMode && initialData) {
        await SkillsService.updateSkill(initialData.id, payload);
      } else {
        await SkillsService.createSkill(payload);
      }
      onSubmitted();
    } catch (error) {
      console.error('提交 Skill 失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? '编辑 Skill' : '创建 Skill'}</h1>
        <p className="text-gray-600 mt-1">完善名称、简介、GitHub 链接与详细描述后保存</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>名称</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入 Skill 名称"
          />
        </div>

        <div className="space-y-2">
          <Label>简介</Label>
          <Input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="请输入 Skill 简介"
          />
        </div>

        <div className="space-y-2">
          <Label>GitHub URL</Label>
          <Input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="space-y-2">
          <Label>描述</Label>
          <MarkdownEditor
            value={description}
            onChange={setDescription}
            placeholder="请输入 Skill 描述，支持 Markdown"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onSubmitted} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isEditMode ? '保存修改' : '创建 Skill'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SkillEditor;
