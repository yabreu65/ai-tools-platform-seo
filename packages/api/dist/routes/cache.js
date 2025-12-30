"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cache_1 = require("../utils/cache");
const router = express_1.default.Router();
// Obtener estadísticas del cache
router.get('/stats', (req, res) => {
    const stats = cache_1.cache.getStats();
    res.json(Object.assign(Object.assign({}, stats), { timestamp: new Date().toISOString() }));
});
// Limpiar cache
router.delete('/clear', (req, res) => {
    cache_1.cache.clear();
    res.json({
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
