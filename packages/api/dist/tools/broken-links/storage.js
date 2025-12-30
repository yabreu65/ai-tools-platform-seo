"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokenLinkStorage = void 0;
// Simulación de base de datos en memoria para desarrollo
// En producción esto se conectaría a MongoDB/PostgreSQL
class InMemoryStorage {
    constructor() {
        this.analyses = new Map();
        this.brokenLinks = new Map();
        this.crawledPages = new Map();
        this.analysisResults = new Map();
    }
    // Análisis
    saveAnalysis(analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            this.analyses.set(analysis.id, Object.assign({}, analysis));
        });
    }
    getAnalysis(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.analyses.get(analysisId) || null;
        });
    }
    updateAnalysisStatus(analysisId, status, additionalData) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = this.analyses.get(analysisId);
            if (analysis) {
                analysis.status = status;
                if (additionalData) {
                    Object.assign(analysis, additionalData);
                }
                this.analyses.set(analysisId, analysis);
            }
        });
    }
    updateAnalysisProgress(analysisId, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = this.analyses.get(analysisId);
            if (analysis) {
                Object.assign(analysis, progress);
                this.analyses.set(analysisId, analysis);
            }
        });
    }
    // Enlaces rotos
    saveBrokenLink(analysisId, brokenLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const links = this.brokenLinks.get(analysisId) || [];
            links.push(Object.assign(Object.assign({}, brokenLink), { id: `${analysisId}-${links.length}` }));
            this.brokenLinks.set(analysisId, links);
        });
    }
    getBrokenLinks(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.brokenLinks.get(analysisId) || [];
        });
    }
    // Páginas rastreadas
    saveCrawledPage(analysisId, pageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pages = this.crawledPages.get(analysisId) || [];
            pages.push(Object.assign(Object.assign({}, pageData), { id: `${analysisId}-${pages.length}` }));
            this.crawledPages.set(analysisId, pages);
        });
    }
    getCrawledPages(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.crawledPages.get(analysisId) || [];
        });
    }
    // Resultados
    saveAnalysisResults(analysisId, results) {
        return __awaiter(this, void 0, void 0, function* () {
            this.analysisResults.set(analysisId, results);
        });
    }
    getAnalysisResults(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.analysisResults.get(analysisId) || null;
        });
    }
    getAllAnalyses() {
        return Array.from(this.analyses.values());
    }
}
class BrokenLinkStorage {
    constructor() {
        this.storage = new InMemoryStorage();
    }
    saveAnalysis(analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.saveAnalysis(analysis);
        });
    }
    getAnalysis(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.getAnalysis(analysisId);
        });
    }
    updateAnalysisStatus(analysisId, status, additionalData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.updateAnalysisStatus(analysisId, status, additionalData);
        });
    }
    updateAnalysisProgress(analysisId, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.updateAnalysisProgress(analysisId, progress);
        });
    }
    saveBrokenLink(analysisId, brokenLink) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.saveBrokenLink(analysisId, brokenLink);
        });
    }
    saveCrawledPage(analysisId, pageData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.saveCrawledPage(analysisId, pageData);
        });
    }
    saveAnalysisResults(analysisId, results) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.saveAnalysisResults(analysisId, results);
        });
    }
    getAnalysisStatus(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield this.storage.getAnalysis(analysisId);
            if (!analysis)
                return null;
            return {
                analysisId: analysis.id,
                status: analysis.status,
                progress: analysis.progress || 0,
                pagesAnalyzed: analysis.pagesAnalyzed || 0,
                linksFound: analysis.linksFound || 0,
                brokenLinks: analysis.brokenLinks || 0,
                startedAt: analysis.startedAt,
                completedAt: analysis.completedAt,
                error: analysis.error
            };
        });
    }
    getAnalysisResults(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const analysis = yield this.storage.getAnalysis(analysisId);
            const results = yield this.storage.getAnalysisResults(analysisId);
            const brokenLinks = yield this.storage.getBrokenLinks(analysisId);
            if (!analysis || !results)
                return null;
            return {
                summary: {
                    totalPages: ((_a = results.summary) === null || _a === void 0 ? void 0 : _a.totalPages) || 0,
                    totalLinks: ((_b = results.summary) === null || _b === void 0 ? void 0 : _b.totalLinks) || 0,
                    brokenLinks: brokenLinks.length,
                    healthScore: this.calculateHealthScore(((_c = results.summary) === null || _c === void 0 ? void 0 : _c.totalLinks) || 0, brokenLinks.length),
                    analysisTime: ((_d = results.summary) === null || _d === void 0 ? void 0 : _d.analysisTime) || 0
                },
                brokenLinks: brokenLinks.map(link => ({
                    sourceUrl: link.sourceUrl,
                    targetUrl: link.targetUrl,
                    statusCode: link.statusCode,
                    errorType: link.errorType,
                    linkType: link.linkType
                })),
                recommendations: results.recommendations || []
            };
        });
    }
    getAnalysisHistory(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            // Filtrar análisis por usuario (en desarrollo usamos todos)
            const allAnalyses = this.storage.getAllAnalyses()
                .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedAnalyses = allAnalyses.slice(startIndex, endIndex);
            return {
                analyses: paginatedAnalyses.map((analysis) => ({
                    id: analysis.id,
                    url: analysis.url,
                    status: analysis.status,
                    startedAt: analysis.startedAt,
                    completedAt: analysis.completedAt,
                    summary: {
                        totalPages: analysis.pagesAnalyzed || 0,
                        brokenLinks: analysis.brokenLinks || 0
                    }
                })),
                total: allAnalyses.length,
                page,
                totalPages: Math.ceil(allAnalyses.length / limit)
            };
        });
    }
    calculateHealthScore(totalLinks, brokenLinks) {
        if (totalLinks === 0)
            return 100;
        return Math.max(0, Math.round(((totalLinks - brokenLinks) / totalLinks) * 100));
    }
    deleteAnalysis(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield this.storage.getAnalysis(analysisId);
            if (!analysis)
                return false;
            // En una implementación real, esto eliminaría de la base de datos
            return true;
        });
    }
}
exports.BrokenLinkStorage = BrokenLinkStorage;
