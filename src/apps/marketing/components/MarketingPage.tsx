import React, { useState } from 'react';
import { Header } from '@shared/components/common/Header';
import { Hero } from '../components/Hero';
import { CommunityNotice } from './CommunityNotice';
import { CourseGrid } from '@shared/components/business/CourseGrid';
import { Testimonials } from '../components/Testimonials';
import { AuthModal } from '@shared/components/business/AuthModal';
import { TermsModal, PrivacyModal } from '@shared/components/common/LegalModals';
import { ContactUsDialog } from '@shared/components/common/ContactUsDialog';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { MarketingFooter } from './MarketingFooter';

export const MarketingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const year = new Date().getFullYear();

  // 页面标题
  useDocumentTitle('首页');

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main>
        <Hero />
        <CommunityNotice />
        <CourseGrid onAuthRequired={handleAuthRequired} />
        <Testimonials showAvatar={false} />
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
