import React, { useState } from 'react';
import { Header } from '@shared/components/common/Header';
import { Hero } from '../components/Hero';
import { CourseGrid } from '@shared/components/business/CourseGrid';
import { PricingSection } from '@shared/components/business/PricingSection';
import { Testimonials } from '../components/Testimonials';
import { AuthModal } from '@shared/components/business/AuthModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle2, MessageSquare, PlayCircle } from 'lucide-react';
import { PaymentModal } from '@shared/components/business/PaymentModal';

export const MarketingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const year = new Date().getFullYear();

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main>
        <Hero />
        <CourseGrid onAuthRequired={handleAuthRequired} />
        <PricingSection onPlanSelect={() => setIsPaymentOpen(true)} />
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
                <li><a href="#" className="hover:text-white transition-colors">课程</a></li>
                <li><a href="#" className="hover:text-white transition-colors">价格</a></li>
                <li><a href="#" className="hover:text-white transition-colors">案例</a></li>
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
                <li><a href="#" className="hover:text-white transition-colors">条款</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* 联系我们弹窗 */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                联系敲鸭
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 mt-1">选择你更常用的联系渠道</p>
          </div>

          <div className="p-6 space-y-4">
            <a
              href="https://space.bilibili.com/152686439"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-blue-200/60 bg-white hover:shadow-md transition-shadow p-4 group"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                  <PlayCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">B站主页</div>
                  <div className="text-xs text-gray-500 break-all">https://space.bilibili.com/152686439</div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </a>

            <div className="rounded-lg border border-emerald-200/60 bg-white p-4">
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <MessageSquare className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="font-medium text-gray-900">微信</div>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 rounded-md px-3 py-2">
                <code className="font-mono text-emerald-700 select-all">xhyQAQ250</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('xhyQAQ250');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      // ignore
                    }
                  }}
                  className="h-8 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> 复制
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">复制微信号后，在微信中搜索添加。</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <PaymentModal open={isPaymentOpen} onOpenChange={setIsPaymentOpen} />
    </div>
  );
};
