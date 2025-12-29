'use client'

import { Breadcrumbs, BreadcrumbWrapper } from '@/components/navigation/Breadcrumbs'
import { usePathname } from 'next/navigation'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  showBreadcrumbs?: boolean
  className?: string
  headerContent?: React.ReactNode
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  showBreadcrumbs = true, 
  className = '',
  headerContent 
}: PageLayoutProps) {
  const pathname = usePathname()
  
  // Don't show breadcrumbs on home page or auth pages
  const shouldShowBreadcrumbs = showBreadcrumbs && 
    pathname !== '/' && 
    !pathname.startsWith('/login') && 
    !pathname.startsWith('/registro')

  return (
    <div className="min-h-screen bg-background">
      {shouldShowBreadcrumbs && (
        <BreadcrumbWrapper>
          <Breadcrumbs />
        </BreadcrumbWrapper>
      )}
      
      <main className={`container mx-auto px-4 py-6 ${className}`}>
        {(title || description || headerContent) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-muted-foreground mb-4">
                {description}
              </p>
            )}
            {headerContent}
          </div>
        )}
        
        {children}
      </main>
    </div>
  )
}

// Specialized layouts for different page types
export function DashboardLayout({ children, ...props }: Omit<PageLayoutProps, 'className'>) {
  return (
    <PageLayout 
      {...props} 
      className="max-w-7xl"
    >
      {children}
    </PageLayout>
  )
}

export function ToolLayout({ children, ...props }: Omit<PageLayoutProps, 'className'>) {
  return (
    <PageLayout 
      {...props} 
      className="max-w-4xl"
    >
      {children}
    </PageLayout>
  )
}

export function ProfileLayout({ children, ...props }: Omit<PageLayoutProps, 'className'>) {
  return (
    <PageLayout 
      {...props} 
      className="max-w-3xl"
    >
      {children}
    </PageLayout>
  )
}

export function ContentLayout({ children, ...props }: Omit<PageLayoutProps, 'className'>) {
  return (
    <PageLayout 
      {...props} 
      className="max-w-4xl prose prose-gray dark:prose-invert mx-auto"
    >
      {children}
    </PageLayout>
  )
}