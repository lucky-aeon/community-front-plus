import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@shared/components/common/Header';
import { SkillsMarketContent } from './SkillsMarketContent';
import { ROUTES } from '@shared/routes/routes';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

export const PublicSkillsPage: React.FC = () => {
  const navigate = useNavigate();

  useDocumentTitle('Skills 市场');

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-honey-50/60">
      <Header onAuthClick={() => navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.SKILLS)}`)} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SkillsMarketContent
          title="Skills 市场"
          showRefreshButton={false}
          showUploadButton={false}
          showEmptyStateUploadCta={false}
          emptyStateDescription="第一批 skill 还在路上，稍后再来看看社区最新收录的内容。"
        />
      </main>
    </div>
  );
};

export default PublicSkillsPage;
