import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewQuestionEditor } from './InterviewQuestionEditor';

export const CreateInterviewQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <InterviewQuestionEditor onSubmitted={() => navigate('/dashboard/user-backend/interviews')} />
  );
};

export default CreateInterviewQuestionPage;

