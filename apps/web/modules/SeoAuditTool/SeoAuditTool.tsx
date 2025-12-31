"use client";
import { useState } from 'react';
import { getApiUrl } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HomeFloatingButton from '../../components/inicio-comun/HomeFloatingButton';

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
      const response = await fetch(getApiUrl(`api/auditor?url=${encodeURIComponent(url)}&mode=${mode}`));
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
    <section className="bg-[#D2DBEA] flex flex-col items-center justify-center py-12 px-4 max-w-8xl">
      <HomeFloatingButton />
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center">Auditor SEO</h2>

        {!result && (
          <>
            <input
              type="text"
              placeholder="https://ejemplo.com"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring focus:border-indigo-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <div className="flex justify-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="basic"
                  checked={mode === 'basic'}
                  onChange={() => setMode('basic')}
                />
                <span>Básico</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="deep"
                  checked={mode === 'deep'}
                  onChange={() => setMode('deep')}
                />
                <span>Avanzado</span>
              </label>
            </div>

            <button
              onClick={handleAudit}
              disabled={loading || !url}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              {loading ? 'Analizando...' : 'Iniciar Análisis'}
            </button>

            {error && <p className="text-red-500 font-medium">Error: {error}</p>}

            {/* Cards explicativas */}

          </>
        )}

        {result && (
          <div className="mt-10 rounded-xl shadow-lg border border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-900 p-6 transition-all duration-300">
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
              <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                Auditor SEO Inteligente
              </h3>
            </div>

            {result.mode === 'basic' && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold mb-1 uppercase tracking-wide">
                  Puntuación SEO
                </p>
                <div className="w-full bg-violet-100 dark:bg-zinc-800 rounded h-4 overflow-hidden relative">
                  <div
                    className="bg-violet-600 h-full transition-all duration-700"
                    style={{ width: `${calcularScoreSEO(result)}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-violet-700 dark:text-violet-300">
                  {calcularScoreSEO(result)} / 100
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
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Captura de pantalla renderizada
                </p>
                <img
                  src={`data:image/jpeg;base64,${result.screenshot}`}
                  alt="Render screenshot"
                  className="rounded shadow max-w-full"
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
                className="w-full sm:w-auto px-4 py-2 rounded bg-violet-100 hover:bg-violet-200 text-violet-800 font-medium transition"
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
        <div className="bg-[#D2DBEA] p-32 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-indigo-600 dark:text-indigo-300 text-xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Auditoría Básica</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Revisa los principales elementos SEO como título, meta descripción, H1, URL canonical y textos alternativos.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-indigo-600 dark:text-indigo-300 text-xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Auditoría Avanzada</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Realiza un análisis más profundo del HTML renderizado para detectar problemas técnicos y estructura de la página.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-indigo-600 dark:text-indigo-300 text-xl">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Resultados Accionables</h3>
            <p className="text-gray-600 dark:text-gray-400">
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
    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wide">
      {label}
    </label>
    <div className="bg-violet-50 dark:bg-zinc-800 border border-violet-300 dark:border-violet-600 rounded px-4 py-3 text-sm text-violet-700 dark:text-violet-300 break-words">
      {valor}
    </div>
  </div>
);
