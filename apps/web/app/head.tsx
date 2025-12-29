export default function Head() {
  return (
    <>
      {/* Título SEO */}
      <title>Herramientas SEO con IA – Optimización Web Inteligente | YA Tools</title>

      {/* Descripción SEO */}
      <meta
        name="description"
        content="Descubrí YA Tools: la plataforma de inteligencia artificial para crear títulos, descripciones y nombres SEO optimizados, comprimir imágenes y más."
      />

      {/* Favicon y Touch Icon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />

      {/* Open Graph para Facebook, WhatsApp, etc. */}
      <meta property="og:title" content="Herramientas SEO con IA – Optimización Web Inteligente | YA Tools" />
      <meta
        property="og:description"
        content="Descubrí YA Tools: la plataforma de inteligencia artificial para crear títulos, descripciones y nombres SEO optimizados, comprimir imágenes y más."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://tu-dominio.com/" />
      <meta property="og:image" content="https://tu-dominio.com/images/preview.jpg" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Herramientas SEO con IA – Optimización Web Inteligente | YA Tools" />
      <meta
        name="twitter:description"
        content="Plataforma con inteligencia artificial para crear títulos, descripciones y nombres SEO optimizados."
      />
      <meta name="twitter:image" content="https://tu-dominio.com/images/preview.jpg" />

      {/* Meta test personalizada */}
      <meta name="yoryi-test" content="head-ok" />
    </>
  );
}
