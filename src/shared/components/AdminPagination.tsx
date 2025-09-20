import React from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

export interface AdminPaginationProps {
  current: number;
  totalPages: number;
  total?: number;
  onChange: (page: number) => void;
  mode?: 'full' | 'simple';
  siblingCount?: number;   // 当前页两侧展示的页码数量
  boundaryCount?: number;  // 头尾展示的页码数量
}

function getPages(current: number, totalPages: number, siblingCount: number, boundaryCount: number) {
  const pages: (number | 'start-ellipsis' | 'end-ellipsis')[] = [];
  const startPages = Array.from({ length: Math.min(boundaryCount, totalPages) }, (_, i) => i + 1);
  const endPages = Array.from({ length: Math.min(boundaryCount, totalPages) }, (_, i) => totalPages - i).reverse();

  const start = Math.max(
    Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const end = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    totalPages - boundaryCount - 1
  );

  // 合并
  pages.push(...startPages);
  if (start > boundaryCount + 2) pages.push('start-ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - boundaryCount - 1) pages.push('end-ellipsis');
  endPages.forEach((p) => {
    if (!pages.includes(p)) pages.push(p);
  });
  return pages;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  current,
  totalPages,
  total,
  onChange,
  mode = 'full',
  siblingCount = 1,
  boundaryCount = 1,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  if (mode === 'simple') {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {typeof total === 'number' && (
          <div className="text-sm text-muted-foreground">共 {total} 条记录，第 {current} / {totalPages} 页</div>
        )}
        <div className="flex items-center gap-2">
          <ShadcnPagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onChange(1); }} aria-label="首页">
                  首页
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); onChange(Math.max(1, current - 1)); }}
                  aria-label="上一页"
                >
                  上一页
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-sm">{current} / {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); onChange(Math.min(totalPages, current + 1)); }}
                  aria-label="下一页"
                >
                  下一页
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onChange(totalPages); }} aria-label="尾页">
                  尾页
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </ShadcnPagination>
        </div>
      </div>
    );
  }

  // full 模式：带省略号的页码 + 上一页/下一页（中文）
  const items = getPages(current, totalPages, siblingCount, boundaryCount);
  const goto = (p: number) => onChange(Math.min(totalPages, Math.max(1, p)));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {typeof total === 'number' && (
        <div className="text-sm text-muted-foreground">共 {total} 条记录，第 {current} / {totalPages} 页</div>
      )}
      <ShadcnPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); goto(current - 1); }} aria-label="上一页">
              上一页
            </PaginationLink>
          </PaginationItem>
          {items.map((it, idx) => (
            <PaginationItem key={idx}>
              {it === 'start-ellipsis' || it === 'end-ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink href="#" isActive={it === current} onClick={(e) => { e.preventDefault(); goto(it as number); }}>
                  {it}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); goto(current + 1); }} aria-label="下一页">
              下一页
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
};

export default AdminPagination;

