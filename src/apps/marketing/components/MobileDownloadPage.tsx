import React from 'react';
import { Header } from '@shared/components/common/Header';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { MarketingFooter } from './MarketingFooter';
import { MobileDownloadSection } from './MobileDownloadSection';

export const MobileDownloadPage: React.FC = () => {
  useDocumentTitle('移动端下载');
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#fff8ed]">
      <Header onAuthClick={() => { window.location.href = '/login'; }} />
      <main className="pt-8">
        <MobileDownloadSection compact />
      </main>
      <MarketingFooter year={year} />
    </div>
  );
};
