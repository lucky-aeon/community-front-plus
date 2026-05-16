import React from 'react';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { MobileDownloadSection } from './MobileDownloadSection';

export const MobileDownloadPage: React.FC = () => {
  useDocumentTitle('移动端下载');

  return (
    <div className="min-h-screen bg-[#fff8ed]">
      <main>
        <MobileDownloadSection />
      </main>
    </div>
  );
};
