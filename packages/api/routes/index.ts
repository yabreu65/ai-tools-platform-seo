// backend-node/routes/index.ts
import express from 'express';
import authRouter from './auth';
import auditorRouter from '../tools/auditor';
import duplicateCheckerRouter from '../tools/duplicateChecker';
import keywordsRouter from '../tools/keywords';
import optimizadorContenidoRouter from '../tools/optimizadorContenido';
import optimizadorProfundoRoute from '../tools/optimizadorProfundo';
import renombrarRoute from '../tools/renombrar';
import robotsCheckerRoute from '../tools/robots-checker';
import sitemapRouter from '../tools/sitemap';
import vitalsRoute from '../tools/vitals';
import brokenLinksRoute from '../tools/broken-links';

const router = express.Router();

// Authentication routes
router.use('/auth', authRouter);

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
router.use('/broken-links', brokenLinksRoute);

export default router; // 👈 Exportación por defecto
