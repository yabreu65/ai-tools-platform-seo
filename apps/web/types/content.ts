// types/content.ts
export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: Author;
  category: BlogCategory;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number; // in minutes
  views: number;
  likes: number;
  status: 'draft' | 'published' | 'archived';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface BlogComment {
  id: string;
  postId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  parentId?: string; // for replies
  likes: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  description: string;
  industry: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  challenge: string;
  solution: string;
  results: {
    metric: string;
    before: string | number;
    after: string | number;
    improvement: string;
  }[];
  tools: string[];
  timeline: string;
  featuredImage?: string;
  images: string[];
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  downloads: number;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  author: {
    name: string;
    position: string;
    company: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  rating: number; // 1-5 stars
  tool?: string; // which tool they're reviewing
  service?: string; // which service they're reviewing
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  helpful: number; // helpful votes
  socialProof?: {
    platform: 'twitter' | 'linkedin' | 'google';
    url: string;
  };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  preferences: {
    weeklyDigest: boolean;
    newPosts: boolean;
    productUpdates: boolean;
    seoTips: boolean;
  };
  segments: string[];
  source: string; // where they subscribed from
}

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: Date;
  sentAt?: Date;
  recipients: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  segments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentMetrics {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  totalSubscribers: number;
  totalTestimonials: number;
  totalCaseStudies: number;
  monthlyGrowth: {
    posts: number;
    views: number;
    subscribers: number;
  };
  topPosts: BlogPost[];
  topCategories: (BlogCategory & { postCount: number })[];
}

// Filter and search interfaces
export interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
}

export interface CaseStudyFilters {
  industry?: string;
  tool?: string;
  company?: string;
  sortBy: 'newest' | 'oldest' | 'popular' | 'results';
}

export interface TestimonialFilters {
  rating?: number;
  tool?: string;
  service?: string;
  verified?: boolean;
  sortBy: 'newest' | 'oldest' | 'rating' | 'helpful';
}