'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Download, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  QrCode,
  Settings,
  Eye,
  Calendar,
  Lock,
  Globe,
  X,
  Check,
  ExternalLink
} from 'lucide-react';
import { useShareResult, useExportResult, useShareLinks, useQRShare } from '@/hooks/useShare';
import { useNotifications } from '@/hooks/useNotifications';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  title: string;
  data: any;
  description?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  toolName,
  title,
  data,
  description
}) => {
  const { shareResult, shareToSocialMedia, isSharing } = useShareResult();
  const { exportImage, exportPDF, exportJSON, isExporting } = useExportResult();
  const { copyToClipboard } = useShareLinks();
  const { generateQR, downloadQR, qrCode, isGenerating } = useQRShare();
  const { showSuccess } = useNotifications();

  const [activeTab, setActiveTab] = useState<'share' | 'export' | 'settings'>('share');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareOptions, setShareOptions] = useState({
    isPublic: true,
    allowComments: true,
    expiresIn: 30,
    password: ''
  });
  const [showQR, setShowQR] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      const result = await shareResult(toolName, title, data, {
        description,
        ...shareOptions
      });
      
      if (result?.shareLink) {
        setShareUrl(result.shareLink.shortUrl);
        showSuccess('Resultado compartido exitosamente');
      }
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  }, [shareResult, toolName, title, data, description, shareOptions, showSuccess]);

  const handleSocialShare = useCallback(async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    if (!shareUrl) {
      await handleShare();
      return;
    }
    
    // Usar el shareUrl existente para compartir
    const text = `${title} - Análisis realizado con YA Tools`;
    let socialUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
        break;
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
    }
  }, [shareUrl, handleShare, title]);

  const handleGenerateQR = useCallback(async () => {
    if (!shareUrl) {
      await handleShare();
      return;
    }
    
    await generateQR(shareUrl);
    setShowQR(true);
  }, [shareUrl, generateQR, handleShare]);

  const tabs = [
    { id: 'share', label: 'Compartir', icon: Share2 },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Compartir Resultado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'share' && (
              <div className="space-y-6">
                {/* URL de compartir */}
                {shareUrl ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enlace para compartir
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => copyToClipboard(shareUrl)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    {isSharing ? 'Generando enlace...' : 'Generar enlace para compartir'}
                  </button>
                )}

                {/* Redes sociales */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Compartir en redes sociales
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-blue-400" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleSocialShare('facebook')}
                      className="flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      className="flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleSocialShare('whatsapp')}
                      className="flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      WhatsApp
                    </button>
                  </div>
                </div>

                {/* Código QR */}
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateQR}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    {isGenerating ? 'Generando QR...' : 'Generar código QR'}
                  </button>
                  
                  {showQR && qrCode && (
                    <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <img src={qrCode} alt="Código QR" className="w-48 h-48" />
                      <button
                        onClick={() => downloadQR(qrCode, `qr-${title}.png`)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Descargar QR
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => exportImage('temp-id', 'png')}
                    disabled={isExporting}
                    className="flex items-center gap-3 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Exportar como imagen</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Formato PNG para compartir en redes sociales
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => exportPDF('temp-id')}
                    disabled={isExporting}
                    className="flex items-center gap-3 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">Exportar como PDF</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Documento completo con todos los datos
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => exportJSON('temp-id')}
                    disabled={isExporting}
                    className="flex items-center gap-3 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Exportar como JSON</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Datos estructurados para desarrolladores
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Visibilidad */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Visibilidad
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="visibility"
                        checked={shareOptions.isPublic}
                        onChange={() => setShareOptions(prev => ({ ...prev, isPublic: true }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Globe className="w-4 h-4 text-green-600" />
                      <span>Público - Cualquiera con el enlace puede ver</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!shareOptions.isPublic}
                        onChange={() => setShareOptions(prev => ({ ...prev, isPublic: false }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Lock className="w-4 h-4 text-orange-600" />
                      <span>Privado - Solo tú puedes ver</span>
                    </label>
                  </div>
                </div>

                {/* Comentarios */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={shareOptions.allowComments}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, allowComments: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <MessageCircle className="w-4 h-4" />
                    <span>Permitir comentarios</span>
                  </label>
                </div>

                {/* Expiración */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Expiración del enlace
                  </label>
                  <select
                    value={shareOptions.expiresIn}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={1}>1 día</option>
                    <option value={7}>1 semana</option>
                    <option value={30}>1 mes</option>
                    <option value={90}>3 meses</option>
                    <option value={365}>1 año</option>
                    <option value={0}>Sin expiración</option>
                  </select>
                </div>

                {/* Contraseña */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    value={shareOptions.password}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Dejar vacío para sin contraseña"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span>Los enlaces se pueden revocar en cualquier momento</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              {activeTab === 'share' && !shareUrl && (
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSharing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareDialog;