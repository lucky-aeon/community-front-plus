import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillEditor } from './SkillEditor';
import { ROUTES } from '@shared/routes/routes';

export const CreateSkillPage: React.FC = () => {
  const navigate = useNavigate();

  return <SkillEditor onSubmitted={() => navigate(ROUTES.USER_BACKEND_SKILLS)} />;
};

export default CreateSkillPage;
