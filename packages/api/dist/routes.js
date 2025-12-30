"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend-node/routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const competitor_analysis_1 = __importDefault(require("./routes/competitor-analysis"));
const auditor_1 = __importDefault(require("./tools/auditor"));
const duplicateChecker_1 = __importDefault(require("./tools/duplicateChecker"));
const keywords_1 = __importDefault(require("./tools/keywords"));
const optimizadorContenido_1 = __importDefault(require("./tools/optimizadorContenido"));
const optimizadorProfundo_1 = __importDefault(require("./tools/optimizadorProfundo"));
const index_1 = __importDefault(require("./tools/renombrar/index"));
const robots_checker_1 = __importDefault(require("./tools/robots-checker"));
const sitemap_1 = __importDefault(require("./tools/sitemap"));
const vitals_1 = __importDefault(require("./tools/vitals"));
const routes_1 = __importDefault(require("./tools/imageCompressor/routes"));
const broken_links_1 = __importDefault(require("./tools/broken-links"));
const keyword_scraper_1 = __importDefault(require("./tools/keyword-scraper"));
// Keyword Research Tool routes
const discover_1 = __importDefault(require("./src/routes/keyword-research/discover"));
const difficulty_1 = __importDefault(require("./src/routes/keyword-research/difficulty"));
const trends_1 = __importDefault(require("./src/routes/keyword-research/trends"));
const clustering_1 = __importDefault(require("./src/routes/keyword-research/clustering"));
const serp_1 = __importDefault(require("./src/routes/keyword-research/serp"));
const tracking_1 = __importDefault(require("./src/routes/keyword-research/tracking"));
const reports_1 = __importDefault(require("./src/routes/keyword-research/reports"));
const alerts_1 = __importDefault(require("./src/routes/keyword-research/alerts"));
const router = express_1.default.Router();
// Authentication routes
router.use('/auth', auth_1.default);
// Competitor Analysis routes
router.use('/competitor-analysis', competitor_analysis_1.default);
// Tool routes
router.use('/renombrar', index_1.default);
router.use('/keywords', keywords_1.default);
router.use('/duplicados', duplicateChecker_1.default);
router.use('/vitals', vitals_1.default);
router.use('/generador-sitemap', sitemap_1.default);
router.use('/robots-checker', robots_checker_1.default);
router.use('/optimizador', optimizadorContenido_1.default);
router.use('/optimizador-profundo', optimizadorProfundo_1.default);
router.use('/auditor', auditor_1.default);
router.use('/compresor-imagenes', routes_1.default);
router.use('/broken-links', broken_links_1.default);
router.use('/keyword-scraper', keyword_scraper_1.default);
// Cache management
const cache_1 = __importDefault(require("./routes/cache"));
router.use('/cache', cache_1.default);
// Keyword Research Tool routes
router.use('/keyword-research/discover', discover_1.default);
router.use('/keyword-research/difficulty/analyze', difficulty_1.default);
router.use('/keyword-research/trends/analyze', trends_1.default);
router.use('/keyword-research/clustering/generate', clustering_1.default);
router.use('/keyword-research/serp/analyze', serp_1.default);
router.use('/keyword-research/tracking/setup', tracking_1.default);
router.use('/keyword-research/reports/generate', reports_1.default);
router.use('/keyword-research/alerts/configure', alerts_1.default);
exports.default = router;
