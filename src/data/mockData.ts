import { Course, MembershipPlan } from '../types';

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
];