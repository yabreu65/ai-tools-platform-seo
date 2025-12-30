// src/app/layout.tsx
import '../styles/globals.css';
import '../styles/accessibility.css';
import { Inter } from 'next/font/google'

// Force dynamic rendering for all pages to avoid SSR errors
export const dynamic = 'force-dynamic';
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlanProvider } from '@/contexts/PlanContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { FeedbackProvider } from '@/contexts/FeedbackContext'
import { ShareProvider } from '@/contexts/ShareContext'
import { BlogProvider } from '@/contexts/BlogContext'
import { CaseStudyProvider } from '@/contexts/CaseStudyContext'
import { TestimonialProvider } from '@/contexts/TestimonialContext'
import { NewsletterProvider } from '@/contexts/NewsletterContext'
import { PWAProvider, PWAStatusIndicator } from '@/components/pwa/PWAProvider'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstaller'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { OptimizationProvider, OptimizationStatus } from '@/components/optimization/OptimizationProvider'
import { BreadcrumbProvider } from '@/contexts/BreadcrumbContext'
import { SearchProvider } from '@/contexts/SearchContext'
import { TooltipProvider } from '@/contexts/TooltipContext'
import { KeyboardShortcutProvider } from '@/contexts/KeyboardShortcutContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { ShortcutsOverlay } from '@/components/keyboard/ShortcutsOverlay'
import { AccessibilityMenu, AccessibilityButton } from '@/components/accessibility/AccessibilityMenu'
import { Toaster } from 'sonner'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ConnectionIndicator from '@/components/ConnectionIndicator'
import { OfflineIndicator, ConnectionStatus } from '@/components/OfflineIndicator'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YA Tools - Herramientas SEO con IA | Optimización Web Inteligente',
  description: 'Plataforma de herramientas SEO potenciadas por inteligencia artificial. Genera títulos, descripciones, analiza contenido y optimiza tu presencia online.',
  keywords: 'herramientas SEO, inteligencia artificial, IA, optimización web, marketing digital, análisis SEO, generador títulos, meta descriptions, SEO tools',
  authors: [{ name: 'YA Tools Team' }],
  creator: 'YA Tools',
  publisher: 'YA Tools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://yatools.com',
    siteName: 'YA Tools',
    title: 'YA Tools - Herramientas SEO con IA',
    description: 'Plataforma de herramientas SEO potenciadas por inteligencia artificial. Genera títulos, descripciones, analiza contenido y optimiza tu presencia online.',
    images: [
      {
        url: 'https://yatools.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'YA Tools - Herramientas SEO con IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yatools',
    creator: '@yatools',
    title: 'YA Tools - Herramientas SEO con IA',
    description: 'Plataforma de herramientas SEO potenciadas por inteligencia artificial.',
    images: ['https://yatools.com/og-image.jpg'],
  },

  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: 'https://yatools.com',
    languages: {
      'es-ES': 'https://yatools.com',
      'en-US': 'https://en.yatools.com',
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.yatools.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AccessibilityProvider>
            <KeyboardShortcutProvider>
              <OptimizationProvider
                enablePerformanceMonitoring={true}
                enableFontOptimization={true}
                enableCSSOptimization={true}
                enableDashboard={process.env.NODE_ENV === 'development'}
                showLoadingIndicators={true}
              >
                <PWAProvider>
                  <LoadingProvider>
                    <NotificationProvider>
                      <AuthProvider>
                        <AnalyticsProvider>
                          <FeedbackProvider>
                            <ShareProvider>
                              <BlogProvider>
                                <CaseStudyProvider>
                                  <TestimonialProvider>
                                    <NewsletterProvider>
                                      <PlanProvider>
                                        <BreadcrumbProvider>
                                  <SearchProvider>
                                    <TooltipProvider>
                                      <ConnectionIndicator />
                                      <ConnectionStatus />
                                      <div className="flex justify-center w-full min-h-screen">
                                        <div className="flex flex-col flex-1 w-full">
                                          <Navbar />
                                          <main id="main-content" className="flex-1 p-6 bg-muted/40" tabIndex={-1}>
                                            {children}
                                          </main>
                                          <Footer />
                                        </div>
                                      </div>
                                      <OfflineIndicator />
                                      <PWAStatusIndicator />
                                      <PWAInstallPrompt />
                                      <OptimizationStatus />
                                      <GlobalSearch />
                                      <ShortcutsOverlay />
                                      <AccessibilityMenu />
                                      <AccessibilityButton />
                                      <Toaster 
                                        position="top-right"
                                        richColors
                                        closeButton
                                        expand={false}
                                        duration={4000}
                                      />
                                    </TooltipProvider>
                                  </SearchProvider>
                                        </BreadcrumbProvider>
                                      </PlanProvider>
                                    </NewsletterProvider>
                                  </TestimonialProvider>
                                </CaseStudyProvider>
                              </BlogProvider>
                            </ShareProvider>
                          </FeedbackProvider>
                        </AnalyticsProvider>
                      </AuthProvider>
                    </NotificationProvider>
                  </LoadingProvider>
                </PWAProvider>
              </OptimizationProvider>
            </KeyboardShortcutProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
