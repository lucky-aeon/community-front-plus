import React, { useState } from 'react';
import { Header } from '@shared/components/common/Header';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { AuthModal } from '@shared/components/business/AuthModal';
import { ContactUsDialog } from '@shared/components/common/ContactUsDialog';
import { TermsModal, PrivacyModal } from '@shared/components/common/LegalModals';
import { MarketingFooter } from './MarketingFooter';
import { MobileDownloadSection } from './MobileDownloadSection';

export const MobileDownloadPage: React.FC = () => {
  useDocumentTitle('移动端下载');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#fff8ed]">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      <main>
        <MobileDownloadSection />
      </main>
      <MarketingFooter
        year={year}
        onContactClick={() => setIsContactOpen(true)}
        onTermsClick={() => setIsTermsOpen(true)}
        onPrivacyClick={() => setIsPrivacyOpen(true)}
      />
      <ContactUsDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <TermsModal open={isTermsOpen} onOpenChange={setIsTermsOpen} />
      <PrivacyModal open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
    </div>
  );
};
