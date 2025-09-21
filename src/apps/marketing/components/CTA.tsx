import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTAProps {
  onGetStarted: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Career?
        </h2>
        
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Join over 50,000 professionals who have already elevated their skills 
          and advanced their careers with our premium courses.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 group"
          >
            Start Learning Today
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4"
          >
            View All Courses
          </Button>
        </div>
        
        <div className="mt-12 flex justify-center space-x-8 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-bold">30-Day</div>
            <div className="text-sm">Money Back</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm">Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm">Online</div>
          </div>
        </div>
      </div>
    </section>
  );
};