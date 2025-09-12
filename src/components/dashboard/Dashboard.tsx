import React, { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { HomePage } from './HomePage';
import { DiscussionsPage } from './DiscussionsPage';
import { CoursesPage } from './CoursesPage';
import { CreatePostPage } from './CreatePostPage';
import { PostDetailPage } from './PostDetailPage';
import { CourseDetailPage } from './CourseDetailPage';
import { ProfilePage } from './ProfilePage';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const renderContent = () => {
    if (selectedPost) {
      return <PostDetailPage postId={selectedPost} onBack={() => setSelectedPost(null)} />;
    }
    
    if (selectedCourse) {
      return <CourseDetailPage courseId={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    }
    
    switch (activeTab) {
      case 'home':
        return <HomePage onPostClick={setSelectedPost} onCourseClick={setSelectedCourse} />;
      case 'discussions':
        return <DiscussionsPage onPostClick={setSelectedPost} />;
      case 'create':
        return <CreatePostPage onPostCreated={() => setActiveTab('discussions')} />;
      case 'courses':
        return <CoursesPage onCourseClick={setSelectedCourse} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onPostClick={setSelectedPost} onCourseClick={setSelectedCourse} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};