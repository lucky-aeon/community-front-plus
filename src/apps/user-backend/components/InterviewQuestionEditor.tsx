import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagsInput } from '@/components/ui/tags-input';
import { CategorySelect } from '@shared/components/common/CategorySelect';
import { MarkdownEditor, type MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { showToast } from '@shared/utils/toast';
import { InterviewQuestionsService } from '@shared/services/api';
import type { CreateInterviewQuestionRequest, InterviewQuestionDTO, UpdateInterviewQuestionRequest } from '@shared/types';

interface InterviewQuestionEditorProps {
  initialData?: InterviewQuestionDTO;
  onSubmitted: () => void;
}

export const InterviewQuestionEditor: React.FC<InterviewQuestionEditorProps> = ({ initialData, onSubmitted }) => {
  const isEditMode = !!initialData;

  const [title, setTitle] = useState(initialData?.title || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [rating] = useState<number>(initialData?.rating ?? 3);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [description, setDescription] = useState(initialData?.description || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descRef = useRef<MarkdownEditorHandle>(null);
  const answerRef = useRef<MarkdownEditorHandle>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategoryId(initialData.categoryId || '');
      setTags(initialData.tags || []);
      setDescription(initialData.description || '');
      setAnswer(initialData.answer || '');
    }
  }, [initialData?.id]);

  const validate = useCallback(() => {
    if (!title.trim()) { showToast.error('请输入标题'); return false; }
    if (!categoryId) { showToast.error('请选择分类'); return false; }
    // 难度默认 3，描述与答案均可为空
    return true;
  }, [title, categoryId]);

  const onSubmit = async () => {
    if (!validate()) return;
    const payload: CreateInterviewQuestionRequest | UpdateInterviewQuestionRequest = {
      title: title.trim(),
      description: description.trim(),
      answer: answer.trim(),
      rating: Number(rating) || 3,
      categoryId,
      tags: tags.map(t => t.trim()).filter(Boolean),
    };
    try {
      setIsSubmitting(true);
      if (isEditMode && initialData) {
        await InterviewQuestionsService.update(initialData.id, payload);
      } else {
        await InterviewQuestionsService.create(payload);
      }
      onSubmitted();
    } catch (e) {
      console.error('提交题目失败:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? '编辑题目' : '创建题目'}</h1>
        <p className="text-gray-600 mt-1">完善题目信息并保存</p>
      </div>

      <Card className="p-6 space-y-6">
        {/* 标题 */}
        <div className="space-y-2">
          <Label>标题</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入题目标题" />
        </div>

        {/* 分类 */}
        <div>
          <CategorySelect value={categoryId} onChange={setCategoryId} label="分类" placeholder="请选择题目分类" categoryType="INTERVIEW" required />
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <Label>标签</Label>
          <TagsInput value={tags} onChange={setTags} placeholder="输入标签后回车添加" />
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label>题目描述</Label>
          <MarkdownEditor ref={descRef} value={description} onChange={setDescription} placeholder="请输入题目描述，支持 Markdown" />
        </div>

        {/* 答案 */}
        <div className="space-y-2">
          <Label>参考答案</Label>
          <MarkdownEditor ref={answerRef} value={answer} onChange={setAnswer} placeholder="请输入参考答案，支持 Markdown" />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onSubmitted} disabled={isSubmitting}>取消</Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>{isEditMode ? '保存修改' : '创建题目'}</Button>
        </div>
      </Card>
    </div>
  );
};

export default InterviewQuestionEditor;
