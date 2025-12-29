import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../db/models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Método alternativo: verificar headers personalizados (x-user-id, x-user-email)
    const customUserId = req.headers['x-user-id'] as string;
    const customUserEmail = req.headers['x-user-email'] as string;

    if (!token) {
      // Si hay headers personalizados, buscar usuario y permitir acceso
      if (customUserId && customUserEmail) {
        try {
          const user = await User.findById(customUserId).select('-password');
          if (user && user.email === customUserEmail) {
            req.user = user;
            next();
            return;
          }
        } catch (error) {
          console.log('Error buscando usuario por headers personalizados:', error);
        }
      }

      res.status(401).json({ error: 'Token de acceso requerido' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};