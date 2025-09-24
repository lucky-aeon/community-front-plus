import { Course, MembershipPlan, Post, Comment, ChangelogEntry } from '@shared/types';

export const courses: Course[] = [
  {
    id: '1',
    title: 'Advanced React Development Mastery',
    description: 'Master advanced React patterns, hooks, performance optimization, and state management for enterprise applications.',
    instructor: 'Sarah Johnson',
    duration: '12 hours',
    level: 'advanced',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    price: 299,
    originalPrice: 399,
    rating: 4.9,
    studentCount: 2847,
    tags: ['React', 'JavaScript', 'Frontend'],
    requiredTier: 'premium',
    isNew: true,
    chapters: [
      {
        id: '1-1',
        title: 'React Hooks 深入理解',
        description: '学习 useState, useEffect, useContext 等核心 Hooks',
        duration: '45分钟',
        order: 1,
        isCompleted: false
      },
      {
        id: '1-2',
        title: '自定义 Hooks 开发',
        description: '创建可复用的自定义 Hooks',
        duration: '38分钟',
        order: 2,
        isCompleted: false
      },
      {
        id: '1-3',
        title: '性能优化技巧',
        description: 'React.memo, useMemo, useCallback 优化策略',
        duration: '52分钟',
        order: 3,
        isCompleted: false
      },
      {
        id: '1-4',
        title: '状态管理最佳实践',
        description: 'Context API 和第三方状态管理库的使用',
        duration: '41分钟',
        order: 4,
        isCompleted: false
      }
    ]
  },
  {
    id: '2',
    title: 'Full-Stack TypeScript Bootcamp',
    description: 'Complete guide to building scalable applications with TypeScript, Node.js, and modern database technologies.',
    instructor: 'Michael Chen',
    duration: '18 hours',
    level: 'intermediate',
    thumbnail: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    price: 399,
    originalPrice: 499,
    rating: 4.8,
    studentCount: 1923,
    tags: ['TypeScript', 'Node.js', 'Full-Stack'],
    requiredTier: 'vip',
    chapters: [
      {
        id: '2-1',
        title: 'TypeScript 基础语法',
        description: '类型系统、接口、泛型等核心概念',
        duration: '55分钟',
        order: 1,
        isCompleted: false
      },
      {
        id: '2-2',
        title: 'Node.js 与 TypeScript',
        description: '搭建 TypeScript Node.js 开发环境',
        duration: '42分钟',
        order: 2,
        isCompleted: false
      },
      {
        id: '2-3',
        title: '数据库集成',
        description: 'TypeORM 和 Prisma 的使用',
        duration: '48分钟',
        order: 3,
        isCompleted: false
      }
    ]
  },
  {
    id: '3',
    title: 'Modern CSS & Design Systems',
    description: 'Create beautiful, maintainable CSS architectures and design systems for modern web applications.',
    instructor: 'Emma Rodriguez',
    duration: '8 hours',
    level: 'intermediate',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    studentCount: 3421,
    tags: ['CSS', 'Design', 'UI/UX'],
    requiredTier: 'basic',
    chapters: [
      {
        id: '3-1',
        title: 'CSS Grid 布局系统',
        description: '掌握现代网格布局技术',
        duration: '35分钟',
        order: 1,
        isCompleted: false
      },
      {
        id: '3-2',
        title: '设计系统构建',
        description: '创建可维护的设计系统',
        duration: '40分钟',
        order: 2,
        isCompleted: false
      }
    ]
  },
  {
    id: '4',
    title: 'Cloud Architecture & DevOps',
    description: 'Learn to design and deploy scalable cloud infrastructure using AWS, Docker, and Kubernetes.',
    instructor: 'David Kim',
    duration: '15 hours',
    level: 'advanced',
    thumbnail: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    price: 449,
    originalPrice: 549,
    rating: 4.9,
    studentCount: 1654,
    tags: ['AWS', 'DevOps', 'Cloud'],
    requiredTier: 'vip',
    chapters: [
      {
        id: '4-1',
        title: 'AWS 基础服务',
        description: 'EC2, S3, RDS 等核心服务介绍',
        duration: '60分钟',
        order: 1,
        isCompleted: false
      },
      {
        id: '4-2',
        title: 'Docker 容器化',
        description: '应用容器化和镜像管理',
        duration: '45分钟',
        order: 2,
        isCompleted: false
      },
      {
        id: '4-3',
        title: 'Kubernetes 编排',
        description: '容器编排和集群管理',
        duration: '55分钟',
        order: 3,
        isCompleted: false
      }
    ]
  },
  {
    id: '5',
    title: 'JavaScript Fundamentals to Advanced',
    description: 'Complete JavaScript course covering ES6+, async programming, and modern development practices.',
    instructor: 'Alex Thompson',
    duration: '14 hours',
    level: 'beginner',
    thumbnail: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    price: 149,
    originalPrice: 199,
    rating: 4.6,
    studentCount: 5672,
    tags: ['JavaScript', 'Programming', 'Web'],
    requiredTier: 'basic',
    chapters: [
      {
        id: '5-1',
        title: 'JavaScript 基础语法',
        description: '变量、函数、对象等基础概念',
        duration: '50分钟',
        order: 1,
        isCompleted: false
      },
      {
        id: '5-2',
        title: 'ES6+ 新特性',
        description: '箭头函数、解构、模块化等现代特性',
        duration: '45分钟',
        order: 2,
        isCompleted: false
      }
    ]
  },
  {
    id: '6',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile apps with React Native, navigation, state management, and native features.',
    instructor: 'Lisa Wang',
    duration: '16 hours',
    level: 'intermediate',
    thumbnail: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    price: 349,
    originalPrice: 429,
    rating: 4.8,
    studentCount: 2134,
    tags: ['React Native', 'Mobile', 'iOS', 'Android'],
    requiredTier: 'premium',
    chapters: [
      {
        id: '6-1',
        title: 'React Native 环境搭建',
        description: '开发环境配置和项目初始化',
        duration: '30分钟',
        order: 1,
        isCompleted: false
      },
      {
        id: '6-2',
        title: '组件开发',
        description: '原生组件和自定义组件开发',
        duration: '50分钟',
        order: 2,
        isCompleted: false
      }
    ]
  }
];

