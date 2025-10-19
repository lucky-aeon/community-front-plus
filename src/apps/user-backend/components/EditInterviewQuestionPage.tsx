import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InterviewQuestionEditor } from './InterviewQuestionEditor';
import { InterviewQuestionsService } from '@shared/services/api';
import type { InterviewQuestionDTO } from '@shared/types';

export const EditInterviewQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<InterviewQuestionDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) { navigate('/dashboard/user-backend/interviews'); return; }
      try {
        setLoading(true);
        const d = await InterviewQuestionsService.getById(id);
        if (!cancelled) setData(d);
      } catch (e) {
        console.error('加载题目失败:', e);
        navigate('/dashboard/user-backend/interviews');
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
    <InterviewQuestionEditor initialData={data} onSubmitted={() => navigate('/dashboard/user-backend/interviews')} />
  );
};

export default EditInterviewQuestionPage;

