import { Course, MembershipPlan, Post, Comment } from '../types';

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
    isNew: true
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
    requiredTier: 'vip'
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
    requiredTier: 'basic'
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
    requiredTier: 'vip'
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
    requiredTier: 'basic'
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
    requiredTier: 'premium'
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
    name: 'Basic',
    tier: 'basic',
    price: 29,
    originalPrice: 39,
    duration: 'per month',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Access to basic courses',
      'Community forum access',
      'Email support',
      'Mobile app access',
      'Basic progress tracking'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    price: 59,
    originalPrice: 79,
    duration: 'per month',
    color: 'from-purple-500 to-purple-600',
    isPopular: true,
    features: [
      'Access to all basic & premium courses',
      'Live workshop sessions',
      'Priority support',
      'Downloadable resources',
      'Advanced progress analytics',
      'Certificate of completion',
      'Private community channels'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Elite',
    tier: 'vip',
    price: 99,
    originalPrice: 129,
    duration: 'per month',
    color: 'from-gradient-start to-gradient-end',
    features: [
      'Everything in Premium',
      'Exclusive VIP courses',
      '1-on-1 mentoring sessions',
      'Early access to new content',
      'Custom learning paths',
      'Direct instructor access',
      'Lifetime course access',
      'Annual VIP events invitation'
    ]
  }
]