export const posts: Post[] = [
  {
    id: '1',
    title: 'Best Practices for React Performance Optimization',
    content: 'I\'ve been working on optimizing React applications and wanted to share some techniques that have worked well for me...',
    author: {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      membershipTier: 'premium'
    },
    createdAt: new Date('2025-01-15T10:30:00Z'),
    updatedAt: new Date('2025-01-15T10:30:00Z'),
    likes: 24,
    comments: 8,
    tags: ['React', 'Performance', 'JavaScript'],
    type: 'article'
  },
  {
    id: '2',
    title: 'How to implement authentication in Next.js?',
    content: 'I\'m struggling with implementing secure authentication in my Next.js application. What are the best approaches?',
    author: {
      id: '2',
      name: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      membershipTier: 'basic'
    },
    createdAt: new Date('2025-01-15T09:15:00Z'),
    updatedAt: new Date('2025-01-15T09:15:00Z'),
    likes: 12,
    comments: 15,
    tags: ['Next.js', 'Authentication', 'Security'],
    type: 'question',
    isAnswered: true
  },
  {
    id: '3',
    title: 'Advanced TypeScript Patterns for Enterprise Applications',
    content: 'Exploring advanced TypeScript patterns that can help build more maintainable enterprise applications...',
    author: {
      id: '3',
      name: 'Emma Rodriguez',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      membershipTier: 'vip'
    },
    createdAt: new Date('2025-01-14T16:45:00Z'),
    updatedAt: new Date('2025-01-14T16:45:00Z'),
    likes: 45,
    comments: 23,
    tags: ['TypeScript', 'Enterprise', 'Architecture'],
    type: 'article'
  },
  {
    id: '4',
    title: 'CSS Grid vs Flexbox - When to use which?',
    content: 'I\'m confused about when to use CSS Grid versus Flexbox. Can someone explain the differences and use cases?',
    author: {
      id: '4',
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      membershipTier: 'basic'
    },
    createdAt: new Date('2025-01-14T14:20:00Z'),
    updatedAt: new Date('2025-01-14T14:20:00Z'),
    likes: 18,
    comments: 12,
    tags: ['CSS', 'Layout', 'Frontend'],
    type: 'question',
    isAnswered: false
  }
];

