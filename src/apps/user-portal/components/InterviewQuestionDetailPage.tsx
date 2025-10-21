import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Tag, Eye, MessageSquare, Heart } from 'lucide-react';
import { InterviewQuestionsService } from '@shared/services/api';
import type { InterviewQuestionDTO } from '@shared/types';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { LikeButton } from '@shared/components/ui/LikeButton';
import { useAuth } from '@/context/AuthContext';
import { Comments } from '@shared/components/ui/Comments';
import { FavoriteButton } from '@shared/components/business/FavoriteButton';

export const InterviewQuestionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<InterviewQuestionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) { navigate('/dashboard/interviews'); return; }
      try {
        setLoading(true);
        const d = await InterviewQuestionsService.getById(id);
        if (!cancelled) setData(d);
      } catch (e) {
        console.error('加载题目详情失败:', e);
        navigate('/dashboard/interviews');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500">加载中...</div>;
  }
  if (!data) {
    return <div className="p-6 text-red-500">题目不存在</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/interviews')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> 返回题库
        </Button>
        <div className="flex items-center gap-4 text-sm text-warm-gray-600">
          <span>难度 {data.rating}</span>
          <LikeButton
            businessType="INTERVIEW_QUESTION"
            businessId={data.id}
            initialCount={data.likeCount}
            onChange={(s) => setData(prev => prev ? { ...prev, likeCount: s.likeCount } : prev)}
          />
          <FavoriteButton
            targetId={data.id}
            targetType="INTERVIEW_QUESTION"
            variant="ghost"
            size="sm"
            showCount={true}
          />
          <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />{data.commentCount ?? 0}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{data.viewCount ?? 0}</span>
        </div>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h1>
        <div className="text-sm text-warm-gray-600 mb-2">
          {data.categoryName && <span className="mr-4">分类：{data.categoryName}</span>}
          {data.authorName && <span className="mr-4">作者：{data.authorName}</span>}
          {data.publishTime && <span>发布于 {data.publishTime}</span>}
        </div>
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {data.tags.map((t, i) => (
              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> {t}
              </Badge>
            ))}
          </div>
        )}

        {data.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">题目描述</h2>
            <div className="prose-content">
              <MarkdownEditor
                value={data.description}
                onChange={() => {}}
                previewOnly
                height="auto"
                toolbar={false}
                className="!border-none !shadow-none !bg-transparent"
                enableFullscreen={false}
                enableToc={false}
              />
            </div>
          </div>
        )}

        {data.answer && data.answer.trim() !== '' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">参考答案</h2>
            <div className="prose-content">
              <MarkdownEditor
                value={data.answer}
                onChange={() => {}}
                previewOnly
                height="auto"
                toolbar={false}
                className="!border-none !shadow-none !bg-transparent"
                enableFullscreen={false}
                enableToc={false}
              />
            </div>
          </div>
        )}
      </Card>

      {/* 评论区 */}
      <div className="mt-6">
        <Comments
          businessId={data.id}
          businessType="INTERVIEW_QUESTION"
          authorId={data.authorId}
          onCountChange={(n) => setData(prev => prev ? { ...prev, commentCount: n } : prev)}
        />
      </div>
    </div>
  );
};

export default InterviewQuestionDetailPage;
