"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageInfo = exports.compressImages = void 0;
const sharp_1 = __importDefault(require("sharp"));
const multer_1 = __importDefault(require("multer"));
// Configuración de multer para manejar archivos en memoria
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB límite
        files: 10 // máximo 10 archivos
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no soportado. Solo se permiten JPEG, PNG y WebP.'));
        }
    }
});
class ImageCompressorService {
    /**
     * Comprime una imagen usando Sharp
     */
    static compressImage(buffer, originalName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { quality = 80, format, width, height, maintainAspectRatio = true } = options;
                // Obtener información de la imagen original
                const originalMetadata = yield (0, sharp_1.default)(buffer).metadata();
                const originalSize = buffer.length;
                // Determinar el formato de salida
                let outputFormat = format;
                if (!outputFormat) {
                    // Mantener el formato original si no se especifica
                    outputFormat = originalMetadata.format || 'jpeg';
                }
                // Configurar Sharp para la compresión
                let sharpInstance = (0, sharp_1.default)(buffer);
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
                const compressedBuffer = yield sharpInstance.toBuffer();
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
            }
            catch (error) {
                console.error('Error comprimiendo imagen:', error);
                throw new Error(`Error al comprimir la imagen ${originalName}: ${error.message}`);
            }
        });
    }
    /**
     * Procesa múltiples imágenes
     */
    static compressMultipleImages(files, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const file of files) {
                try {
                    const result = yield this.compressImage(file.buffer, file.originalname, options);
                    results.push(result);
                }
                catch (error) {
                    console.error(`Error procesando ${file.originalname}:`, error);
                    // Continuar con los demás archivos
                }
            }
            return results;
        });
    }
    /**
     * Valida los límites del plan del usuario
     */
    static validatePlanLimits(userPlan, fileCount, totalSize) {
        const limits = {
            free: { maxFiles: 3, maxSizePerFile: 2 * 1024 * 1024 }, // 2MB
            basic: { maxFiles: 10, maxSizePerFile: 5 * 1024 * 1024 }, // 5MB
            pro: { maxFiles: 50, maxSizePerFile: 10 * 1024 * 1024 }, // 10MB
            enterprise: { maxFiles: 100, maxSizePerFile: 20 * 1024 * 1024 } // 20MB
        };
        const planLimits = limits[userPlan] || limits.free;
        return fileCount <= planLimits.maxFiles && totalSize <= planLimits.maxSizePerFile * fileCount;
    }
}
/**
 * Endpoint para comprimir imágenes
 */
exports.compressImages = [
    upload.array('images', 10),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se han subido archivos'
                });
            }
            // Obtener opciones de compresión
            const quality = parseInt(req.body.quality) || 80;
            const format = req.body.format || undefined;
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
            const compressionOptions = {
                quality,
                format,
                width,
                height,
                maintainAspectRatio: true
            };
            const results = yield ImageCompressorService.compressMultipleImages(files, compressionOptions);
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
        }
        catch (error) {
            console.error('Error en compressImages:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    })
];
/**
 * Endpoint para obtener información de una imagen sin comprimirla
 */
exports.getImageInfo = [
    upload.single('image'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se ha subido ningún archivo'
                });
            }
            const metadata = yield (0, sharp_1.default)(file.buffer).metadata();
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
        }
        catch (error) {
            console.error('Error en getImageInfo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información de la imagen',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    })
];
exports.default = {
    compressImages: exports.compressImages,
    getImageInfo: exports.getImageInfo
};
