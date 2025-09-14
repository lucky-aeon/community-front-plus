import React, { useState } from 'react';
import { Header } from '@shared/components/common/Header';
import { Hero } from '../components/Hero';
import { CourseGrid } from '@shared/components/business/CourseGrid';
import { PricingSection } from '@shared/components/business/PricingSection';
import { Testimonials } from '../components/Testimonials';
import { AuthModal } from '@shared/components/business/AuthModal';

export const MarketingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main>
        <Hero onGetStarted={handleAuthRequired} />
        <CourseGrid onAuthRequired={handleAuthRequired} />
        <PricingSection onPlanSelect={handleAuthRequired} />
        <Testimonials />
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
                Empowering professionals worldwide with premium courses and expert mentorship.
              </p>
              <div className="flex space-x-4 text-sm text-gray-400">
                <span>© 2025 EduElite. All rights reserved.</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};