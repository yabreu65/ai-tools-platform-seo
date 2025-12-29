
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/registro'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
  
  console.log('🔍 Middleware Debug:', {
    pathname,
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenLength: token?.length,
    JWT_SECRET: JWT_SECRET.substring(0, 10) + '...'
  });
  
  let isAuthenticated = false;
  
  let shouldClearToken = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      isAuthenticated = true;
      console.log('✅ Token válido:', payload);
    } catch (error) {
      // Token is invalid or expired - mark for deletion
      isAuthenticated = false;
      shouldClearToken = true;
      console.log('❌ Token inválido (será eliminado):', error);
    }
  } else {
    console.log('❌ No se encontró token');
  }

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Clear invalid token cookie
  if (shouldClearToken) {
    console.log('🧹 Eliminando cookie de token inválido');

    // If trying to access protected route, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set('auth_token', '', {
        maxAge: 0,
        path: '/',
      });
      return redirectResponse;
    }

    const response = NextResponse.next();
    response.cookies.set('auth_token', '', {
      maxAge: 0,
      path: '/',
    });
    return response;
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add user info to headers for API routes
  if (isAuthenticated && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-email', payload.email as string);
      requestHeaders.set('x-user-plan', payload.plan as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Continue without user headers if token is invalid
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/registro',
    '/api/auth/:path*',
    '/api/analysis/:path*',
    '/api/user/:path*'
  ]
};
