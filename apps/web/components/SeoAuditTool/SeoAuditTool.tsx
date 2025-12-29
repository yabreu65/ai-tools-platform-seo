"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HomeFloatingButton from '../inicio-comun/HomeFloatingButton';

interface SeoResultBasic {
  mode: 'basic';
  title?: string;
  description?: string;
  h1?: string;
  canonical?: string;
  imagesWithoutAlt?: number;
}

interface SeoResultDeep {
  mode: 'deep';
  loadTime?: number;
  hasH1?: boolean;
  hasTitle?: boolean;
  screenshot?: string;
  totalRequests?: number;
  totalBytes?: number;
  scriptCount?: number;
 
  hasMetaDescription?: boolean;
}

type SeoResult = SeoResultBasic | SeoResultDeep;

export default function SeoAuditTool() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'basic' | 'deep'>('basic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);




    try {
      const response = await fetch(`http://localhost:3001/api/auditor?url=${encodeURIComponent(url)}&mode=${mode}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error desconocido');
      setResult({ ...data, mode });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function calcularScoreSEO(result: SeoResult): number {
    if (result.mode !== 'basic') return 0;
    let score = 0;
    if (result.title) score += 20;
    if (result.description) score += 20;
    const h1Val = result.h1?.toLowerCase().trim() || '';
    const h1Ok = h1Val.length > 10 && !['home', 'inicio', 'aon'].includes(h1Val);
    if (h1Ok) score += 20;
    if (result.canonical) score += 20;
    const imagesWithoutAlt = result.imagesWithoutAlt || 0;
    if (imagesWithoutAlt === 0) {
      score += 20;
    } else {
      const penalty = Math.min(20, imagesWithoutAlt * 2);
      score += Math.max(0, 20 - penalty);
    }
    return score;
  }

  return (
    <section className="bg-gradient-to-br from-slate-100 to-tech-blue-100 dark:from-slate-900 dark:to-tech-blue-950 flex flex-col items-center justify-center py-12 px-4 max-w-8xl">
      <HomeFloatingButton />
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 space-y-4 border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-seo-teal-600 to-tech-blue-600 bg-clip-text text-transparent">Auditor SEO</h2>

        {!result && (
          <>
            <input
              type="text"
              placeholder="https://ejemplo.com"
              className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-tech-blue-500 focus:border-tech-blue-500 dark:bg-slate-700 dark:text-white transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <div className="flex justify-center gap-8">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all hover:bg-tech-blue-50 dark:hover:bg-tech-blue-950">
                <input
                  type="radio"
                  name="mode"
                  value="basic"
                  checked={mode === 'basic'}
                  onChange={() => setMode('basic')}
                  className="w-4 h-4 text-tech-blue-600 focus:ring-tech-blue-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">Básico</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all hover:bg-ai-purple-50 dark:hover:bg-ai-purple-950">
                <input
                  type="radio"
                  name="mode"
                  value="deep"
                  checked={mode === 'deep'}
                  onChange={() => setMode('deep')}
                  className="w-4 h-4 text-ai-purple-600 focus:ring-ai-purple-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">Avanzado</span>
              </label>
            </div>

            <button
              onClick={handleAudit}
              disabled={loading || !url}
              className="w-full bg-gradient-to-r from-seo-teal-500 to-tech-blue-600 hover:from-seo-teal-600 hover:to-tech-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-md hover:shadow-lg"
            >
              {loading ? 'Analizando...' : 'Iniciar Análisis'}
            </button>

            {error && <p className="text-error-500 font-medium bg-error-50 dark:bg-error-950 p-3 rounded-lg border border-error-200 dark:border-error-700">Error: {error}</p>}

            {/* Cards explicativas */}

          </>
        )}

        {result && (
          <div className="mt-10 rounded-xl shadow-lg border-2 border-success-200 dark:border-success-700 bg-gradient-to-br from-success-50 to-seo-teal-50 dark:from-success-950 dark:to-seo-teal-950 p-6 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/logo/logo_blue.png"
                alt="Logo YA"
                width={40}
                height={40}
                className="dark:hidden"
              />
              <Image
                src="/logo/logo_white.png"
                alt="Logo YA Dark"
                width={40}
                height={40}
                className="hidden dark:block"
              />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-success-600 to-seo-teal-600 bg-clip-text text-transparent">
                Auditor SEO Inteligente
              </h3>
            </div>

            {result.mode === 'basic' && (
              <div className="mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold mb-2 uppercase tracking-wide">
                  Puntuación SEO
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg h-6 overflow-hidden relative shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 rounded-lg ${
                      calcularScoreSEO(result) >= 80 
                        ? 'bg-gradient-to-r from-success-500 to-success-600' 
                        : calcularScoreSEO(result) >= 60 
                        ? 'bg-gradient-to-r from-warning-500 to-warning-600' 
                        : 'bg-gradient-to-r from-error-500 to-error-600'
                    }`}
                    style={{ width: `${calcularScoreSEO(result)}%` }}
                  ></div>
                </div>
                <p className={`text-sm mt-2 font-bold ${
                  calcularScoreSEO(result) >= 80 
                    ? 'text-success-600 dark:text-success-400' 
                    : calcularScoreSEO(result) >= 60 
                    ? 'text-warning-600 dark:text-warning-400' 
                    : 'text-error-600 dark:text-error-400'
                }`}>
                  {calcularScoreSEO(result)} / 100 puntos
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.mode === 'basic' && (
                <>
                  <Campo label="Título SEO" valor={result.title || '—'} />
                  <Campo label="Descripción" valor={result.description || '—'} />
                  <Campo label="Primer H1" valor={result.h1 || '—'} />
                  <Campo label="URL Canonical" valor={result.canonical || '—'} />
                  <Campo label="Imágenes sin alt" valor={`${result.imagesWithoutAlt} imágenes`} />
                </>
              )}

              {result.mode === 'deep' && (
                <>
                  <Campo label="Tiempo de carga" valor={`${result.loadTime} ms`} />
                  <Campo label="Cantidad de peticiones" valor={`${result.totalRequests}`} />
                  <Campo label="Peso total"  valor={`${((result.totalBytes || 0) / 1024).toFixed(1)} KB`} />
                  <Campo label="Cantidad de scripts" valor={`${result.scriptCount}`} />
                  <Campo label="¿Tiene H1?" valor={result.hasH1 ? '✅ Sí' : '❌ No'} />
                  <Campo label="¿Tiene meta descripción?" valor={result.hasMetaDescription ? '✅ Sí' : '❌ No'} />
                </>
              )}
            </div>

            {result.mode === 'deep' && result.screenshot && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
                  Captura de pantalla renderizada
                </p>
                <img
                  src={`data:image/jpeg;base64,${result.screenshot}`}
                  alt="Render screenshot"
                  className="rounded-lg shadow-md max-w-full border border-slate-200 dark:border-slate-600"
                />
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  setResult(null);
                  setUrl('');
                  setMode('basic');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded bg-gradient-to-r from-seo-teal-100 to-tech-blue-100 hover:from-seo-teal-200 hover:to-tech-blue-200 text-seo-teal-800 dark:text-seo-teal-200 font-medium transition-all border border-seo-teal-200 dark:border-seo-teal-600"
              >
                🔍 Auditar otra página
              </Button>

              <Link href="/" passHref legacyBehavior>
                <Button asChild>
                  <a>🏠 Volver al inicio</a>
                </Button>
              </Link>
            </div>
          </div>
        )}
        <div className="bg-gradient-to-br from-slate-50 to-tech-blue-50 dark:from-slate-800 dark:to-tech-blue-900 p-8 mt-10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-br from-tech-blue-100 to-seo-teal-100 dark:from-tech-blue-900 dark:to-seo-teal-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-tech-blue-600 dark:text-tech-blue-300 text-xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Auditoría Básica</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Revisa los principales elementos SEO como título, meta descripción, H1, URL canonical y textos alternativos.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-br from-ai-purple-100 to-tech-blue-100 dark:from-ai-purple-900 dark:to-tech-blue-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-ai-purple-600 dark:text-ai-purple-300 text-xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Auditoría Avanzada</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Realiza un análisis más profundo del HTML renderizado para detectar problemas técnicos y estructura de la página.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-br from-seo-teal-100 to-success-100 dark:from-seo-teal-900 dark:to-success-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-seo-teal-600 dark:text-seo-teal-300 text-xl">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Resultados Accionables</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Recibe recomendaciones claras sobre qué mejorar para optimizar tu presencia en los motores de búsqueda.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}

const Campo = ({ label, valor }: { label: string; valor: string }) => (
  <div>
    <label className="block text-sm text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
      {label}
    </label>
    <div className="bg-card border border-border rounded-lg px-4 py-3 text-sm text-card-foreground break-words shadow-sm">
      {valor}
    </div>
  </div>
);
