import * as React from 'react'
import { cn } from '@shared/utils/cn'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  width?: number // expanded width in px
  collapsedWidth?: number // collapsed width in px
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    { className, collapsed = false, width = 256, collapsedWidth = 64, children, ...props },
    ref
  ) => (
    <aside
      ref={ref}
      className={cn(
        'bg-background border-r flex flex-col transition-all duration-300 ease-in-out h-screen overflow-hidden',
        className
      )}
      style={{ width: collapsed ? collapsedWidth : width }}
      {...props}
    >
      {children}
    </aside>
  )
)
Sidebar.displayName = 'Sidebar'

export const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-b px-4 py-3', className)} {...props} />
)

export const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-t px-4 py-3', className)} {...props} />
)

export const SidebarContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 min-h-0', className)} {...props}>
    <ScrollArea className="h-full">
      <div className="px-2 py-3">{children}</div>
    </ScrollArea>
  </div>
)

export const SidebarSection = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-6', className)} {...props} />
)

export const SidebarSectionTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2', className)}
    {...props}
  />
)
