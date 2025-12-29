'use client';

import { usePathname } from 'next/navigation';

export interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
}

export interface WebSiteSchema {
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

export interface ServiceSchema {
  name: string;
  description: string;
  provider: OrganizationSchema;
  serviceType: string;
  areaServed: string;
  availableChannel?: {
    serviceUrl: string;
    serviceName: string;
  };
}

export interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface SchemaMarkupProps {
  organization?: OrganizationSchema;
  website?: WebSiteSchema;
  service?: ServiceSchema;
  faq?: FAQSchema;
  breadcrumb?: BreadcrumbSchema;
  customSchema?: object;
}

export default function SchemaMarkup({
  organization,
  website,
  service,
  faq,
  breadcrumb,
  customSchema
}: SchemaMarkupProps) {
  const pathname = usePathname();
  
  // Ensure safe defaults for arrays
  const safeFaq = faq ? { ...faq, questions: faq.questions || [] } : null;
  const safeBreadcrumb = breadcrumb ? { ...breadcrumb, items: breadcrumb.items || [] } : null;
  
  // Schema por defecto de la organización
  const defaultOrganization: OrganizationSchema = {
    name: "YA Tools",
    url: "https://yatools.com",
    logo: "https://yatools.com/logo.png",
    description: "Plataforma de herramientas SEO potenciadas por inteligencia artificial para optimizar tu presencia online",
    contactPoint: {
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"]
    },
    sameAs: [
      "https://twitter.com/yatools",
      "https://linkedin.com/company/yatools",
      "https://facebook.com/yatools"
    ]
  };

  // Schema por defecto del sitio web
  const defaultWebsite: WebSiteSchema = {
    name: "YA Tools",
    url: "https://yatools.com",
    description: "Herramientas SEO con inteligencia artificial",
    potentialAction: {
      target: "https://yatools.com/search?q={search_term_string}",
      queryInput: "required name=search_term_string"
    }
  };

  // Generar schemas
  const schemas = [];

  // Organization Schema
  const orgSchema = organization || defaultOrganization;
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    ...orgSchema
  });

  // Website Schema
  const webSchema = website || defaultWebsite;
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...webSchema
  });

  // Service Schema
  if (service) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.description,
      provider: {
        "@type": "Organization",
        ...service.provider
      },
      serviceType: service.serviceType,
      areaServed: service.areaServed,
      availableChannel: service.availableChannel ? {
        "@type": "ServiceChannel",
        ...service.availableChannel
      } : undefined
    });
  }

  // FAQ Schema
  if (safeFaq && safeFaq.questions && Array.isArray(safeFaq.questions) && safeFaq.questions.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: safeFaq.questions.map(q => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer
        }
      }))
    });
  }

  // Breadcrumb Schema
  if (safeBreadcrumb && safeBreadcrumb.items && Array.isArray(safeBreadcrumb.items) && safeBreadcrumb.items.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: safeBreadcrumb.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });
  }

  // Custom Schema
  if (customSchema) {
    schemas.push(customSchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  );
}

// Utilidades para generar schemas específicos
export const generateToolSchema = (toolName: string, toolDescription: string, toolUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: toolName,
  description: toolDescription,
  url: toolUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock"
  },
  provider: {
    "@type": "Organization",
    name: "YA Tools",
    url: "https://yatools.com"
  }
});

export const generateArticleSchema = (title: string, description: string, url: string, publishedTime?: string, modifiedTime?: string) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description: description,
  url: url,
  datePublished: publishedTime,
  dateModified: modifiedTime || publishedTime,
  author: {
    "@type": "Organization",
    name: "YA Tools"
  },
  publisher: {
    "@type": "Organization",
    name: "YA Tools",
    logo: {
      "@type": "ImageObject",
      url: "https://yatools.com/logo.png"
    }
  }
});