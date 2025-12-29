import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../db/models/User';
import { authenticateToken, generateTokens, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'El usuario ya existe' });
      return;
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new User({
      email,
      password,
      name,
      verificationToken,
      isVerified: false
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id as string);

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
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
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
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id as string);

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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { name, email } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        res.status(400).json({ error: 'El email ya está en uso' });
        return;
      }
      updates.email = email;
      updates.isVerified = false; // Reset verification if email changes
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

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
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token requerido' });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user._id as string);

    res.json({
      message: 'Token renovado exitosamente',
      ...tokens
    });
  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Send password reset
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email es requerido' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    // In a real app, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
  } catch (error) {
    console.error('Error enviando reset password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Confirm password reset
router.post('/reset-password/confirm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
      return;
    }

    const user = await User.findOne({
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

    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error confirmando reset password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token de verificación requerido' });
      return;
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      res.status(400).json({ error: 'Token de verificación inválido' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    console.error('Error verificando email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;