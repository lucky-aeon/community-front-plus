import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagsInput } from '@/components/ui/tags-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from '@shared/components/common/CategorySelect';
import { MarkdownEditor, type MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import type { InterviewQuestionDTO, UpdateInterviewQuestionRequest } from '@shared/types';
import { AdminInterviewQuestionsService } from '@shared/services/api';

interface AdminInterviewQuestionEditorProps {
  data: InterviewQuestionDTO;
  onClose: () => void;
  onSaved: (q: InterviewQuestionDTO) => void;
}

export const AdminInterviewQuestionEditor: React.FC<AdminInterviewQuestionEditorProps> = ({ data, onClose, onSaved }) => {
  const [title, setTitle] = useState(data.title);
  const [categoryId, setCategoryId] = useState(data.categoryId);
  const [rating, setRating] = useState<number>(data.rating || 3);
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [description, setDescription] = useState(data.description || '');
  const [answer, setAnswer] = useState(data.answer || '');
  const [submitting, setSubmitting] = useState(false);
  const descRef = useRef<MarkdownEditorHandle>(null);
  const ansRef = useRef<MarkdownEditorHandle>(null);

  useEffect(() => {
    setTitle(data.title || '');
    setCategoryId(data.categoryId || '');
    setRating(data.rating || 3);
    setTags(data.tags || []);
    setDescription(data.description || '');
    setAnswer(data.answer || '');
  }, [data.id]);

  const handleSave = async () => {
    if (!title.trim() || !categoryId) return;
    const payload: UpdateInterviewQuestionRequest = {
      title: title.trim(),
      description: description || '',
      answer: answer.trim(),
      rating: rating || 3,
      categoryId,
      tags: tags.map(t => t.trim()).filter(Boolean)
    };
    try {
      setSubmitting(true);
      const updated = await AdminInterviewQuestionsService.update(data.id, payload);
      onSaved(updated);
    } catch (e) {
      console.error('管理员更新题目失败:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>标题</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="题目标题" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <CategorySelect value={categoryId} onChange={setCategoryId} label="分类" placeholder="请选择题目分类" categoryType="INTERVIEW" required />
          </div>
          <div>
            <Label>难度</Label>
            <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
              <SelectTrigger className="h-10"><SelectValue placeholder="请选择难度" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>标签</Label>
          <TagsInput value={tags} onChange={setTags} placeholder="输入标签后回车添加" />
        </div>
        <div className="space-y-2">
          <Label>题目描述</Label>
          <MarkdownEditor ref={descRef} value={description} onChange={setDescription} placeholder="支持 Markdown" />
        </div>
        <div className="space-y-2">
          <Label>参考答案</Label>
          <MarkdownEditor ref={ansRef} value={answer} onChange={setAnswer} placeholder="支持 Markdown" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>取消</Button>
          <Button onClick={handleSave} disabled={submitting}>保存</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminInterviewQuestionEditor;
