import React, { useState } from 'react';
import { Header } from '@shared/components/common/Header';
import { Hero } from '../components/Hero';
import { CourseGrid } from '@shared/components/business/CourseGrid';
import { PricingSection } from '@shared/components/business/PricingSection';
import { Testimonials } from '../components/Testimonials';
import { AuthModal } from '@shared/components/business/AuthModal';
import { PaymentModal } from '@shared/components/business/PaymentModal';
import { TermsModal, PrivacyModal } from '@shared/components/common/LegalModals';
import { ContactUsDialog } from '@shared/components/common/ContactUsDialog';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';

export const MarketingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
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
        <CourseGrid onAuthRequired={handleAuthRequired} />
        <PricingSection
          onPlanSelect={() => setIsPaymentOpen(true)}
          onServiceCtaClick={() => setIsContactOpen(true)}
        />
        <Testimonials showAvatar={false} />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
                <h3 className="text-2xl font-bold">敲鸭</h3>
              </div>
              <p className="text-gray-400 mb-4">
                通过优质课程和专家指导赋能全球专业人士。
              </p>
              <div className="flex space-x-4 text-sm text-gray-400">
                <span>© {year} 敲鸭社区 版权所有</span>
              </div>
              <div className="mt-3 text-sm">
                <a
                  href="https://beian.mps.gov.cn/#/query/webSearch?code=42088102000211"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <img
                    src="/icp.png"
                    alt="公安备案图标"
                    className="h-4 w-4 mr-2"
                    onError={(e) => {
                      // 如图标不存在则隐藏，仅显示文字链接
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  鄂公网安备42088102000211
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">平台</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#courses" className="hover:text-white transition-colors">课程</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">会员与服务</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">案例</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    联系我们
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">条款</button>
                </li>
                <li>
                  <button type="button" onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors">隐私</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <ContactUsDialog open={isContactOpen} onOpenChange={setIsContactOpen} />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <PaymentModal open={isPaymentOpen} onOpenChange={setIsPaymentOpen} />
      <TermsModal open={isTermsOpen} onOpenChange={setIsTermsOpen} />
      <PrivacyModal open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
    </div>
  );
};
