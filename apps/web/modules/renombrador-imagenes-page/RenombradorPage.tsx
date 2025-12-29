'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Info, Loader2, UploadCloud, X, MapPin, Store, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';


export default function RenombradorPage() {
  type ResultadoIA = {
    nombre_seo: string;
    alt_text: string;
    url_descarga?: string;
  };

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modo, setModo] = useState('web');
  const [keyword, setKeyword] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [result, setResult] = useState<ResultadoIA | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    formData.append('modo', modo);
    if (keyword) formData.append('keyword', keyword);
    if (ciudad) formData.append('ciudad', ciudad);

    const res = await fetch('http://localhost:3001/api/renombrar', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    await fetch('/api/analytics/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'Renombrador de Imágenes',
        slug: 'renombrador-images',
        usedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
      }),
    });
    setLoading(false);
  };

  return (
    <div className="bg-[#D2DBEA] container mx-auto px-4 py-12 max-w-4xl">
      <HomeFloatingButton/>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4">
          Renombrador Inteligente de Imágenes
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Potenciado por IA para generar nombres de archivo y textos alternativos optimizados para SEO
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative w-full">
          <input type="file" accept="image/*" onChange={handleImageChange} className="opacity-0 absolute w-full h-full z-10 cursor-pointer" required />
          <div className="file-input-label relative w-full h-52 border-4 border-dashed border-indigo-400 rounded-2xl flex flex-col items-center justify-center text-indigo-600 font-semibold transition hover:bg-indigo-50">
            <UploadCloud className="w-10 h-10 mb-2" />
            <span>{image?.name || 'Arrastra tu imagen aquí o haz clic para seleccionar'}</span>
            <span className="text-sm text-gray-500 mt-2">Formatos soportados: JPG, PNG, WEBP (Max. 5MB)</span>
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
              className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Modo de optimización <span className="text-red-500">*</span>
          </label>
          <p className="text-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 rounded-lg font-medium shadow-sm">
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            Palabra clave (opcional)
            <Info className="ml-2 text-gray-400 hover:text-indigo-500" size={16} />
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ej: hamburguesa artesanal"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {modo === 'local' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad para SEO local</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej: Buenos Aires"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          {loading ? 'Procesando imagen...' : 'Generar nombre SEO'}
        </button>
      </form>
      <div className='flex gap-12 pt-8'>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-indigo-600 dark:text-indigo-300 text-xl">✍️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Optimización inteligente</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Nuestra IA analiza automáticamente el contenido de tu imagen y genera nombres de archivo SEO que maximizan la visibilidad en buscadores.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-indigo-600 dark:text-indigo-300 text-xl">😊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Texto Alt generado</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generamos automáticamente descripciones accesibles (alt text) para mejorar tanto la experiencia del usuario como el posicionamiento SEO.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-indigo-600 dark:text-indigo-300 text-xl">🧠</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Modos especializados</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ofrecemos diferentes modos de optimización (Web, E-commerce y Local) para personalizar los resultados según la intención de uso de tu imagen.
          </p>
        </div>
      </div>

      {result && (
        <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center gap-4 mb-6">
            <Sparkles className="text-indigo-500" />
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Optimización completada</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Nombre SEO</label>
              <div className="bg-indigo-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded px-4 py-3 text-sm font-mono text-indigo-700 dark:text-indigo-300">
                {result.nombre_seo}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Texto Alt</label>
              <div className="bg-indigo-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded px-4 py-3 text-sm font-sans text-indigo-700 dark:text-indigo-300">
                {result.alt_text || '— No generado —'}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => {
                setImage(null);
                setPreview(null);
                setResult(null);
                setKeyword('');
                setCiudad('');
                setModo('web');
              }}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium"
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
      className={`cursor-pointer p-5 rounded-xl border-2 transition-all text-center ${active ? 'border-indigo-500 bg-indigo-100 dark:bg-gray-600' : 'border-transparent bg-indigo-50 dark:bg-gray-700'} hover:border-indigo-300 dark:hover:border-indigo-500`}
      onClick={onClick}
    >
      <div className="flex justify-center mb-3">
        <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-1">{label}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
