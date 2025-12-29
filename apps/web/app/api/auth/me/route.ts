import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
      message: 'Usuario autenticado'
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}