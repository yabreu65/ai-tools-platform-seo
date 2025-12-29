'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  useEffect(() => {
    console.log('🔍 LoginPage: Auth state changed', { isAuthenticated, isLoading, redirectTo });
    if (isAuthenticated && !isLoading) {
      console.log('🚀 LoginPage: User is authenticated, redirecting to', redirectTo);
      router.push(redirectTo);
    } else if (!isAuthenticated && !isLoading) {
      console.log('❌ LoginPage: User not authenticated, staying on login page');
    } else if (isLoading) {
      console.log('⏳ LoginPage: Auth state loading...');
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const onSubmit = async (data: LoginFormData) => {
    console.log('📝 LoginPage: Form submitted', { email: data.email, redirectTo });
    const success = await login(data);
    console.log('📝 LoginPage: Login result', success);
    if (success) {
      console.log('✅ LoginPage: Login successful, redirecting to', redirectTo);
      router.push(redirectTo);
    } else {
      console.log('❌ LoginPage: Login failed, staying on login page');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const breadcrumbSchema = {
    breadcrumb: [
      {
        name: "Inicio",
        url: "https://yatools.app"
      },
      {
        name: "Iniciar Sesión",
        url: "https://yatools.app/login"
      }
    ]
  }

  return (
    <>
      <SEOHead
        title="Iniciar Sesión - YA Tools | Accede a tus Herramientas SEO"
        description="Inicia sesión en YA Tools para acceder a tu dashboard personalizado y utilizar todas las herramientas SEO profesionales. Acceso seguro y rápido a tu cuenta."
        keywords="iniciar sesión, login, acceso cuenta, dashboard SEO, herramientas SEO, YA Tools"
        canonical="https://yatools.app/login"
        type="website"
        image="https://yatools.app/og-login.jpg"
        imageAlt="Iniciar Sesión en YA Tools"
        robots="noindex, nofollow"
      />
      <SchemaMarkup {...breadcrumbSchema} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Accede a tu cuenta para continuar usando YA Tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Recordarme
                  </Label>
                </div>
                <Link
                  href="/recuperar-password"
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link
                  href="/registro"
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
}