export const comments: Comment[] = [
  {
    id: '1',
    content: 'Great article! The memo optimization tip really helped improve my app performance.',
    author: {
      id: '5',
      name: 'Alex Thompson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      membershipTier: 'premium'
    },
    createdAt: new Date('2025-01-15T11:00:00Z'),
    likes: 5,
    postId: '1'
  },
  {
    id: '2',
    content: 'For Next.js authentication, I recommend using NextAuth.js. It\'s secure and easy to implement.',
    author: {
      id: '6',
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      membershipTier: 'vip'
    },
    createdAt: new Date('2025-01-15T09:30:00Z'),
    likes: 8,
    postId: '2',
    isAnswer: true
  }
];

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'basic',
    name: '基础版',
    tier: 'basic',
    price: 29,
    originalPrice: 39,
    duration: 'per month',
    color: 'from-blue-500 to-blue-600',
    features: [
      '访问基础课程',
      '社区论坛权限',
      '邮件支持',
      '移动应用访问',
      '基础进度跟踪'
    ]
  },
  {
    id: 'premium',
    name: '优享版',
    tier: 'premium',
    price: 59,
    originalPrice: 79,
    duration: 'per month',
    color: 'from-purple-500 to-purple-600',
    isPopular: true,
    features: [
      '访问所有基础和优享课程',
      '直播工作坊课程',
      '优先支持服务',
      '可下载资源',
      '高级进度分析',
      '结业证书',
      '私密社区频道'
    ]
  },
  {
    id: 'vip',
    name: 'VIP 精英版',
    tier: 'vip',
    price: 99,
    originalPrice: 129,
    duration: 'per month',
    color: 'from-gradient-start to-gradient-end',
    features: [
      '包含优享版所有功能',
      '独家VIP课程',
      '一对一导师辅导',
      '新内容优先体验',
      '定制学习路径',
      '直接联系讲师',
      '终身课程访问权',
      '年度VIP活动邀请'
    ]
  }
];

