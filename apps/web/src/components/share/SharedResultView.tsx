'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Share2, 
  Download, 
  Calendar, 
  User, 
  Settings, 
  MessageCircle,
  Heart,
  ExternalLink,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useShare } from '@/contexts/ShareContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useShareLinks, useExportResult } from '@/hooks/useShare';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';

interface SharedResultViewProps {
  shareId: string;
  isEmbedded?: boolean;
  showComments?: boolean;
}

export const SharedResultView: React.FC<SharedResultViewProps> = ({
  shareId,
  isEmbedded = false,
  showComments = true
}) => {
  const { getShareLink, trackView, trackShare } = useShare();
  const { copyToClipboard } = useShareLinks();
  const { exportImage, exportPDF, exportJSON } = useExportResult();
  const { showError, showSuccess } = useNotifications();

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    loadSharedResult();
  }, [shareId]);

  const loadSharedResult = async () => {
    try {
      setIsLoading(true);
      const sharedResult = await getShareLink(shareId);
      
      if (!sharedResult) {
        setError('Resultado no encontrado o enlace expirado');
        return;
      }

      // Verificar si requiere contraseña
      if (sharedResult.metadata.password && !passwordRequired) {
        setPasswordRequired(true);
        return;
      }

      setResult(sharedResult);
      setLikes(Math.floor(Math.random() * 50)); // Simular likes
      
      // Trackear vista
      await trackView(sharedResult.id);
    } catch (err) {
      setError('Error al cargar el resultado compartido');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      showError('Por favor ingresa la contraseña');
      return;
    }

    // En una implementación real, verificarías la contraseña en el servidor
    setPasswordRequired(false);
    await loadSharedResult();
  };

  const handleShare = async (platform?: 'twitter' | 'facebook' | 'linkedin') => {
    if (!result) return;

    const url = window.location.href;
    const text = `${result.title} - Análisis realizado con YA Tools`;

    if (platform) {
      let shareUrl = '';
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        await trackShare(result.id, platform);
      }
    } else {
      await copyToClipboard(url);
      await trackShare(result.id, 'copy');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const renderResultData = () => {
    if (!result?.data) return null;

    // Renderizar datos según el tipo de herramienta
    switch (result.toolName) {
      case 'seo-analyzer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.data.score || 85}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Puntuación SEO
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.data.issues?.length || 3}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Problemas encontrados
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {result.data.keywords?.length || 12}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Palabras clave
                </div>
              </div>
            </div>

            {result.data.recommendations && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recomendaciones
                </h3>
                <div className="space-y-2">
                  {result.data.recommendations.slice(0, 5).map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'keyword-research':
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Palabra clave
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Volumen
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Dificultad
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      CPC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(result.data.keywords || []).slice(0, 10).map((keyword: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {keyword.term}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {keyword.volume?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          keyword.difficulty < 30 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : keyword.difficulty < 70
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {keyword.difficulty}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        ${keyword.cpc?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Contenido protegido
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Este resultado requiere una contraseña para acceder
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Acceder
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Resultado no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'El enlace puede haber expirado o sido eliminado'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ir a YA Tools
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isEmbedded ? 'p-0' : 'p-4'}`}>
      <div className={`max-w-4xl mx-auto ${isEmbedded ? '' : 'py-8'}`}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {result.title}
                </h1>
                {result.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {result.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {likes}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>{result.toolName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(result.metadata.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{result.stats.views} vistas</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copiar enlace
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </button>
              
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => exportImage(result.id)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>
                
                <button
                  onClick={() => exportPDF(result.id)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderResultData()}
          </div>

          {/* Comments */}
          {showComments && result.metadata.allowComments && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <FeedbackWidget
                toolName={result.toolName}
                context={`shared-result-${result.id}`}
                title="Comentarios sobre este resultado"
              />
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Generado con{' '}
                <a 
                  href="/" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YA Tools
                </a>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-500">
                {result.stats.shares} compartidos • {result.stats.downloads} descargas
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedResultView;