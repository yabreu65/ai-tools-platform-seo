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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const openai_1 = require("openai");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Configuración de multer con límites y validación
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no soportado. Solo se permiten JPG, PNG y WEBP.'));
        }
    }
});
// Schema de validación con Zod
const renameRequestSchema = zod_1.z.object({
    modo: zod_1.z.enum(['web', 'ecommerce', 'local'], {
        errorMap: () => ({ message: 'Modo debe ser: web, ecommerce o local' })
    }),
    keyword: zod_1.z.string().max(100, 'Keyword no puede exceder 100 caracteres').optional(),
    ciudad: zod_1.z.string().max(50, 'Ciudad no puede exceder 50 caracteres').optional()
});
// Función para generar prompt mejorado
function generatePrompt(modo, keyword, ciudad) {
    let basePrompt = `Analiza esta imagen y genera un nombre de archivo SEO optimizado y texto alternativo siguiendo estas reglas:

REGLAS GENERALES:
- Nombre de archivo: máximo 60 caracteres, solo minúsculas, guiones medios, sin espacios
- Alt text: descriptivo, natural, 125-150 caracteres, incluye contexto relevante
- Usa palabras clave relevantes sin sobreoptimizar
- Evita caracteres especiales y acentos en el nombre de archivo

`;
    switch (modo) {
        case 'ecommerce':
            basePrompt += `MODO E-COMMERCE:
- Incluye características del producto (color, material, marca si es visible)
- Usa términos comerciales relevantes
- Optimiza para búsquedas de productos
- Formato: categoria-producto-caracteristicas-marca.jpg
`;
            break;
        case 'local':
            basePrompt += `MODO SEO LOCAL:
- Incluye ubicación geográfica si se proporciona
- Usa términos locales relevantes
- Optimiza para búsquedas locales
- Formato: servicio-ubicacion-caracteristicas.jpg
`;
            break;
        default: // web
            basePrompt += `MODO WEB:
- Enfócate en el contenido y contexto de la imagen
- Usa términos descriptivos y naturales
- Optimiza para búsquedas informacionales
- Formato: tema-descripcion-caracteristicas.jpg
`;
    }
    if (keyword) {
        basePrompt += `\nPALABRA CLAVE OBJETIVO: "${keyword}"
- Incluye esta palabra clave de forma natural en el nombre y alt text
- No fuerces su uso si no es relevante para la imagen`;
    }
    if (ciudad && modo === 'local') {
        basePrompt += `\nUBICACIÓN: "${ciudad}"
- Incluye esta ciudad en el nombre de archivo y alt text cuando sea relevante`;
    }
    basePrompt += `\nFORMATO DE RESPUESTA (JSON):
{
  "nombre_seo": "ejemplo-producto-azul-madrid.jpg",
  "alt_text": "Descripción natural y detallada de la imagen con contexto relevante",
  "analisis": {
    "elementos_detectados": ["elemento1", "elemento2"],
    "colores_principales": ["color1", "color2"],
    "contexto_sugerido": "breve descripción del contexto",
    "score_seo": 85
  },
  "sugerencias": ["sugerencia1", "sugerencia2"]
}

Responde SOLO con el JSON, sin texto adicional.`;
    return basePrompt;
}
router.post('/', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Validar que se recibió una imagen
        if (!req.file) {
            res.status(400).json({
                error: 'No se recibió ninguna imagen.',
                code: 'NO_IMAGE'
            });
            return;
        }
        // Validar datos de entrada
        const validationResult = renameRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                error: 'Datos de entrada inválidos',
                code: 'VALIDATION_ERROR',
                details: validationResult.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        const { modo, keyword, ciudad } = validationResult.data;
        // Validar API key de OpenAI
        if (!process.env.OPENAI_API_KEY) {
            res.status(500).json({
                error: 'Configuración del servidor incompleta',
                code: 'MISSING_API_KEY'
            });
            return;
        }
        // Convertir imagen a base64
        const base64Image = req.file.buffer.toString('base64');
        const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // Generar prompt optimizado
        const prompt = generatePrompt(modo, keyword, ciudad);
        try {
            const completion = yield openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${req.file.mimetype};base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 1000,
                temperature: 0.3,
                response_format: { type: "json_object" }
            });
            const responseContent = (_b = (_a = completion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim();
            if (!responseContent) {
                throw new Error('Respuesta vacía de OpenAI');
            }
            // Parsear respuesta JSON
            let parsedResult;
            try {
                parsedResult = JSON.parse(responseContent);
            }
            catch (parseError) {
                console.error('Error parsing OpenAI response:', responseContent);
                throw new Error('Respuesta de IA no válida');
            }
            // Validar campos requeridos
            if (!parsedResult.nombre_seo || !parsedResult.alt_text) {
                throw new Error('Respuesta incompleta de la IA');
            }
            // Limpiar y validar nombre SEO
            let nombreSeo = parsedResult.nombre_seo
                .toLowerCase()
                .replace(/[^a-z0-9\-\.]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            // Asegurar extensión
            if (!nombreSeo.includes('.')) {
                const extension = req.file.mimetype === 'image/png' ? '.png' :
                    req.file.mimetype === 'image/webp' ? '.webp' : '.jpg';
                nombreSeo += extension;
            }
            // Construir resultado
            const result = {
                nombre_seo: nombreSeo,
                alt_text: parsedResult.alt_text,
                analisis: parsedResult.analisis,
                sugerencias: parsedResult.sugerencias,
                metadata: {
                    modo_usado: modo,
                    keyword_aplicada: keyword,
                    ciudad_aplicada: ciudad,
                    timestamp: new Date().toISOString()
                }
            };
            // Validaciones adicionales
            const warnings = [];
            if (result.nombre_seo.length > 60) {
                warnings.push('Nombre de archivo muy largo (>60 caracteres)');
            }
            if (result.alt_text.length > 150) {
                warnings.push('Alt text muy largo (>150 caracteres)');
            }
            if (keyword && !result.nombre_seo.includes(keyword.toLowerCase().replace(/\s+/g, '-'))) {
                warnings.push('Keyword no incluida en el nombre de archivo');
            }
            res.json(Object.assign(Object.assign({}, result), { warnings: warnings.length > 0 ? warnings : undefined }));
        }
        catch (openaiError) {
            console.error('Error OpenAI:', openaiError);
            // Manejo específico de errores de OpenAI
            if (openaiError.code === 'insufficient_quota') {
                res.status(429).json({
                    error: 'Límite de uso de IA alcanzado',
                    code: 'QUOTA_EXCEEDED'
                });
            }
            else if (openaiError.code === 'rate_limit_exceeded') {
                res.status(429).json({
                    error: 'Demasiadas solicitudes, intenta más tarde',
                    code: 'RATE_LIMIT',
                    retryAfter: 60
                });
            }
            else if (openaiError.code === 'invalid_api_key') {
                res.status(500).json({
                    error: 'Configuración de IA inválida',
                    code: 'INVALID_API_KEY'
                });
            }
            else {
                res.status(500).json({
                    error: 'Error procesando la imagen con IA',
                    code: 'AI_PROCESSING_ERROR'
                });
            }
            return;
        }
    }
    catch (error) {
        console.error('Error general:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({
                error: 'Archivo demasiado grande (máximo 5MB)',
                code: 'FILE_TOO_LARGE'
            });
        }
        else if (error.message.includes('Tipo de archivo no soportado')) {
            res.status(400).json({
                error: error.message,
                code: 'UNSUPPORTED_FILE_TYPE'
            });
        }
        else {
            res.status(500).json({
                error: 'Error interno del servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }
}));
exports.default = router;
