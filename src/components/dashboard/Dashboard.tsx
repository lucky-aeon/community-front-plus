import React, { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { HomePage } from './HomePage';
import { DiscussionsPage } from './DiscussionsPage';
import { CoursesPage } from './CoursesPage';
import { ProfilePage } from './ProfilePage';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'discussions':
        return <DiscussionsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};