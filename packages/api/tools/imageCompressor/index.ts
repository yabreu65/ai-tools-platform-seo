import { Request, Response } from 'express';
import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
    files: 10 // máximo 10 archivos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo se permiten JPEG, PNG y WebP.'));
    }
  }
});

interface CompressedImageResult {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
  compressedBuffer: Buffer;
  mimeType: string;
}

interface CompressionOptions {
  quality: number;
  format?: 'jpeg' | 'png' | 'webp';
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

class ImageCompressorService {
  /**
   * Comprime una imagen usando Sharp
   */
  static async compressImage(
    buffer: Buffer,
    originalName: string,
    options: CompressionOptions
  ): Promise<CompressedImageResult> {
    try {
      const { quality = 80, format, width, height, maintainAspectRatio = true } = options;
      
      // Obtener información de la imagen original
      const originalMetadata = await sharp(buffer).metadata();
      const originalSize = buffer.length;
      
      // Determinar el formato de salida
      let outputFormat = format;
      if (!outputFormat) {
        // Mantener el formato original si no se especifica
        outputFormat = originalMetadata.format as 'jpeg' | 'png' | 'webp' || 'jpeg';
      }
      
      // Configurar Sharp para la compresión
      let sharpInstance = sharp(buffer);
      
      // Redimensionar si se especifican dimensiones
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: maintainAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true
        });
      }
      
      // Aplicar compresión según el formato
      switch (outputFormat) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ 
            quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            quality,
            compressionLevel: Math.round((100 - quality) / 10),
            progressive: true
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality,
            effort: 6
          });
          break;
      }
      
      // Procesar la imagen
      const compressedBuffer = await sharpInstance.toBuffer();
      const compressedSize = compressedBuffer.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
      
      return {
        originalName,
        originalSize,
        compressedSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        format: outputFormat,
        quality,
        compressedBuffer,
        mimeType: `image/${outputFormat}`
      };
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      throw new Error(`Error al comprimir la imagen ${originalName}: ${(error as Error).message}`);
    }
  }

  /**
   * Procesa múltiples imágenes
   */
  static async compressMultipleImages(
    files: Express.Multer.File[],
    options: CompressionOptions
  ): Promise<CompressedImageResult[]> {
    const results: CompressedImageResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.compressImage(file.buffer, file.originalname, options);
        results.push(result);
      } catch (error) {
        console.error(`Error procesando ${file.originalname}:`, error);
        // Continuar con los demás archivos
      }
    }
    
    return results;
  }

  /**
   * Valida los límites del plan del usuario
   */
  static validatePlanLimits(userPlan: string, fileCount: number, totalSize: number): boolean {
    const limits = {
      free: { maxFiles: 3, maxSizePerFile: 2 * 1024 * 1024 }, // 2MB
      basic: { maxFiles: 10, maxSizePerFile: 5 * 1024 * 1024 }, // 5MB
      pro: { maxFiles: 50, maxSizePerFile: 10 * 1024 * 1024 }, // 10MB
      enterprise: { maxFiles: 100, maxSizePerFile: 20 * 1024 * 1024 } // 20MB
    } as const;
    
    const planLimits = limits[(userPlan as keyof typeof limits)] || limits.free;
    
    return fileCount <= planLimits.maxFiles && totalSize <= planLimits.maxSizePerFile * fileCount;
  }
}

/**
 * Endpoint para comprimir imágenes
 */
export const compressImages = [
  upload.array('images', 10),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se han subido archivos'
        });
      }

      // Obtener opciones de compresión
      const quality = parseInt(req.body.quality) || 80;
      const format = req.body.format as 'jpeg' | 'png' | 'webp' || undefined;
      const width = req.body.width ? parseInt(req.body.width) : undefined;
      const height = req.body.height ? parseInt(req.body.height) : undefined;
      
      // Validar calidad
      if (quality < 1 || quality > 100) {
        return res.status(400).json({
          success: false,
          message: 'La calidad debe estar entre 1 y 100'
        });
      }

      // Validar límites del plan (simulado - integrar con sistema real)
      const userPlan = req.body.userPlan || 'free';
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      if (!ImageCompressorService.validatePlanLimits(userPlan, files.length, totalSize)) {
        return res.status(403).json({
          success: false,
          message: 'Has excedido los límites de tu plan. Actualiza para procesar más imágenes.'
        });
      }

      // Comprimir imágenes
      const compressionOptions: CompressionOptions = {
        quality,
        format,
        width,
        height,
        maintainAspectRatio: true
      };

      const results = await ImageCompressorService.compressMultipleImages(files, compressionOptions);

      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudieron procesar las imágenes'
        });
      }

      // Calcular estadísticas totales
      const totalOriginalSize = results.reduce((sum, result) => sum + result.originalSize, 0);
      const totalCompressedSize = results.reduce((sum, result) => sum + result.compressedSize, 0);
      const totalSavings = totalOriginalSize - totalCompressedSize;
      const averageCompressionRatio = results.reduce((sum, result) => sum + result.compressionRatio, 0) / results.length;

      // Preparar respuesta (sin incluir los buffers completos)
      const responseResults = results.map(result => ({
        originalName: result.originalName,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        format: result.format,
        quality: result.quality,
        mimeType: result.mimeType,
        // Convertir buffer a base64 para envío
        compressedData: result.compressedBuffer.toString('base64')
      }));

      res.json({
        success: true,
        message: `${results.length} imágenes comprimidas exitosamente`,
        data: {
          images: responseResults,
          statistics: {
            totalImages: results.length,
            totalOriginalSize,
            totalCompressedSize,
            totalSavings,
            averageCompressionRatio: Math.round(averageCompressionRatio * 100) / 100,
            spaceSavedPercentage: Math.round((totalSavings / totalOriginalSize) * 100 * 100) / 100
          }
        }
      });

    } catch (error) {
      console.error('Error en compressImages:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
];

/**
 * Endpoint para obtener información de una imagen sin comprimirla
 */
export const getImageInfo = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo'
        });
      }

      const metadata = await sharp(file.buffer).metadata();
      
      res.json({
        success: true,
        data: {
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          channels: metadata.channels,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha
        }
      });

    } catch (error) {
      console.error('Error en getImageInfo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener información de la imagen',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
];

export default {
  compressImages,
  getImageInfo
};