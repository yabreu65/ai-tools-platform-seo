'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
  schema?: object;
}

const defaultSEO = {
  title: 'YA Tools - Herramientas SEO con IA',
  description: 'Plataforma de herramientas SEO potenciadas por inteligencia artificial. Genera títulos, descripciones, analiza contenido y optimiza tu presencia online.',
  keywords: 'SEO, herramientas SEO, inteligencia artificial, IA, optimización web, marketing digital, análisis SEO, generador títulos, meta descriptions',
  image: 'https://yatools.com/og-image.jpg',
  type: 'website' as const,
  author: 'YA Tools Team'
};

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  noindex = false,
  nofollow = false,
  canonical,
  alternates,
  schema
}: SEOProps) {
  const pathname = usePathname();
  
  // Construir valores finales
  const finalTitle = title ? `${title} | YA Tools` : defaultSEO.title;
  const finalDescription = description || defaultSEO.description;
  const finalKeywords = keywords || defaultSEO.keywords;
  const finalImage = image || defaultSEO.image;
  const finalUrl = url || `https://yatools.com${pathname}`;
  const finalAuthor = author || defaultSEO.author;
  
  // Robots meta tag
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={finalAuthor} />
      <meta name="robots" content={robotsContent.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || finalUrl} />
      
      {/* Alternate Languages */}
      {alternates?.map((alt, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={alt.hreflang}
          href={alt.href}
        />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content="YA Tools" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {finalAuthor && (
            <meta property="article:author" content={finalAuthor} />
          )}
          {section && (
            <meta property="article:section" content={section} />
          )}
          {tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@yatools" />
      <meta name="twitter:creator" content="@yatools" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="YA Tools" />
      
      {/* Favicons and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.yatools.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      )}
    </Head>
  );
}