import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setDocumentTitle } from '@shared/hooks/useDocumentTitle';

// 基于路由的默认标题映射；详情页由各自页面在数据加载后覆盖
const routeTitleMap: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/$/, title: '首页' },
  { pattern: /^\/login$/, title: '登录' },
  { pattern: /^\/dashboard\/home$/, title: '社区首页' },
  { pattern: /^\/dashboard\/discussions$/, title: '讨论广场' },
  { pattern: /^\/dashboard\/courses$/, title: '课程' },
  { pattern: /^\/dashboard\/changelog$/, title: '更新日志' },
  { pattern: /^\/dashboard\/membership$/, title: '会员中心' },
  { pattern: /^\/dashboard\/ai-news(?:$|\/daily\/[^/]+$)/, title: 'AI 日报' },
  { pattern: /^\/dashboard\/ai-news\/[^/]+$/, title: 'AI 日报详情' },
  { pattern: /^\/dashboard\/interviews$/, title: '面试题库' },
  { pattern: /^\/dashboard\/interviews\/[^/]+$/, title: '题目详情' },
  { pattern: /^\/dashboard\/chat$/, title: '聊天室' },
  { pattern: /^\/dashboard\/courses\/[^/]+$/, title: '课程详情' },
  { pattern: /^\/dashboard\/courses\/[^/]+\/chapters\/[^/]+$/, title: '课程章节' },
  { pattern: /^\/dashboard\/admin\//, title: '管理后台' },
  { pattern: /^\/oauth2\/authorize$/, title: '第三方应用授权' },
];

export function TitleSetter() {
  const { pathname } = useLocation();

  useEffect(() => {
    const found = routeTitleMap.find((r) => r.pattern.test(pathname));
    setDocumentTitle(found?.title);
  }, [pathname]);

  return null;
}

export default TitleSetter;
