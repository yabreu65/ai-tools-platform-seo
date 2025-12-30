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
const express_1 = require("express");
const service_1 = require("./service");
const validators_1 = require("./validators");
const router = (0, express_1.Router)();
const brokenLinkService = new service_1.BrokenLinkService();
// Middleware de autenticación simulado para desarrollo
const requireAuth = (req, res, next) => {
    // Simulación de usuario autenticado
    req.user = {
        id: 'user-123',
        email: 'test@example.com',
        plan: 'pro',
        planLimits: {
            maxUrlsPerAnalysis: 5000,
            maxConcurrentAnalyses: 5,
            exportFormats: ['csv', 'pdf']
        }
    };
    next();
};
// POST /api/broken-links/analyze - Iniciar análisis de enlaces rotos
router.post('/analyze', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        // Validar datos de entrada
        const validation = (0, validators_1.validateAnalysisRequest)(req.body);
        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                error: 'Datos de entrada inválidos',
                details: validation.errors
            });
            return;
        }
        const { url, depth = 3, includeExternal = false, excludePaths = [] } = req.body;
        // Validar URL
        const urlValidation = (0, validators_1.validateUrl)(url);
        if (!urlValidation.isValid) {
            res.status(400).json({
                success: false,
                error: 'URL inválida',
                details: urlValidation.errors
            });
            return;
        }
        // Validar límites del plan
        const planValidation = (0, validators_1.validatePlanLimits)(authReq.user.plan, depth);
        if (!planValidation.isValid) {
            res.status(403).json({
                success: false,
                error: 'Límites del plan excedidos',
                details: planValidation.errors
            });
            return;
        }
        // Crear análisis
        const analysisId = yield brokenLinkService.createAnalysis({
            url,
            depth,
            includeExternal,
            excludePaths,
            userId: authReq.user.id,
            userPlan: authReq.user.plan
        });
        // Iniciar análisis asíncrono
        brokenLinkService.startAnalysis(analysisId).catch(console.error);
        res.status(201).json({
            success: true,
            data: {
                analysisId,
                status: 'iniciado',
                message: 'Análisis iniciado correctamente'
            }
        });
    }
    catch (error) {
        console.error('Error al iniciar análisis:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
// GET /api/broken-links/analyze/:analysisId - Obtener estado del análisis
router.get('/analyze/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { analysisId } = req.params;
        const status = yield brokenLinkService.getAnalysisStatus(analysisId);
        if (!status) {
            res.status(404).json({
                success: false,
                error: 'Análisis no encontrado'
            });
            return;
        }
        res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        console.error('Error al obtener estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
// GET /api/broken-links/results/:analysisId - Obtener resultados del análisis
router.get('/results/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { analysisId } = req.params;
        const results = yield brokenLinkService.getAnalysisResults(analysisId);
        if (!results) {
            res.status(404).json({
                success: false,
                error: 'Resultados no encontrados'
            });
            return;
        }
        res.json({
            success: true,
            data: results
        });
    }
    catch (error) {
        console.error('Error al obtener resultados:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
// GET /api/broken-links/export/:analysisId - Exportar resultados
router.get('/export/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { analysisId } = req.params;
        const { format = 'csv' } = req.query;
        // Validar formato de exportación
        const formatValidation = (0, validators_1.validateExportFormat)(format, authReq.user.plan);
        if (!formatValidation.isValid) {
            res.status(403).json({
                success: false,
                error: 'Formato de exportación no permitido',
                details: formatValidation.errors
            });
            return;
        }
        const results = yield brokenLinkService.getAnalysisResults(analysisId);
        if (!results) {
            res.status(404).json({
                success: false,
                error: 'Resultados no encontrados'
            });
            return;
        }
        // Generar archivo de exportación
        const exportData = yield brokenLinkService.exportResults(analysisId, format);
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="broken-links-${analysisId}.csv"`);
        }
        else if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="broken-links-${analysisId}.pdf"`);
        }
        res.send(exportData);
    }
    catch (error) {
        console.error('Error al exportar resultados:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
// GET /api/broken-links/history - Obtener historial de análisis
router.get('/history', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const history = yield brokenLinkService.getAnalysisHistory(authReq.user.id, page, limit);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
// DELETE /api/broken-links/analyze/:analysisId - Cancelar análisis
router.delete('/analyze/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { analysisId } = req.params;
        const status = yield brokenLinkService.getAnalysisStatus(analysisId);
        if (!status) {
            res.status(404).json({
                success: false,
                error: 'Análisis no encontrado'
            });
            return;
        }
        // Solo se puede cancelar si está en progreso
        if (!['pending', 'running'].includes(status.status)) {
            res.status(400).json({
                success: false,
                error: 'El análisis no se puede cancelar en su estado actual'
            });
            return;
        }
        yield brokenLinkService.cancelAnalysis(analysisId);
        res.json({
            success: true,
            message: 'Análisis cancelado correctamente'
        });
    }
    catch (error) {
        console.error('Error al cancelar análisis:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
// GET /api/broken-links/health - Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'broken-links-checker',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
