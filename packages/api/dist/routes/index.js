"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend-node/routes/index.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const auditor_1 = __importDefault(require("../tools/auditor"));
const duplicateChecker_1 = __importDefault(require("../tools/duplicateChecker"));
const keywords_1 = __importDefault(require("../tools/keywords"));
const optimizadorContenido_1 = __importDefault(require("../tools/optimizadorContenido"));
const optimizadorProfundo_1 = __importDefault(require("../tools/optimizadorProfundo"));
const renombrar_1 = __importDefault(require("../tools/renombrar"));
const robots_checker_1 = __importDefault(require("../tools/robots-checker"));
const sitemap_1 = __importDefault(require("../tools/sitemap"));
const vitals_1 = __importDefault(require("../tools/vitals"));
const broken_links_1 = __importDefault(require("../tools/broken-links"));
const router = express_1.default.Router();
// Authentication routes
router.use('/auth', auth_1.default);
// Tool routes
router.use('/renombrar', renombrar_1.default);
router.use('/keywords', keywords_1.default);
router.use('/duplicados', duplicateChecker_1.default);
router.use('/vitals', vitals_1.default);
router.use('/generador-sitemap', sitemap_1.default);
router.use('/robots-checker', robots_checker_1.default);
router.use('/optimizador', optimizadorContenido_1.default);
router.use('/optimizador-profundo', optimizadorProfundo_1.default);
router.use('/auditor', auditor_1.default);
router.use('/broken-links', broken_links_1.default);
exports.default = router; // 👈 Exportación por defecto
