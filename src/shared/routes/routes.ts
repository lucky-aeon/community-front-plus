// 路由常量定义
export const ROUTES = {
  // 公开路由
  HOME: '/',
  LOGIN: '/login',
  OAUTH2_AUTHORIZE: '/oauth2/authorize',

  // 用户门户路由
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/dashboard/home',
  DASHBOARD_DISCUSSIONS: '/dashboard/discussions',
  DASHBOARD_DISCUSSIONS_DETAIL: '/dashboard/discussions/:postId',
  DASHBOARD_COURSES: '/dashboard/courses',
  DASHBOARD_COURSES_DETAIL: '/dashboard/courses/:courseId',
  DASHBOARD_CHANGELOG: '/dashboard/changelog',
  DASHBOARD_AI_NEWS: '/dashboard/ai-news',
  DASHBOARD_AI_NEWS_DETAIL: '/dashboard/ai-news/:id',
  DASHBOARD_INTERVIEWS: '/dashboard/interviews',
  DASHBOARD_INTERVIEWS_DETAIL: '/dashboard/interviews/:id',
  
  // 用户后台路由
  USER_BACKEND: '/dashboard/user-backend',
  USER_BACKEND_ARTICLES: '/dashboard/user-backend/articles',
  USER_BACKEND_ARTICLES_CREATE: '/dashboard/user-backend/articles/create',
  USER_BACKEND_ARTICLES_EDIT: '/dashboard/user-backend/articles/edit/:id',
  USER_BACKEND_MESSAGES: '/dashboard/user-backend/messages',
  USER_BACKEND_PROFILE: '/dashboard/user-backend/profile',
  USER_BACKEND_FAVORITES: '/dashboard/user-backend/favorites',
  USER_BACKEND_INTERVIEWS: '/dashboard/user-backend/interviews',

  // 管理员后台
  ADMIN_DASHBOARD: '/dashboard/admin',

  // 会员与兑换
  MEMBERSHIP: '/dashboard/membership',
} as const;

// 路由工具函数
export const routeUtils = {
  // 获取文章详情路由
  getPostDetailRoute: (postId: string) => `/dashboard/discussions/${postId}`,
  
  // 获取课程详情路由
  getCourseDetailRoute: (courseId: string) => `/dashboard/courses/${courseId}`,
  // 获取题库详情路由
  getInterviewDetailRoute: (id: string) => `/dashboard/interviews/${id}`,
  
  // 获取编辑文章路由
  getArticleEditRoute: (articleId: string) => `/dashboard/user-backend/articles/edit/${articleId}`,
  
  // 判断是否为Dashboard路由
  isDashboardRoute: (pathname: string) => pathname.startsWith('/dashboard'),
  
  // 判断是否为详情页路由
  isDetailRoute: (pathname: string) => {
    return pathname.includes('/discussions/') || pathname.includes('/courses/');
  },
};

// 导航配置
export const navigationConfig = [
  { 
    id: 'home', 
    name: '首页', 
    path: '/dashboard/home',
    icon: 'Home'
  },
  { 
    id: 'discussions', 
    name: '讨论', 
    path: '/dashboard/discussions',
    icon: 'MessageSquare'
  },
  { 
    id: 'courses', 
    name: '课程', 
    path: '/dashboard/courses',
    icon: 'BookOpen'
  },
  { 
    id: 'interviews', 
    name: '题库', 
    path: '/dashboard/interviews',
    icon: 'ListChecks'
  },
  { 
    id: 'ai-news', 
    name: 'AI 日报', 
    path: '/dashboard/ai-news',
    icon: 'Newspaper'
  },
  { 
    id: 'changelog', 
    name: '更新日志', 
    path: '/dashboard/changelog',
    icon: 'FileText'
  }
];