export const changelogEntries: ChangelogEntry[] = [
  {
    id: '1',
    version: '2.1.0',
    title: '新增课程评价系统和学习进度跟踪',
    description: '本次更新为巧牙社区带来了全新的课程评价功能和更精准的学习进度跟踪系统，让学习体验更加个性化。',
    releaseDate: new Date('2024-01-15T10:00:00Z'),
    status: 'published',
    isImportant: true,
    author: {
      id: 'admin-1',
      name: '巧牙团队',
      avatar: '/logo.jpg'
    },
    viewCount: 1247,
    feedbackCount: 45,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    changes: [
      {
        id: '1-1',
        type: 'feature',
        title: '课程评价和评论功能',
        description: '学员可以对已完成的课程进行评分和评论，帮助其他用户做出更好的选择',
        category: '课程系统'
      },
      {
        id: '1-2',
        type: 'feature',
        title: '学习进度可视化图表',
        description: '新增学习进度图表，直观显示个人学习轨迹和完成情况',
        category: '用户中心'
      },
      {
        id: '1-3',
        type: 'improvement',
        title: '优化学习进度统计算法',
        description: '改进进度计算逻辑，更准确地反映实际学习状态',
        category: '课程系统'
      },
      {
        id: '1-4',
        type: 'improvement',
        title: '改进课程推荐机制',
        description: '基于用户学习历史和偏好，提供更精准的课程推荐',
        category: '推荐系统'
      },
      {
        id: '1-5',
        type: 'bugfix',
        title: '修复移动端课程播放问题',
        description: '解决iOS设备上视频播放异常和进度保存失效的问题',
        category: '移动端'
      },
      {
        id: '1-6',
        type: 'bugfix',
        title: '解决用户头像上传异常',
        description: '修复大尺寸头像上传失败和显示错误的问题',
        category: '用户中心'
      }
    ]
  },
  {
    id: '2',
    version: '2.0.8',
    title: '用户体验优化和性能提升',
    description: '专注于提升平台整体性能和用户交互体验的优化更新。',
    releaseDate: new Date('2024-01-10T14:30:00Z'),
    status: 'published',
    isImportant: false,
    author: {
      id: 'admin-1',
      name: '巧牙团队',
      avatar: '/logo.jpg'
    },
    viewCount: 892,
    feedbackCount: 23,
    createdAt: new Date('2024-01-10T14:30:00Z'),
    updatedAt: new Date('2024-01-10T14:30:00Z'),
    changes: [
      {
        id: '2-1',
        type: 'improvement',
        title: '页面加载速度优化',
        description: '优化资源加载策略，页面首次加载速度提升40%',
        category: '性能优化'
      },
      {
        id: '2-2',
        type: 'improvement',
        title: '搜索功能增强',
        description: '改进搜索算法，支持模糊匹配和智能提示',
        category: '搜索系统'
      },
      {
        id: '2-3',
        type: 'improvement',
        title: '响应式设计优化',
        description: '优化移动端和平板端的界面适配效果',
        category: '界面设计'
      },
      {
        id: '2-4',
        type: 'bugfix',
        title: '修复筛选器重置问题',
        description: '解决课程筛选条件无法正确重置的问题',
        category: '课程系统'
      },
      {
        id: '2-5',
        type: 'bugfix',
        title: '修复消息通知异常',
        description: '解决部分用户无法接收系统通知的问题',
        category: '通知系统'
      }
    ]
  },
  {
    id: '3',
    version: '2.0.5',
    title: '安全性增强和功能完善',
    description: '重要的安全更新和多项功能完善，建议所有用户及时了解。',
    releaseDate: new Date('2024-01-05T09:15:00Z'),
    status: 'published',
    isImportant: true,
    author: {
      id: 'admin-1',
      name: '巧牙团队',
      avatar: '/logo.jpg'
    },
    viewCount: 1567,
    feedbackCount: 78,
    createdAt: new Date('2024-01-05T09:15:00Z'),
    updatedAt: new Date('2024-01-05T09:15:00Z'),
    changes: [
      {
        id: '3-1',
        type: 'security',
        title: '用户密码加密升级',
        description: '升级密码加密算法，提升账户安全防护等级',
        category: '安全系统'
      },
      {
        id: '3-2',
        type: 'security',
        title: 'API接口安全加固',
        description: '加强API访问控制和数据验证机制',
        category: '安全系统'
      },
      {
        id: '3-3',
        type: 'feature',
        title: '双因素身份验证',
        description: '新增短信和邮箱双重验证功能，提升账户安全性',
        category: '用户中心'
      },
      {
        id: '3-4',
        type: 'improvement',
        title: '优化讨论区体验',
        description: '改进帖子排序和回复机制，提升社区互动体验',
        category: '社区系统'
      },
      {
        id: '3-5',
        type: 'bugfix',
        title: '修复数据统计错误',
        description: '解决学习时长统计不准确的问题',
        category: '数据统计'
      }
    ]
  },
  {
    id: '4',
    version: '2.0.2',
    title: '界面美化和交互优化',
    description: '全新的界面设计和更流畅的交互体验。',
    releaseDate: new Date('2023-12-28T16:20:00Z'),
    status: 'published',
    isImportant: false,
    author: {
      id: 'admin-1',
      name: '巧牙团队',
      avatar: '/logo.jpg'
    },
    viewCount: 743,
    feedbackCount: 19,
    createdAt: new Date('2023-12-28T16:20:00Z'),
    updatedAt: new Date('2023-12-28T16:20:00Z'),
    changes: [
      {
        id: '4-1',
        type: 'improvement',
        title: '界面风格统一',
        description: '统一整站视觉风格，采用全新的敲鸭黄色系主题',
        category: '界面设计'
      },
      {
        id: '4-2',
        type: 'improvement',
        title: '动画效果优化',
        description: '添加流畅的页面切换和交互动画效果',
        category: '用户体验'
      },
      {
        id: '4-3',
        type: 'feature',
        title: '夜间模式支持',
        description: '新增深色主题选项，保护用户视力',
        category: '界面设计'
      },
      {
        id: '4-4',
        type: 'bugfix',
        title: '修复按钮响应问题',
        description: '解决部分按钮在某些浏览器下点击无响应的问题',
        category: '兼容性'
      }
    ]
  },
  {
    id: '5',
    version: '2.0.0',
    title: '全新2.0版本发布',
    description: '巧牙社区2.0正式发布！全面升级的架构和功能，带来前所未有的学习体验。',
    releaseDate: new Date('2023-12-20T10:00:00Z'),
    status: 'published',
    isImportant: true,
    author: {
      id: 'admin-1',
      name: '巧牙团队',
      avatar: '/logo.jpg'
    },
    viewCount: 3247,
    feedbackCount: 156,
    createdAt: new Date('2023-12-20T10:00:00Z'),
    updatedAt: new Date('2023-12-20T10:00:00Z'),
    changes: [
      {
        id: '5-1',
        type: 'breaking',
        title: '全新架构升级',
        description: '采用最新技术栈重构，提升系统稳定性和扩展性',
        category: '系统架构'
      },
      {
        id: '5-2',
        type: 'feature',
        title: '会员体系重构',
        description: '全新的三级会员体系，更丰富的权益和学习资源',
        category: '会员系统'
      },
      {
        id: '5-3',
        type: 'feature',
        title: '社区讨论功能',
        description: '全新的社区讨论区，支持文章分享和问答互动',
        category: '社区系统'
      },
      {
        id: '5-4',
        type: 'feature',
        title: '个人中心重设计',
        description: '全新的个人中心界面，更直观的学习数据和成就展示',
        category: '用户中心'
      },
      {
        id: '5-5',
        type: 'improvement',
        title: '课程播放体验优化',
        description: '全新的视频播放器，支持多种清晰度和播放速度',
        category: '课程系统'
      }
    ]
  }
];
