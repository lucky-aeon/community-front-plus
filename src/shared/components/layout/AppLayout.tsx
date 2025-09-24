import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from '@shared/components/ui/TopNavigation';
import { cn } from '@shared/utils/cn';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-honey-50/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      {/* Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <main className="relative">
        <div className="w-full">
          {children || <Outlet />}
        </div>
      </main>

      {/* Floating Elements */}
      <div className="fixed bottom-8 right-8 z-30">
        {/* Back to Top Button */}
        {isScrolled && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn(
              "p-3 rounded-full shadow-lg transition-all duration-300",
              "bg-honey-500 hover:bg-honey-600 text-white",
              "hover:scale-110 hover:shadow-xl",
              "animate-fade-in"
            )}
            title="回到顶部"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
