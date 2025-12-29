import express, { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';

const router = express.Router();

// Configurar multer para manejar archivos en memoria
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB límite
  }
});

// Interfaces
interface CompressionOptions {
  quality: number;
  format?: 'jpeg' | 'png' | 'webp';
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

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

// Servicio de compresión
class ImageCompressorService {
  static async compressImage(
    buffer: Buffer,
    originalName: string,
    options: CompressionOptions
  ): Promise<CompressedImageResult> {
    try {
      const { quality, format, width, height, maintainAspectRatio = true } = options;
      
      let sharpInstance = sharp(buffer);
      
      // Redimensionar si se especifican dimensiones
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: maintainAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true
        });
      }
      
      // Determinar formato de salida
      const metadata = await sharp(buffer).metadata();
      const outputFormat = format || (metadata.format as 'jpeg' | 'png' | 'webp') || 'jpeg';
      
      // Aplicar compresión según el formato
      let compressedBuffer: Buffer;
      switch (outputFormat) {
        case 'jpeg':
          compressedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
          break;
        case 'png':
          compressedBuffer = await sharpInstance.png({ 
            quality,
            compressionLevel: Math.floor((100 - quality) / 10)
          }).toBuffer();
          break;
        case 'webp':
          compressedBuffer = await sharpInstance.webp({ quality }).toBuffer();
          break;
        default:
          compressedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
      }
      
      const originalSize = buffer.length;
      const compressedSize = compressedBuffer.length;
      const compressionRatio = compressedSize / originalSize;
      
      return {
        originalName,
        originalSize,
        compressedSize,
        compressionRatio,
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

  static validatePlanLimits(userPlan: string, fileCount: number, totalSize: number): boolean {
    const limits: Record<string, { maxFiles: number; maxSizePerFile: number }> = {
      free: { maxFiles: 3, maxSizePerFile: 2 * 1024 * 1024 }, // 2MB
      basic: { maxFiles: 10, maxSizePerFile: 5 * 1024 * 1024 }, // 5MB
      pro: { maxFiles: 50, maxSizePerFile: 10 * 1024 * 1024 }, // 10MB
      enterprise: { maxFiles: 100, maxSizePerFile: 20 * 1024 * 1024 } // 20MB
    };
    
    const planLimits = limits[userPlan] || limits.free;
    
    return fileCount <= planLimits.maxFiles && totalSize <= planLimits.maxSizePerFile * fileCount;
  }
}

// Ruta para comprimir imágenes
router.post('/compress', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se han subido archivos'
      });
      return;
    }

    // Obtener opciones de compresión
    const quality = parseInt(req.body.quality) || 80;
    const format = req.body.format as 'jpeg' | 'png' | 'webp' || undefined;
    const width = req.body.width ? parseInt(req.body.width) : undefined;
    const height = req.body.height ? parseInt(req.body.height) : undefined;
    
    // Validar calidad
    if (quality < 1 || quality > 100) {
      res.status(400).json({
        success: false,
        message: 'La calidad debe estar entre 1 y 100'
      });
      return;
    }

    // Validar límites del plan
    const userPlan = req.body.userPlan || 'free';
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    if (!ImageCompressorService.validatePlanLimits(userPlan, files.length, totalSize)) {
      res.status(403).json({
        success: false,
        message: 'Has excedido los límites de tu plan. Actualiza para procesar más imágenes.'
      });
      return;
    }

    // Comprimir imágenes
    const compressionOptions: CompressionOptions = {
      quality,
      format,
      width,
      height,
      maintainAspectRatio: true
    };

    const results: CompressedImageResult[] = [];
    
    for (const file of files) {
      try {
        const result = await ImageCompressorService.compressImage(file.buffer, file.originalname, compressionOptions);
        results.push(result);
      } catch (error) {
        console.error(`Error procesando ${file.originalname}:`, error);
      }
    }

    if (results.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se pudieron procesar las imágenes'
      });
      return;
    }

    // Calcular estadísticas totales
    const totalOriginalSize = results.reduce((sum, result) => sum + result.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, result) => sum + result.compressedSize, 0);
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const averageCompressionRatio = results.reduce((sum, result) => sum + result.compressionRatio, 0) / results.length;

    // Preparar respuesta
    const responseResults = results.map(result => ({
      originalName: result.originalName,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      format: result.format,
      quality: result.quality,
      mimeType: result.mimeType,
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
});

// Ruta para obtener información de una imagen
router.post('/info', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
      return;
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
});

export default router;