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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = exports.checkPlanLimits = exports.requireSeoAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../db/models/User"));
// Límites por plan
const PLAN_LIMITS = {
    free: {
        maxUrlsPerAnalysis: 100,
        maxConcurrentAnalyses: 1,
        maxDepth: 3,
        exportFormats: ['xml', 'txt'],
        monthlyAnalyses: 10
    },
    pro: {
        maxUrlsPerAnalysis: 5000,
        maxConcurrentAnalyses: 5,
        maxDepth: 10,
        exportFormats: ['xml', 'txt', 'csv'],
        monthlyAnalyses: 500
    },
    enterprise: {
        maxUrlsPerAnalysis: -1, // Ilimitado
        maxConcurrentAnalyses: 20,
        maxDepth: 20,
        exportFormats: ['xml', 'txt', 'csv', 'json'],
        monthlyAnalyses: -1 // Ilimitado
    }
};
exports.PLAN_LIMITS = PLAN_LIMITS;
// Middleware de autenticación para herramientas SEO
const requireSeoAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        // Método alternativo: verificar headers personalizados (x-user-id, x-user-email, x-user-plan)
        const customUserId = req.headers['x-user-id'];
        const customUserEmail = req.headers['x-user-email'];
        const customUserPlan = req.headers['x-user-plan'] || 'free';
        // DEBUG: Log para ver qué está recibiendo
        console.log('🔍 DEBUG seoAuth:', {
            hasToken: !!token,
            hasCustomUserId: !!customUserId,
            hasCustomUserEmail: !!customUserEmail,
            customUserPlan,
            authHeader,
            allHeaders: req.headers
        });
        if (!token) {
            // Si hay headers personalizados, usarlos
            if (customUserId && customUserEmail) {
                const userPlan = customUserPlan;
                req.user = {
                    id: customUserId,
                    email: customUserEmail,
                    name: customUserEmail.split('@')[0],
                    plan: userPlan,
                    isVerified: true,
                    planLimits: PLAN_LIMITS[userPlan]
                };
                next();
                return;
            }
            // Para desarrollo, usar usuario simulado si no hay token ni headers
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    id: 'dev-user-123',
                    email: 'dev@example.com',
                    name: 'Developer User',
                    plan: 'pro',
                    isVerified: true,
                    planLimits: PLAN_LIMITS.pro
                };
                next();
                return;
            }
            res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
            return;
        }
        // Determinar el plan del usuario (por defecto free si no está definido)
        const userPlan = user.plan || 'free';
        req.user = {
            id: String(user._id),
            email: user.email,
            name: user.name || '',
            plan: userPlan,
            isVerified: user.isVerified || false,
            planLimits: PLAN_LIMITS[userPlan]
        };
        next();
    }
    catch (error) {
        console.error('Error en autenticación SEO:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }
});
exports.requireSeoAuth = requireSeoAuth;
// Middleware para verificar límites del plan
const checkPlanLimits = (requiredFeature) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
            return;
        }
        const { plan, planLimits } = authReq.user;
        switch (requiredFeature) {
            case 'depth':
                const requestedDepth = parseInt(req.body.depth || req.query.depth) || 3;
                if (planLimits.maxDepth !== -1 && requestedDepth > planLimits.maxDepth) {
                    res.status(403).json({
                        success: false,
                        error: 'Límite de profundidad excedido',
                        details: {
                            requested: requestedDepth,
                            allowed: planLimits.maxDepth,
                            plan: plan,
                            upgrade: plan === 'free' ? 'pro' : 'enterprise'
                        }
                    });
                    return;
                }
                break;
            case 'export':
                const requestedFormat = req.body.format || req.query.format;
                if (requestedFormat && !planLimits.exportFormats.includes(requestedFormat)) {
                    res.status(403).json({
                        success: false,
                        error: 'Formato de exportación no permitido',
                        details: {
                            requested: requestedFormat,
                            allowed: planLimits.exportFormats,
                            plan: plan,
                            upgrade: plan === 'free' ? 'pro' : 'enterprise'
                        }
                    });
                    return;
                }
                break;
        }
        next();
    };
};
exports.checkPlanLimits = checkPlanLimits;
