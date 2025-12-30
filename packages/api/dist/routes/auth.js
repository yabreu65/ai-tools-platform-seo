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
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../db/models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Register
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email y contraseña son requeridos' });
            return;
        }
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'El usuario ya existe' });
            return;
        }
        // Create verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Create user
        const user = new User_1.default({
            email,
            password,
            name,
            verificationToken,
            isVerified: false
        });
        yield user.save();
        // Generate tokens
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user._id);
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email y contraseña son requeridos' });
            return;
        }
        // Find user
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        // Debug logs
        console.log('🔍 DEBUG LOGIN - Usuario encontrado:');
        console.log('- ID:', user._id);
        console.log('- Email:', user.email);
        console.log('- Name:', user.name);
        console.log('- isVerified (raw):', user.isVerified);
        console.log('- isVerified (type):', typeof user.isVerified);
        console.log('- isVerified (boolean):', Boolean(user.isVerified));
        // Check password
        const isValidPassword = yield user.comparePassword(password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        // Generate tokens
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user._id);
        console.log('✅ DEBUG LOGIN - Enviando respuesta con isVerified:', user.isVerified);
        res.json({
            message: 'Login exitoso',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Get current user
router.get('/me', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                isVerified: req.user.isVerified
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Update profile
router.put('/profile', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }
        const { name, email } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (email !== undefined) {
            // Check if email is already taken
            const existingUser = yield User_1.default.findOne({ email, _id: { $ne: req.user._id } });
            if (existingUser) {
                res.status(400).json({ error: 'El email ya está en uso' });
                return;
            }
            updates.email = email;
            updates.isVerified = false; // Reset verification if email changes
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                isVerified: updatedUser.isVerified
            }
        });
    }
    catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Refresh token
router.post('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token requerido' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = yield User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }
        // Generate new tokens
        const tokens = (0, auth_1.generateTokens)(user._id);
        res.json(Object.assign({ message: 'Token renovado exitosamente' }, tokens));
    }
    catch (error) {
        console.error('Error renovando token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
}));
// Send password reset
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Email es requerido' });
            return;
        }
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not
            res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        yield user.save();
        // In a real app, you would send an email here
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
    }
    catch (error) {
        console.error('Error enviando reset password:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Confirm password reset
router.post('/reset-password/confirm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
            return;
        }
        const user = yield User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) {
            res.status(400).json({ error: 'Token inválido o expirado' });
            return;
        }
        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        res.json({ message: 'Contraseña actualizada exitosamente' });
    }
    catch (error) {
        console.error('Error confirmando reset password:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Verify email
router.post('/verify-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Token de verificación requerido' });
            return;
        }
        const user = yield User_1.default.findOne({ verificationToken: token });
        if (!user) {
            res.status(400).json({ error: 'Token de verificación inválido' });
            return;
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        yield user.save();
        res.json({ message: 'Email verificado exitosamente' });
    }
    catch (error) {
        console.error('Error verificando email:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
exports.default = router;
