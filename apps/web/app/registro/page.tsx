'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft, 
  Check, 
  X, 
  Mail, 
  Lock, 
  User, 
  Shield,
  Github,
  Chrome,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Gift,
  Bell
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/seo/SEOHead';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

// Tipos para las mejoras
interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

interface EmailValidation {
  isValid: boolean;
  isAvailable: boolean | null;
  isChecking: boolean;
  message: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({
    isValid: false,
    isAvailable: null,
    isChecking: false,
    message: ''
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: '',
    color: 'bg-gray-200'
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formAutoSave, setFormAutoSave] = useState<Partial<RegisterFormData>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    setValue,
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      newsletter: false,
      referralCode: '',
    } as RegisterFormData,
  });

  const watchedFields = watch(['password', 'email']);
  const { name, email, password, confirmPassword, acceptTerms, newsletter, referralCode } = watch();

  // Auto-save form data
  useEffect(() => {
    const autoSaveData = { name, email, referralCode, newsletter };
    setFormAutoSave(autoSaveData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('registerFormAutoSave', JSON.stringify(autoSaveData));
    }
  }, [name, email, referralCode, newsletter]);

  // Load auto-saved data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('registerFormAutoSave');
      if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (data[key]) {
            setValue(key as keyof RegisterFormData, data[key]);
          }
        });
      }
    }
  }, [setValue]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Validación de fortaleza de contraseña mejorada
  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) return { score: 0, feedback: '', color: 'bg-gray-200' };

    let score = 0;
    let feedback = '';

    // Criterios de fortaleza
    const criteria = [
      { test: /.{8,}/, points: 25, message: 'Al menos 8 caracteres' },
      { test: /[A-Z]/, points: 25, message: 'Letra mayúscula' },
      { test: /[a-z]/, points: 25, message: 'Letra minúscula' },
      { test: /\d/, points: 15, message: 'Número' },
      { test: /[^A-Za-z0-9]/, points: 10, message: 'Carácter especial' }
    ];

    criteria.forEach(criterion => {
      if (criterion.test.test(password)) {
        score += criterion.points;
      }
    });

    // Feedback y color basado en el puntaje
    if (score < 50) {
      feedback = 'Contraseña débil';
      return { score, feedback, color: 'bg-red-500' };
    } else if (score < 75) {
      feedback = 'Contraseña moderada';
      return { score, feedback, color: 'bg-yellow-500' };
    } else if (score < 90) {
      feedback = 'Contraseña fuerte';
      return { score, feedback, color: 'bg-blue-500' };
    } else {
      feedback = 'Contraseña muy fuerte';
      return { score, feedback, color: 'bg-green-500' };
    }
  }, []);

  // Validación de email en tiempo real
  const validateEmailAvailability = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailValidation({
        isValid: false,
        isAvailable: null,
        isChecking: false,
        message: email ? 'Formato de email inválido' : ''
      });
      return;
    }

    setEmailValidation(prev => ({ ...prev, isChecking: true, message: 'Verificando disponibilidad...' }));

    try {
      // Simular verificación de email (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulación: emails que terminan en @test.com no están disponibles
      const isAvailable = !email.endsWith('@test.com');
      
      setEmailValidation({
        isValid: true,
        isAvailable,
        isChecking: false,
        message: isAvailable ? 'Email disponible' : 'Este email ya está registrado'
      });
    } catch (error) {
      setEmailValidation({
        isValid: true,
        isAvailable: null,
        isChecking: false,
        message: 'Error al verificar email'
      });
    }
  }, []);

  // Efectos para validaciones en tiempo real
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password || ''));
  }, [password, calculatePasswordStrength]);

  useEffect(() => {
    if (email && touchedFields.email) {
      const timeoutId = setTimeout(() => {
        validateEmailAvailability(email);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [email, touchedFields.email, validateEmailAvailability]);

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitAttempted(true);
    
    // Verificar que el email esté disponible
    if (emailValidation.isAvailable === false) {
      return;
    }

    const success = await registerUser(data);
    if (success) {
      // Limpiar auto-save
      if (typeof window !== 'undefined') {
        localStorage.removeItem('registerFormAutoSave');
      }
      // Redirigir a la página de selección de planes después del registro exitoso
      router.push('/seleccionar-plan');
    }
  };

  const passwordRequirements = [
    { text: 'Al menos 8 caracteres', met: (password?.length || 0) >= 8 },
    { text: 'Una letra mayúscula', met: /[A-Z]/.test(password || '') },
    { text: 'Una letra minúscula', met: /[a-z]/.test(password || '') },
    { text: 'Un número', met: /\d/.test(password || '') },
    { text: 'Un carácter especial', met: /[^A-Za-z0-9]/.test(password || '') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  const registerSchemaMarkup = {
    breadcrumb: [
      {
        name: "Inicio",
        url: "https://yatools.app"
      },
      {
        name: "Crear Cuenta",
        url: "https://yatools.app/registro"
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="Registro - Únete a YA Tools"
        description="Crea tu cuenta gratuita en YA Tools y accede a herramientas SEO profesionales potenciadas por IA. Registro rápido y seguro."
        keywords="registro YA Tools, crear cuenta SEO, herramientas SEO gratis, registro gratuito"
        url="https://yatools.com/registro"
        type="website"
        noindex={false}
        nofollow={false}
      />
      
      <SchemaMarkup 
        website={{
          name: "Registro - YA Tools",
          url: "https://yatools.com/registro",
          description: "Página de registro para acceder a herramientas SEO profesionales"
        }}
        breadcrumb={{
          items: [
            {
              name: "Inicio",
              url: "https://yatools.com"
            },
            {
              name: "Registro",
              url: "https://yatools.com/registro"
            }
          ]
        }}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex items-center justify-center mb-4"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
              <CardDescription>
                Únete a YA Tools y accede a herramientas SEO potenciadas por IA
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Opciones de Login Social */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                    aria-label="Registrarse con Google"
                  >
                    <Chrome className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                    aria-label="Registrarse con GitHub"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                      O continúa con email
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Campo Nombre */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nombre completo</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    aria-invalid={!!errors.name}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        id="name-error"
                        className="text-sm text-red-500 flex items-center space-x-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.name.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Campo Email con validación en tiempo real */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      {...register('email')}
                      className={`${errors.email || emailValidation.isAvailable === false ? 'border-red-500' : emailValidation.isAvailable === true ? 'border-green-500' : ''} pr-10`}
                      aria-describedby="email-validation"
                      aria-invalid={!!errors.email || emailValidation.isAvailable === false}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValidation.isChecking ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : emailValidation.isAvailable === true ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : emailValidation.isAvailable === false ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  <AnimatePresence>
                    {(errors.email || emailValidation.message) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        id="email-validation"
                      >
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.email.message}</span>
                          </p>
                        )}
                        {!errors.email && emailValidation.message && (
                          <p className={`text-sm flex items-center space-x-1 ${
                            emailValidation.isAvailable === true ? 'text-green-600' : 
                            emailValidation.isAvailable === false ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {emailValidation.isAvailable === true ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : emailValidation.isAvailable === false ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            <span>{emailValidation.message}</span>
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Campo Contraseña con indicador de fortaleza */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Contraseña</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      aria-describedby="password-requirements"
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Indicador de fortaleza de contraseña */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Fortaleza de contraseña</span>
                        <span className={`font-medium ${
                          passwordStrength.score < 50 ? 'text-red-500' :
                          passwordStrength.score < 75 ? 'text-yellow-500' :
                          passwordStrength.score < 90 ? 'text-blue-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.feedback}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength.score} 
                        className="h-2"
                      />
                    </motion.div>
                  )}

                  {/* Requisitos de contraseña */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      id="password-requirements"
                      className="space-y-1"
                    >
                      {passwordRequirements.map((req, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <motion.div
                            animate={{ scale: req.met ? 1.1 : 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Check
                              className={`h-3 w-3 ${
                                req.met ? 'text-green-500' : 'text-gray-300'
                              }`}
                            />
                          </motion.div>
                          <span
                            className={req.met ? 'text-green-600' : 'text-gray-500'}
                          >
                            {req.text}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center space-x-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.password.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Campo Confirmar Contraseña */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Confirmar contraseña</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center space-x-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.confirmPassword.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Campo Código de Referido */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="referralCode" className="flex items-center space-x-2">
                    <Gift className="h-4 w-4" />
                    <span>Código de referido (opcional)</span>
                  </Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Ingresa un código de referido"
                    {...register('referralCode')}
                    aria-describedby="referral-help"
                  />
                  <p id="referral-help" className="text-xs text-gray-500">
                    ¿Tienes un código de referido? Ingrésalo para obtener beneficios adicionales.
                  </p>
                </motion.div>

                {/* Suscripción a Newsletter */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start space-x-2"
                >
                  <Checkbox
                    id="newsletter"
                    checked={newsletter}
                    onCheckedChange={(checked) => setValue('newsletter', !!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="newsletter" className="text-sm leading-5 flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Quiero recibir actualizaciones y consejos SEO por email</span>
                  </Label>
                </motion.div>

                {/* Términos y Condiciones */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
                      className="mt-1"
                      aria-describedby="terms-error"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-5">
                      Acepto los{' '}
                      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                          >
                            términos y condiciones
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Términos y Condiciones</DialogTitle>
                            <DialogDescription>
                              Por favor, lee cuidadosamente nuestros términos y condiciones.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <p>Al crear una cuenta en YA Tools, aceptas los siguientes términos:</p>
                            <ul className="list-disc list-inside space-y-2">
                              <li>Usar la plataforma de manera responsable y legal</li>
                              <li>No compartir tu cuenta con terceros</li>
                              <li>Respetar los límites de uso de tu plan</li>
                              <li>No usar la plataforma para actividades maliciosas</li>
                            </ul>
                            <p>Nos reservamos el derecho de suspender cuentas que violen estos términos.</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {' '}y la{' '}
                      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                          >
                            política de privacidad
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Política de Privacidad</DialogTitle>
                            <DialogDescription>
                              Información sobre cómo manejamos tus datos personales.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <p>En YA Tools, protegemos tu privacidad:</p>
                            <ul className="list-disc list-inside space-y-2">
                              <li>Solo recopilamos datos necesarios para el servicio</li>
                              <li>No vendemos ni compartimos tu información personal</li>
                              <li>Usamos encriptación para proteger tus datos</li>
                              <li>Puedes solicitar la eliminación de tu cuenta en cualquier momento</li>
                            </ul>
                            <p>Para más detalles, contacta nuestro equipo de soporte.</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Label>
                  </div>
                  <AnimatePresence>
                    {errors.acceptTerms && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        id="terms-error"
                        className="text-sm text-red-500 flex items-center space-x-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.acceptTerms.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Botón de Envío */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || emailValidation.isAvailable === false}
                    aria-describedby="submit-help"
                  >
                    {isSubmitting ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creando cuenta...</span>
                      </motion.div>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </Button>
                  <p id="submit-help" className="text-xs text-gray-500 mt-2 text-center">
                    Al crear tu cuenta, recibirás un email de confirmación.
                  </p>
                </motion.div>
              </form>

              {/* Enlaces adicionales */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver al inicio
                  </Link>
                </div>
              </motion.div>

              {/* Información de seguridad */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Tu información está protegida con encriptación de nivel bancario. 
                    Nunca compartimos tus datos con terceros.
                  </AlertDescription>
                </Alert>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}