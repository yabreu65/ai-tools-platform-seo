'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { FileText, Shield, Search, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function GeneradorRobotsPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [robotsData, setRobotsData] = useState<{
    status: 'ok' | 'missing' | 'invalid';
    message: string;
    content?: string;
  } | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setRobotsData(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // Agregar headers de autenticación si el usuario está logueado
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-email'] = user.email;
        headers['x-user-plan'] = user.plan || 'free';
      }

      const response = await fetch('http://localhost:3001/api/robots-checker', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido desde el backend');
      }

      setRobotsData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!robotsData) return '';
    switch (robotsData.status) {
      case 'ok': return 'from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30';
      case 'missing': return 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30';
      case 'invalid': return 'from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30';
      default: return '';
    }
  };

  const getStatusIcon = () => {
    if (!robotsData) return null;
    switch (robotsData.status) {
      case 'ok': return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'missing': return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'invalid': return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      default: return null;
    }
  };

  const getStatusTextColor = () => {
    if (!robotsData) return '';
    switch (robotsData.status) {
      case 'ok': return 'text-green-700 dark:text-green-300';
      case 'missing': return 'text-amber-700 dark:text-amber-300';
      case 'invalid': return 'text-red-700 dark:text-red-300';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <HomeFloatingButton />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Generador de Robots.txt
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Verifica y genera archivos robots.txt para optimizar el SEO técnico de tu sitio web.
            </p>
          </motion.div>
        </div>

        {!robotsData && (
          <>
            {/* Main Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl text-slate-900 dark:text-white flex items-center gap-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                    Auditoría de Robots.txt
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Ingresa la URL de tu sitio web para verificar el estado de tu archivo robots.txt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-slate-700 dark:text-slate-300 font-medium">
                        URL del sitio web *
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://tuweb.com"
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>

                    {error && (
                      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                              Error: {error}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      onClick={handleCheck}
                      disabled={loading || !url.trim()}
                      size="xl"
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verificando archivo...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Auditar archivo Robots.txt
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white mb-2">
                    ¿Qué hace esta herramienta?
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Revisa si ya tenés un archivo robots.txt, muestra su contenido y genera uno nuevo si es necesario.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white mb-2">
                    ¿Por qué es importante?
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Controlar qué rastrean los bots mejora el SEO técnico y protege secciones sensibles de tu web.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white mb-2">
                    ¿Para quién es útil?
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Ideal para desarrolladores, SEOs y dueños de sitios que quieren tener mayor control sobre la indexación.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Results Section */}
        {robotsData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <Card className={`shadow-xl border-0 backdrop-blur-sm bg-gradient-to-br ${getStatusColor()}`}>
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-2">
                  <Image src="/logo/logo_blue.png" alt="Logo YA" width={40} height={40} className="dark:hidden" />
                  <Image src="/logo/logo_white.png" alt="Logo YA Dark" width={40} height={40} className="hidden dark:block" />
                  <CardTitle className={`text-2xl flex items-center gap-3 ${getStatusTextColor()}`}>
                    {getStatusIcon()}
                    {robotsData.status === 'ok' ? 'Archivo válido encontrado' : 'Generación de nuevo robots.txt'}
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {robotsData.message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {robotsData.content && (
                  <div className="space-y-4">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">
                      Contenido del archivo robots.txt:
                    </Label>
                    <Textarea
                      readOnly
                      value={robotsData.content}
                      className="h-60 font-mono text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => {
                      setRobotsData(null);
                      setUrl('');
                      setError(null);
                    }}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/30"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Verificar otro sitio
                  </Button>

                  <Link href="/" passHref legacyBehavior>
                    <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                      <a>
                        <span className="mr-2">🏠</span>
                        Volver al inicio
                      </a>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
