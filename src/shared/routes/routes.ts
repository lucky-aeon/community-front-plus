// 路由常量定义
export const ROUTES = {
  // 公开路由
  HOME: '/',
  
  // 用户门户路由
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/dashboard/home',
  DASHBOARD_DISCUSSIONS: '/dashboard/discussions',
  DASHBOARD_DISCUSSIONS_DETAIL: '/dashboard/discussions/:postId',
  DASHBOARD_COURSES: '/dashboard/courses',
  DASHBOARD_COURSES_DETAIL: '/dashboard/courses/:courseId',
  DASHBOARD_CHANGELOG: '/dashboard/changelog',
  
  // 用户后台路由
  USER_BACKEND: '/dashboard/user-backend',
  USER_BACKEND_ARTICLES: '/dashboard/user-backend/articles',
  USER_BACKEND_MESSAGES: '/dashboard/user-backend/messages',
  USER_BACKEND_PROFILE: '/dashboard/user-backend/profile',
} as const;

// 路由工具函数
export const routeUtils = {
  // 获取文章详情路由
  getPostDetailRoute: (postId: string) => `/dashboard/discussions/${postId}`,
  
  // 获取课程详情路由
  getCourseDetailRoute: (courseId: string) => `/dashboard/courses/${courseId}`,
  
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
    id: 'changelog', 
    name: '更新日志', 
    path: '/dashboard/changelog',
    icon: 'FileText'
  }
];