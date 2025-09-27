import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseCard } from './CourseCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PublicCoursesService } from '@shared/services/api';
import { FrontCourseDTO, PublicCourseDTO } from '@shared/types';
import { PublicCourseDetailModal } from './PublicCourseDetailModal';

interface CourseGridProps {
  onAuthRequired: () => void;
}

export const CourseGrid: React.FC<CourseGridProps> = () => {
  const [courses, setCourses] = useState<FrontCourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const mapToFront = (c: PublicCourseDTO): FrontCourseDTO => ({
    id: c.id,
    title: c.title,
    description: c.description,
    coverImage: undefined,
    techStack: c.techStack || [],
    projectUrl: c.demoUrl, // 映射为卡片的外链按钮
    demoUrl: c.demoUrl,
    resources: c.resources,
    tags: c.tags || [],
    rating: c.rating ?? 0,
    status: c.status,
    authorName: '',
    totalReadingTime: c.totalReadingTime,
    chapterCount: c.chapterCount,
    price: c.price,
    originalPrice: c.originalPrice,
    createTime: c.createTime,
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await PublicCoursesService.getPublicCoursesList({ pageNum: 1, pageSize: 1000 });
      const mapped = (page.records || []).map(mapToFront);
      setCourses(mapped);
    } catch (e) {
      console.error('加载公开课程列表失败', e);
      setError('课程列表加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onCardClick = (courseId: string) => {
    setActiveCourseId(courseId);
    setDetailOpen(true);
  };

  const header = useMemo(() => (
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">精选课程目录</h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        覆盖工程化与真实业务场景的高质量课程，助你系统提升。
      </p>
    </div>
  ), []);

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {header}

        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTitle>加载失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={onCardClick}
                showAuthor={false}
                hideContent
                hideHero
                hideStatus
                hidePrice
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-warm-gray-600">暂无课程</p>
          </Card>
        )}
      </div>

      {/* 详情弹窗 */}
      <PublicCourseDetailModal
        open={detailOpen}
        onOpenChange={(o) => { if (!o) { setDetailOpen(false); setActiveCourseId(null); } else { setDetailOpen(true); } }}
        courseId={activeCourseId}
      />
    </section>
  );
};
