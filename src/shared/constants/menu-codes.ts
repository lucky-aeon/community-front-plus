// 前台菜单码常量与映射（与后端约定一致）

export const MENU_CODE = {
  DASHBOARD_HOME: 'MENU_DASHBOARD_HOME',
  DASHBOARD_DISCUSSIONS: 'MENU_DASHBOARD_DISCUSSIONS',
  DASHBOARD_COURSES: 'MENU_DASHBOARD_COURSES',
  DASHBOARD_CHANGELOG: 'MENU_DASHBOARD_CHANGELOG',
  USER_BACKEND: 'MENU_USER_BACKEND',
  USER_ARTICLES: 'MENU_USER_ARTICLES',
  USER_COMMENTS: 'MENU_USER_COMMENTS',
  USER_TESTIMONIAL: 'MENU_USER_TESTIMONIAL',
  USER_RESOURCES: 'MENU_USER_RESOURCES',
  USER_MESSAGES: 'MENU_USER_MESSAGES',
  USER_FOLLOWS: 'MENU_USER_FOLLOWS',
  USER_PROFILE: 'MENU_USER_PROFILE',
  USER_DEVICES: 'MENU_USER_DEVICES',
  MEMBERSHIP: 'MENU_MEMBERSHIP',
  REDEEM_CDK: 'MENU_REDEEM_CDK',
} as const;

export type MenuCode = typeof MENU_CODE[keyof typeof MENU_CODE];

// 导航项 id 映射到菜单码（用户门户）
export const NAV_ID_TO_CODE: Record<string, MenuCode | undefined> = {
  home: MENU_CODE.DASHBOARD_HOME,
  discussions: MENU_CODE.DASHBOARD_DISCUSSIONS,
  courses: MENU_CODE.DASHBOARD_COURSES,
  changelog: MENU_CODE.DASHBOARD_CHANGELOG,
  // 用户中心左侧导航 id
  articles: MENU_CODE.USER_ARTICLES,
  comments: MENU_CODE.USER_COMMENTS,
  testimonial: MENU_CODE.USER_TESTIMONIAL,
  resources: MENU_CODE.USER_RESOURCES,
  messages: MENU_CODE.USER_MESSAGES,
  follows: MENU_CODE.USER_FOLLOWS,
  profile: MENU_CODE.USER_PROFILE,
  devices: MENU_CODE.USER_DEVICES,
};

// 路由前缀映射（按优先级从长到短匹配）
const PATH_PREFIX_TO_CODE_ORDERED: Array<{ prefix: string; code: MenuCode }> = [
  // 用户中心具体页面优先于总入口
  { prefix: '/dashboard/user-backend/articles', code: MENU_CODE.USER_ARTICLES },
  { prefix: '/dashboard/user-backend/comments', code: MENU_CODE.USER_COMMENTS },
  { prefix: '/dashboard/user-backend/testimonial', code: MENU_CODE.USER_TESTIMONIAL },
  { prefix: '/dashboard/user-backend/resources', code: MENU_CODE.USER_RESOURCES },
  { prefix: '/dashboard/user-backend/messages', code: MENU_CODE.USER_MESSAGES },
  { prefix: '/dashboard/user-backend/follows', code: MENU_CODE.USER_FOLLOWS },
  { prefix: '/dashboard/user-backend/profile', code: MENU_CODE.USER_PROFILE },
  { prefix: '/dashboard/user-backend/devices', code: MENU_CODE.USER_DEVICES },
  { prefix: '/dashboard/user-backend', code: MENU_CODE.USER_BACKEND },
  // 用户门户
  { prefix: '/dashboard/membership', code: MENU_CODE.MEMBERSHIP },
  { prefix: '/dashboard/discussions', code: MENU_CODE.DASHBOARD_DISCUSSIONS },
  { prefix: '/dashboard/courses', code: MENU_CODE.DASHBOARD_COURSES },
  { prefix: '/dashboard/changelog', code: MENU_CODE.DASHBOARD_CHANGELOG },
  { prefix: '/dashboard/home', code: MENU_CODE.DASHBOARD_HOME },
  { prefix: '/dashboard', code: MENU_CODE.DASHBOARD_HOME },
];

export function getMenuCodeByPathname(pathname: string): MenuCode | null {
  const match = PATH_PREFIX_TO_CODE_ORDERED.find(m => pathname.startsWith(m.prefix));
  return match ? match.code : null;
}

export function getMenuCodeByNavId(navId: string): MenuCode | null {
  return NAV_ID_TO_CODE[navId] || null;
}

