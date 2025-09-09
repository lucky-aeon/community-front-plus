import React from 'react';
import { CourseCard } from './CourseCard';
import { courses } from '../../data/mockData';

interface CourseGridProps {
  onAuthRequired: () => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ onAuthRequired }) => {
  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Course Catalog
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master cutting-edge technologies with our expertly crafted courses, 
            designed for professionals who demand excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPurchase={onAuthRequired}
            />
          ))}
        </div>
      </div>
    </section>
  );
};