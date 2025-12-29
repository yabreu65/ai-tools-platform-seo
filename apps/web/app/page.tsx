
import ToolsSection from '@/components/tools-section'
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export default function Home() {
  const homeSchema = {
    organization: {
      name: "YA Tools",
      description: "Plataforma profesional de herramientas SEO potenciadas por inteligencia artificial",
      url: "https://yatools.app",
      logo: "https://yatools.app/logo.png",
      contactPoints: [
        {
          telephone: "+1-555-0123",
          contactType: "customer service",
          availableLanguage: ["Spanish", "English"]
        }
      ],
      sameAs: [
        "https://twitter.com/yatools",
        "https://linkedin.com/company/yatools"
      ]
    },
    website: {
      name: "YA Tools - Herramientas SEO Profesionales",
      url: "https://yatools.app",
      description: "Impulsa tu posicionamiento en buscadores con nuestro arsenal completo de herramientas automáticas basadas en inteligencia artificial",
      searchAction: {
        target: "https://yatools.app/search?q={search_term_string}",
        queryInput: "required name=search_term_string"
      }
    },
    breadcrumb: {
      items: [
        {
          name: "Inicio",
          url: "https://yatools.app"
        }
      ]
    }
  }

  return (
    <>
      <SEOHead
        title="YA Tools - Herramientas SEO Profesionales Potenciadas por IA"
        description="Impulsa tu posicionamiento en buscadores con nuestro arsenal completo de herramientas automáticas basadas en inteligencia artificial. 18 herramientas SEO profesionales disponibles 24/7."
        keywords="herramientas SEO, posicionamiento web, inteligencia artificial, optimización SEO, análisis web, marketing digital, SEO profesional"
        canonical="https://yatools.app"
        type="website"
        image="https://yatools.app/og-home.jpg"
        imageAlt="YA Tools - Herramientas SEO Profesionales"
        twitterCard="summary_large_image"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "YA Tools",
          "url": "https://yatools.app",
          "description": "Plataforma profesional de herramientas SEO potenciadas por inteligencia artificial",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yatools.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <SchemaMarkup {...homeSchema} />
      <ToolsSection />
    </>
  )
}



