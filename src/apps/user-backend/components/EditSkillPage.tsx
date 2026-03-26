import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SkillEditor } from './SkillEditor';
import { SkillsService } from '@shared/services/api';
import type { SkillDetailDTO } from '@shared/types';
import { ROUTES } from '@shared/routes/routes';

export const EditSkillPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SkillDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) {
        navigate(ROUTES.USER_BACKEND_SKILLS, { replace: true });
        return;
      }

      try {
        setLoading(true);
        const detail = await SkillsService.getMySkillById(id);
        if (!cancelled) {
          setData(detail);
        }
      } catch (error) {
        console.error('加载 Skill 失败:', error);
        if (!cancelled) {
          navigate(ROUTES.USER_BACKEND_SKILLS, { replace: true });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return <div className="p-6 text-gray-500">加载中...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-500">Skill 不存在</div>;
  }

  return <SkillEditor initialData={data} onSubmitted={() => navigate(ROUTES.USER_BACKEND_SKILLS)} />;
};

export default EditSkillPage;
