import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Hero } from './components/home/Hero';
import { Features } from './components/home/Features';
import { CourseGrid } from './components/courses/CourseGrid';
import { PricingSection } from './components/pricing/PricingSection';
import { Testimonials } from './components/home/Testimonials';
import { CTA } from './components/home/CTA';
import { AuthModal } from './components/auth/AuthModal';
import { Dashboard } from './components/dashboard/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // Otherwise show landing page
  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main>
        <Hero onGetStarted={handleAuthRequired} />
        <Features />
        <CourseGrid onAuthRequired={handleAuthRequired} />
        <PricingSection onPlanSelect={handleAuthRequired} />
        <Testimonials />
        <CTA onGetStarted={handleAuthRequired} />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <h3 className="text-2xl font-bold">EduElite</h3>
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
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;