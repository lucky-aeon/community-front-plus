export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  membershipExpiry?: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentCount: number;
  tags: string[];
  requiredTier: 'basic' | 'premium' | 'vip';
  isNew?: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'vip';
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  color: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  tags: string[];
  type: 'article' | 'question';
  isAnswered?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  };
  createdAt: Date;
  likes: number;
  postId: string;
  isAnswer?: boolean;
}