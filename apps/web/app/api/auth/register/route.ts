import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Use AuthService to register user
    const result = await AuthService.register(email, password, name);

    // Set cookies
    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      message: 'Usuario registrado exitosamente'
    });

    // Set HTTP-only cookie for token
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}