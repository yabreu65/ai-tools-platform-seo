"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnalysisRequest = validateAnalysisRequest;
exports.validateUrl = validateUrl;
exports.validateExportFormat = validateExportFormat;
exports.sanitizeUrl = sanitizeUrl;
exports.validatePlanLimits = validatePlanLimits;
function validateAnalysisRequest(request) {
    const errors = [];
    // Validar URL
    if (!request.url) {
        errors.push('La URL es requerida');
    }
    else {
        try {
            const url = new URL(request.url);
            if (!['http:', 'https:'].includes(url.protocol)) {
                errors.push('La URL debe usar protocolo HTTP o HTTPS');
            }
        }
        catch (_a) {
            errors.push('La URL proporcionada no es válida');
        }
    }
    // Validar profundidad
    if (typeof request.depth !== 'number') {
        errors.push('La profundidad debe ser un número');
    }
    else if (request.depth < 1 || request.depth > 10) {
        errors.push('La profundidad debe estar entre 1 y 10 niveles');
    }
    // Validar rutas de exclusión
    if (!Array.isArray(request.excludePaths)) {
        errors.push('Las rutas de exclusión deben ser un array');
    }
    else {
        const invalidPaths = request.excludePaths.filter(path => typeof path !== 'string' || !path.startsWith('/'));
        if (invalidPaths.length > 0) {
            errors.push('Las rutas de exclusión deben ser strings que comiencen con "/"');
        }
    }
    // Validar includeExternal
    if (typeof request.includeExternal !== 'boolean') {
        errors.push('includeExternal debe ser un valor booleano');
    }
    // Validar timeout
    if (typeof request.timeout !== 'number') {
        errors.push('El timeout debe ser un número');
    }
    else if (request.timeout < 1000 || request.timeout > 30000) {
        errors.push('El timeout debe estar entre 1000ms y 30000ms');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function validateUrl(url) {
    const errors = [];
    if (!url) {
        errors.push('La URL es requerida');
        return { isValid: false, errors };
    }
    try {
        const urlObj = new URL(url);
        // Verificar protocolo
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.push('Solo se permiten URLs con protocolo HTTP o HTTPS');
        }
        // Verificar que no sea localhost en producción
        if (process.env.NODE_ENV === 'production') {
            const localhostPatterns = [
                'localhost',
                '127.0.0.1',
                '0.0.0.0',
                '::1'
            ];
            if (localhostPatterns.some(pattern => urlObj.hostname.includes(pattern))) {
                errors.push('No se pueden analizar URLs de localhost en producción');
            }
        }
        // Verificar que no sea una IP privada
        const privateIpPatterns = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./
        ];
        if (privateIpPatterns.some(pattern => pattern.test(urlObj.hostname))) {
            errors.push('No se pueden analizar IPs privadas');
        }
    }
    catch (_a) {
        errors.push('La URL proporcionada no es válida');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function validateExportFormat(format, userPlan) {
    const errors = [];
    const allowedFormats = ['csv', 'pdf'];
    if (!allowedFormats.includes(format.toLowerCase())) {
        errors.push(`Formato no soportado: ${format}. Formatos permitidos: ${allowedFormats.join(', ')}`);
    }
    // Verificar permisos de plan para PDF
    if (format.toLowerCase() === 'pdf') {
        const plansWithPDF = ['pro', 'enterprise'];
        if (!plansWithPDF.includes(userPlan.toLowerCase())) {
            errors.push('La exportación PDF requiere plan Pro o Enterprise');
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function sanitizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // Remover fragmentos y parámetros de consulta innecesarios
        urlObj.hash = '';
        // Normalizar la URL
        let cleanUrl = urlObj.toString();
        // Remover trailing slash si no es la raíz
        if (cleanUrl.endsWith('/') && urlObj.pathname !== '/') {
            cleanUrl = cleanUrl.slice(0, -1);
        }
        return cleanUrl;
    }
    catch (_a) {
        return url; // Retornar original si no se puede parsear
    }
}
function validatePlanLimits(userPlan, requestedDepth) {
    const errors = [];
    const planLimits = {
        free: { maxDepth: 2, maxUrls: 100 },
        pro: { maxDepth: 5, maxUrls: 5000 },
        enterprise: { maxDepth: 10, maxUrls: Infinity }
    };
    const limits = planLimits[userPlan.toLowerCase()];
    if (!limits) {
        errors.push('Plan de usuario no válido');
        return { isValid: false, errors };
    }
    if (requestedDepth > limits.maxDepth) {
        errors.push(`Tu plan ${userPlan} permite máximo ${limits.maxDepth} niveles de profundidad`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
