import { Router } from 'express';
import { keywordScraperRoutes } from './routes';

const router = Router();

// Mount keyword scraper routes
router.use('/', keywordScraperRoutes);

export default router;