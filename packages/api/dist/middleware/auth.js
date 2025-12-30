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
exports.generateTokens = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../db/models/User"));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        // Método alternativo: verificar headers personalizados (x-user-id, x-user-email)
        const customUserId = req.headers['x-user-id'];
        const customUserEmail = req.headers['x-user-email'];
        if (!token) {
            // Si hay headers personalizados, buscar usuario y permitir acceso
            if (customUserId && customUserEmail) {
                try {
                    const user = yield User_1.default.findById(customUserId).select('-password');
                    if (user && user.email === customUserEmail) {
                        req.user = user;
                        next();
                        return;
                    }
                }
                catch (error) {
                    console.log('Error buscando usuario por headers personalizados:', error);
                }
            }
            res.status(401).json({ error: 'Token de acceso requerido' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Error en autenticación:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});
exports.authenticateToken = authenticateToken;
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
