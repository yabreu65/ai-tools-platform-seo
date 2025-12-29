import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token requerido' },
        { status: 400 }
      );
    }

    // Use AuthService to refresh token
    const result = await AuthService.refreshToken(refreshToken);

    // Set cookies
    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      message: 'Token renovado exitosamente'
    });

    // Set HTTP-only cookie for new token
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}