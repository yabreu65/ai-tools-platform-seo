// backend-node/routes.ts
import express from 'express';
import authRouter from './routes/auth';
import competitorAnalysisRouter from './routes/competitor-analysis';
import auditorRouter from './tools/auditor';
import duplicateCheckerRouter from './tools/duplicateChecker';
import keywordsRouter from './tools/keywords';
import optimizadorContenidoRouter from './tools/optimizadorContenido';
import optimizadorProfundoRoute from './tools/optimizadorProfundo';
import renombrarRoute from './tools/renombrar/index';
import robotsCheckerRoute from './tools/robots-checker';
import sitemapRouter from './tools/sitemap';
import vitalsRoute from './tools/vitals';
import imageCompressorRouter from './tools/imageCompressor/routes';
import brokenLinksRouter from './tools/broken-links';
import keywordScraperRouter from './tools/keyword-scraper';

// Keyword Research Tool routes
import keywordDiscoverRouter from './src/routes/keyword-research/discover';
import keywordDifficultyRouter from './src/routes/keyword-research/difficulty';
import keywordTrendsRouter from './src/routes/keyword-research/trends';
import keywordClusteringRouter from './src/routes/keyword-research/clustering';
import keywordSerpRouter from './src/routes/keyword-research/serp';
import keywordTrackingRouter from './src/routes/keyword-research/tracking';
import keywordReportsRouter from './src/routes/keyword-research/reports';
import keywordAlertsRouter from './src/routes/keyword-research/alerts';

const router = express.Router();

// Authentication routes
router.use('/auth', authRouter);

// Competitor Analysis routes
router.use('/competitor-analysis', competitorAnalysisRouter);

// Tool routes
router.use('/renombrar', renombrarRoute);
router.use('/keywords', keywordsRouter);
router.use('/duplicados', duplicateCheckerRouter);
router.use('/vitals', vitalsRoute);
router.use('/generador-sitemap', sitemapRouter);
router.use('/robots-checker', robotsCheckerRoute);
router.use('/optimizador', optimizadorContenidoRouter);
router.use('/optimizador-profundo', optimizadorProfundoRoute);
router.use('/auditor', auditorRouter);
router.use('/compresor-imagenes', imageCompressorRouter);
router.use('/broken-links', brokenLinksRouter);
router.use('/keyword-scraper', keywordScraperRouter);

// Cache management
import cacheRouter from './routes/cache';
router.use('/cache', cacheRouter);

// Keyword Research Tool routes
router.use('/keyword-research/discover', keywordDiscoverRouter);
router.use('/keyword-research/difficulty/analyze', keywordDifficultyRouter);
router.use('/keyword-research/trends/analyze', keywordTrendsRouter);
router.use('/keyword-research/clustering/generate', keywordClusteringRouter);
router.use('/keyword-research/serp/analyze', keywordSerpRouter);
router.use('/keyword-research/tracking/setup', keywordTrackingRouter);
router.use('/keyword-research/reports/generate', keywordReportsRouter);
router.use('/keyword-research/alerts/configure', keywordAlertsRouter);

export default router;