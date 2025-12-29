'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Info, Loader2, UploadCloud, X, MapPin, Store, Globe, Sparkles, AlertCircle, BarChart3, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';


export default function RenombradorPage() {
  type ResultadoIA = {
    nombre_seo: string;
    alt_text: string;
    analisis?: {
      elementos_detectados: string[];
      colores_principales: string[];
      contexto_sugerido: string;
      score_seo: number;
    };
    sugerencias?: string[];
    metadata?: {
      modo_usado: string;
      keyword_aplicada?: string;
      ciudad_aplicada?: string;
      timestamp: string;
    };
    warnings?: string[];
  };

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modo, setModo] = useState('web');
  const [keyword, setKeyword] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [result, setResult] = useState<ResultadoIA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función de validación del lado cliente
  const validateInput = (): string | null => {
    if (!image) {
      return 'Debes seleccionar una imagen';
    }

    if (image.size > 5 * 1024 * 1024) {
      return 'La imagen no puede superar los 5MB';
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return 'Solo se permiten archivos JPG, PNG y WEBP';
    }

    if (keyword && keyword.length > 100) {
      return 'La palabra clave no puede superar los 100 caracteres';
    }

    if (ciudad && ciudad.length > 50) {
      return 'El nombre de la ciudad no puede superar los 50 caracteres';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Limpiar estados previos
    setError(null);
    setResult(null);

    // Validar entrada
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }
      formData.append('modo', modo);
      if (keyword.trim()) formData.append('keyword', keyword.trim());
      if (ciudad.trim()) formData.append('ciudad', ciudad.trim());

      const res = await fetch('http://localhost:3001/api/renombrar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejo específico de errores de la API
        switch (data.code) {
          case 'VALIDATION_ERROR':
            setError(`Error de validación: ${data.details?.map((d: any) => d.message).join(', ') || data.error}`);
            break;
          case 'FILE_TOO_LARGE':
            setError('El archivo es demasiado grande (máximo 5MB)');
            break;
          case 'UNSUPPORTED_FILE_TYPE':
            setError('Tipo de archivo no soportado. Solo JPG, PNG y WEBP');
            break;
          case 'QUOTA_EXCEEDED':
            setError('Límite de uso alcanzado. Intenta más tarde');
            break;
          case 'RATE_LIMIT':
            setError('Demasiadas solicitudes. Espera un momento');
            break;
          case 'AI_PROCESSING_ERROR':
            setError('Error procesando la imagen. Intenta con otra imagen');
            break;
          default:
            setError(data.error || 'Error procesando la imagen');
        }
        return;
      }

      setResult(data);

      // Log de uso de herramienta (proxy vía Next.js para evitar CORS)
      try {
        await fetch('/api/analytics/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'Renombrador de Imágenes',
            slug: 'renombrador-images',
            usedAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            metadata: {
              modo,
              hasKeyword: !!keyword,
              hasCiudad: !!ciudad,
              imageSize: image?.size,
              imageType: image?.type,
            },
          }),
        });
      } catch (logError) {
        console.warn('Error logging tool usage:', logError);
      }

    } catch (fetchError) {
      console.error('Error de red:', fetchError);
      setError('Error de conexión. Verifica tu conexión a internet');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <HomeFloatingButton/>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Renombrador Inteligente de Imágenes
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Potenciado por IA para generar nombres de archivo y textos alternativos optimizados para SEO
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative w-full">
          <input type="file" accept="image/*" onChange={handleImageChange} className="opacity-0 absolute w-full h-full z-10 cursor-pointer" required />
          <div className="file-input-label relative w-full h-52 border-4 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center text-primary font-semibold transition-all duration-300 hover:bg-primary/5 hover:border-primary">
            <UploadCloud className="w-10 h-10 mb-2" />
            <span>{image?.name || 'Arrastra tu imagen aquí o haz clic para seleccionar'}</span>
            <span className="text-sm text-muted-foreground mt-2">Formatos soportados: JPG, PNG, WEBP (Max. 5MB)</span>
          </div>
        </div>

        {preview && (
          <div className="relative mt-4">
            <Image src={preview} alt="preview" width={600} height={300} className="rounded-xl shadow-md w-full max-h-80 object-contain" />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 bg-card rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-card-foreground mb-2">
            Modo de optimización <span className="text-destructive">*</span>
          </label>
          <p className="text-lg text-primary bg-primary/10 px-4 py-3 rounded-lg font-medium shadow-sm border border-primary/20">
            Selecciona un modo de optimización para generar el nombre ideal según el uso de tu imagen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <CardOption
              icon={<Globe size={20} />}
              label="Web"
              description="Para blogs, artículos y páginas web generales"
              active={modo === 'web'}
              onClick={() => setModo('web')}
            />
            <CardOption
              icon={<Store size={20} />}
              label="E-commerce"
              description="Productos, catálogos y plataformas de venta"
              active={modo === 'ecommerce'}
              onClick={() => setModo('ecommerce')}
            />
            <CardOption
              icon={<MapPin size={20} />}
              label="SEO Local"
              description="Negocios locales con ubicación específica"
              active={modo === 'local'}
              onClick={() => setModo('local')}
            />
          </div>
        </div>

        <div className="relative group">
          <label className="text-sm font-medium text-card-foreground mb-1 flex items-center">
            Palabra clave (opcional)
            <Info className="ml-2 text-muted-foreground hover:text-primary transition-colors" size={16} />
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ej: hamburguesa artesanal"
            className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground transition-all"
          />
        </div>

        {modo === 'local' && (
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Ciudad para SEO local</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej: Buenos Aires"
              className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          {loading ? 'Procesando imagen...' : 'Generar nombre SEO'}
        </button>
      </form>
      <div className='flex gap-12 pt-8'>
        <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border">
          <div className="bg-primary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-primary text-xl">✍️</span>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Optimización inteligente</h3>
          <p className="text-muted-foreground">
            Nuestra IA analiza automáticamente el contenido de tu imagen y genera nombres de archivo SEO que maximizan la visibilidad en buscadores.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border">
          <div className="bg-secondary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-secondary text-xl">😊</span>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Texto Alt generado</h3>
          <p className="text-muted-foreground">
            Generamos automáticamente descripciones accesibles (alt text) para mejorar tanto la experiencia del usuario como el posicionamiento SEO.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border">
          <div className="bg-accent/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-accent text-xl">🧠</span>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Modos especializados</h3>
          <p className="text-muted-foreground">
            Ofrecemos diferentes modos de optimización (Web, E-commerce y Local) para personalizar los resultados según la intención de uso de tu imagen.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-destructive" size={20} />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-10 p-6 bg-card rounded-2xl shadow-lg border-2 border-success/20 bg-success/5">
          <div className="flex items-center gap-4 mb-6">
            <Sparkles className="text-success" />
            <h2 className="text-2xl font-bold text-success">Optimización completada</h2>
            {result.analisis?.score_seo && (
              <div className="ml-auto bg-success/20 px-3 py-1 rounded-full">
                <span className="text-success font-semibold">Score SEO: {result.analisis.score_seo}/100</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Nombre SEO</label>
              <div className="bg-primary/10 border border-primary/20 rounded px-4 py-3 text-sm font-mono text-primary">
                {result.nombre_seo}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Texto Alt</label>
              <div className="bg-secondary/10 border border-secondary/20 rounded px-4 py-3 text-sm font-sans text-secondary">
                {result.alt_text || '— No generado —'}
              </div>
            </div>
          </div>

          {/* Análisis SEO detallado */}
          {result.analisis && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Análisis de la imagen
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.analisis.elementos_detectados && result.analisis.elementos_detectados.length > 0 && (
                  <div>
                    <h4 className="font-medium text-card-foreground mb-2">Elementos detectados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.analisis.elementos_detectados.map((elemento, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {elemento}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.analisis.colores_principales && result.analisis.colores_principales.length > 0 && (
                  <div>
                    <h4 className="font-medium text-card-foreground mb-2">Colores principales:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.analisis.colores_principales.map((color, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {result.analisis.contexto_sugerido && (
                <div className="mt-4">
                  <h4 className="font-medium text-card-foreground mb-2">Contexto sugerido:</h4>
                  <p className="text-muted-foreground text-sm bg-background p-3 rounded border">
                    {result.analisis.contexto_sugerido}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sugerencias de mejora */}
          {result.sugerencias && result.sugerencias.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Lightbulb size={20} />
                Sugerencias de mejora
              </h3>
              <ul className="space-y-2">
                {result.sugerencias.map((sugerencia, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{sugerencia}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advertencias */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                <AlertTriangle size={20} />
                Advertencias
              </h3>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-yellow-700 dark:text-yellow-300">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata */}
          {result.metadata && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">Información técnica</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Modo:</span>
                  <p className="font-medium">{result.metadata.modo_usado}</p>
                </div>
                {result.metadata.keyword_aplicada && (
                  <div>
                    <span className="text-muted-foreground">Keyword:</span>
                    <p className="font-medium">{result.metadata.keyword_aplicada}</p>
                  </div>
                )}
                {result.metadata.ciudad_aplicada && (
                  <div>
                    <span className="text-muted-foreground">Ciudad:</span>
                    <p className="font-medium">{result.metadata.ciudad_aplicada}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Procesado:</span>
                  <p className="font-medium">{new Date(result.metadata.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => {
                setImage(null);
                setPreview(null);
                setResult(null);
                setKeyword('');
                setCiudad('');
                setModo('web');
                setError(null);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-tech-blue-100 to-ai-purple-100 hover:from-tech-blue-200 hover:to-ai-purple-200 text-tech-blue-800 dark:text-tech-blue-200 font-medium border border-tech-blue-200 dark:border-tech-blue-600"
            >
              📷 Subir otra imagen
            </Button>

            <Link href="/" passHref legacyBehavior>
              <Button asChild>
                <a>🏠 Volver al inicio</a>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CardOption({ icon, label, description, active, onClick }: { icon: React.ReactNode; label: string; description: string; active: boolean; onClick: () => void }) {
  return (
    <div
      className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 text-center transform hover:scale-105 ${
        active 
          ? 'border-tech-blue-500 bg-gradient-to-br from-tech-blue-100 to-ai-purple-100 dark:from-tech-blue-900 dark:to-ai-purple-900 shadow-lg' 
          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-tech-blue-300 dark:hover:border-tech-blue-500 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-center mb-3">
        <div className={`p-3 rounded-full transition-colors ${
          active 
            ? 'bg-gradient-to-br from-tech-blue-200 to-ai-purple-200 dark:from-tech-blue-800 dark:to-ai-purple-800' 
            : 'bg-slate-100 dark:bg-slate-600'
        }`}>
          <div className={active ? 'text-tech-blue-600 dark:text-tech-blue-300' : 'text-slate-600 dark:text-slate-300'}>
            {icon}
          </div>
        </div>
      </div>
      <h3 className="text-md font-semibold text-slate-800 dark:text-white mb-1">{label}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
