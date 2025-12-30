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
exports.cache = void 0;
exports.generateCacheKey = generateCacheKey;
exports.withCache = withCache;
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 1000; // Máximo número de elementos en cache
    }
    set(key, data, ttlMinutes = 30) {
        // Limpiar cache si está lleno
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }
        const ttl = ttlMinutes * 60 * 1000; // Convertir minutos a millisegundos
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // Verificar si el item ha expirado
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    has(key) {
        const item = this.cache.get(key);
        if (!item) {
            return false;
        }
        // Verificar si el item ha expirado
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    // Limpiar elementos expirados
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
        // Si aún está lleno, eliminar los elementos más antiguos
        if (this.cache.size >= this.maxSize) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toDelete = entries.slice(0, Math.floor(this.maxSize * 0.2)); // Eliminar 20%
            toDelete.forEach(([key]) => this.cache.delete(key));
        }
    }
    // Obtener estadísticas del cache
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            usage: (this.cache.size / this.maxSize * 100).toFixed(2) + '%'
        };
    }
}
// Instancia global del cache
exports.cache = new MemoryCache();
// Función helper para generar claves de cache
function generateCacheKey(prefix, params) {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
    return `${prefix}:${sortedParams}`;
}
// Middleware para cache automático
function withCache(cacheKey, ttlMinutes = 30) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const key = `${cacheKey}:${JSON.stringify(args)}`;
                // Intentar obtener del cache
                const cached = exports.cache.get(key);
                if (cached) {
                    console.log(`Cache hit for key: ${key}`);
                    return cached;
                }
                // Ejecutar método original
                console.log(`Cache miss for key: ${key}`);
                const result = yield method.apply(this, args);
                // Guardar en cache
                exports.cache.set(key, result, ttlMinutes);
                return result;
            });
        };
    };
}
