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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const router = express_1.default.Router();
// Configurar multer para manejar archivos en memoria
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB límite
    }
});
// Servicio de compresión
class ImageCompressorService {
    static compressImage(buffer, originalName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { quality, format, width, height, maintainAspectRatio = true } = options;
                let sharpInstance = (0, sharp_1.default)(buffer);
                // Redimensionar si se especifican dimensiones
                if (width || height) {
                    sharpInstance = sharpInstance.resize(width, height, {
                        fit: maintainAspectRatio ? 'inside' : 'fill',
                        withoutEnlargement: true
                    });
                }
                // Determinar formato de salida
                const metadata = yield (0, sharp_1.default)(buffer).metadata();
                const outputFormat = format || metadata.format || 'jpeg';
                // Aplicar compresión según el formato
                let compressedBuffer;
                switch (outputFormat) {
                    case 'jpeg':
                        compressedBuffer = yield sharpInstance.jpeg({ quality }).toBuffer();
                        break;
                    case 'png':
                        compressedBuffer = yield sharpInstance.png({
                            quality,
                            compressionLevel: Math.floor((100 - quality) / 10)
                        }).toBuffer();
                        break;
                    case 'webp':
                        compressedBuffer = yield sharpInstance.webp({ quality }).toBuffer();
                        break;
                    default:
                        compressedBuffer = yield sharpInstance.jpeg({ quality }).toBuffer();
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
            }
            catch (error) {
                console.error('Error comprimiendo imagen:', error);
                throw new Error(`Error al comprimir la imagen ${originalName}: ${error.message}`);
            }
        });
    }
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
// Ruta para comprimir imágenes
router.post('/compress', upload.array('images', 10), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                message: 'No se han subido archivos'
            });
            return;
        }
        // Obtener opciones de compresión
        const quality = parseInt(req.body.quality) || 80;
        const format = req.body.format || undefined;
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
        const compressionOptions = {
            quality,
            format,
            width,
            height,
            maintainAspectRatio: true
        };
        const results = [];
        for (const file of files) {
            try {
                const result = yield ImageCompressorService.compressImage(file.buffer, file.originalname, compressionOptions);
                results.push(result);
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Error en compressImages:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}));
// Ruta para obtener información de una imagen
router.post('/info', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No se ha subido ningún archivo'
            });
            return;
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
}));
exports.default = router;
