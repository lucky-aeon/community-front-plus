import React from 'react';
import { PageContainer } from '@shared/components/layout/PageContainer';
import { SkillsMarketContent } from './SkillsMarketContent';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

export const DashboardSkillsPage: React.FC = () => {
  useDocumentTitle('Skills 市场');

  return (
    <PageContainer className="space-y-6">
      <SkillsMarketContent
        title="Skills 市场"
        compact
        headerVariant="dashboard"
        showRefreshButton={false}
        showUploadButton={false}
        emptyStateDescription="第一批 skill 还在路上，准备好后就会出现在这里。"
      />
    </PageContainer>
  );
};

export default DashboardSkillsPage;
