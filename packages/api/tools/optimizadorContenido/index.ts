import { Router, Request, Response } from 'express';
import { scrapeWithTor } from '../../services/torScraper'; // ⚠️ Reemplazá con la ruta correcta

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'Falta la URL' });
    return;
  }

  try {
    const $ = await scrapeWithTor(url);
    if (!$) throw new Error('No se pudo obtener el contenido');

    const title = $('title').text() || null;
    const metaDescription = $('meta[name="description"]').attr('content') || null;
    const h1 = $('h1').first().text() || null;

    let texto = '';
    $('h1, h2, h3, p, li, a, strong').each((_, el) => {
      texto += ' ' + $(el).text();
    });

    const palabras = texto
      .toLowerCase()
      .replace(/[^a-záéíóúñü\s]/gi, '')
      .split(/\s+/)
      .filter(p => p.length > 2);

    const wordCount = palabras.length;
    const frecuencia: Record<string, number> = {};

    palabras.forEach(p => {
      frecuencia[p] = (frecuencia[p] || 0) + 1;
    });

    const densidad = Object.entries(frecuencia)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((acc, [word, count]) => {
        acc[word] = count;
        return acc;
      }, {} as Record<string, number>);

    const imagenesSinAlt = $('img:not([alt]), img[alt=""]').length;

    const sugerencias: string[] = [];
    if (!title || title.length < 30) sugerencias.push('Agregá o ampliá el título SEO (ideal entre 50 y 60 caracteres).');
    if (!metaDescription) sugerencias.push('Falta la meta descripción. Añadila para mejorar el CTR.');
    if (!h1) sugerencias.push('No se encontró un encabezado H1.');
    if (wordCount < 300) sugerencias.push('El contenido es muy corto. Considerá expandirlo para mayor relevancia.');
    if (imagenesSinAlt > 0) sugerencias.push(`Se detectaron ${imagenesSinAlt} imagen(es) sin atributo ALT.`);

    res.json({
      title,
      metaDescription,
      h1,
      wordCount,
      keywordDensity: densidad,
      imagenesSinAlt,
      sugerencias,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    console.error('❌ Error en optimizador:', message);
    res.status(500).json({ error: 'No se pudo analizar el contenido' });
  }
});

export default router;
