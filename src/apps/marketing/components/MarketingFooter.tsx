import React from 'react';

interface MarketingFooterProps {
  year?: number;
  onContactClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
}

export const MarketingFooter: React.FC<MarketingFooterProps> = ({
  year = new Date().getFullYear(),
  onContactClick,
  onTermsClick,
  onPrivacyClick,
}) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
              <h3 className="text-2xl font-bold">敲鸭</h3>
            </div>
            <p className="text-gray-400 mb-4">
              面向新粉丝与长期学习者的技术社区，持续沉淀真实项目、课程与公开输出。
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
                    e.currentTarget.style.display = 'none';
                  }}
                />
                鄂公网安备42088102000211
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">导航</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/#courses" className="hover:text-white transition-colors">课程</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">关于我</a></li>
              <li><a href="/#pricing" className="hover:text-white transition-colors">会员与服务</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">支持</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={onContactClick}
                  className="hover:text-white transition-colors"
                >
                  联系我们
                </button>
              </li>
              <li>
                <button type="button" onClick={onTermsClick} className="hover:text-white transition-colors">条款</button>
              </li>
              <li>
                <button type="button" onClick={onPrivacyClick} className="hover:text-white transition-colors">隐私</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
