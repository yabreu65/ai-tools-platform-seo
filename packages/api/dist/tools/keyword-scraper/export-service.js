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
exports.ExportService = void 0;
const csv_writer_1 = require("csv-writer");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ExportService {
    exportToCSV(keywords, competitors, opportunities, metrics, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const csvData = [];
            // Add keywords data
            keywords.forEach(keyword => {
                csvData.push({
                    type: 'keyword',
                    keyword: keyword.keyword,
                    frequency: keyword.frequency,
                    density: keyword.density,
                    category: keyword.category,
                    relevanceScore: keyword.relevanceScore,
                    sourceUrl: keyword.sourceUrl,
                    positions: keyword.positions.join(', ')
                });
            });
            // Add competitor data if requested
            if (options.includeMetrics) {
                competitors.forEach(competitor => {
                    csvData.push({
                        type: 'competitor',
                        url: competitor.url,
                        title: competitor.title,
                        metaDescription: competitor.metaDescription,
                        totalKeywords: competitor.totalKeywords,
                        processingTime: competitor.processingTime
                    });
                });
            }
            // Add opportunities if requested
            if (options.includeOpportunities) {
                opportunities.forEach(opportunity => {
                    csvData.push({
                        type: 'opportunity',
                        opportunityType: opportunity.type,
                        description: opportunity.description,
                        suggestedKeywords: opportunity.suggestedKeywords.join(', '),
                        priority: opportunity.priority,
                        confidenceScore: opportunity.confidenceScore
                    });
                });
            }
            // Create temporary file
            const tempDir = path_1.default.join(process.cwd(), 'temp');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            const tempFile = path_1.default.join(tempDir, `export-${Date.now()}.csv`);
            const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
                path: tempFile,
                header: [
                    { id: 'type', title: 'Type' },
                    { id: 'keyword', title: 'Keyword' },
                    { id: 'frequency', title: 'Frequency' },
                    { id: 'density', title: 'Density (%)' },
                    { id: 'category', title: 'Category' },
                    { id: 'relevanceScore', title: 'Relevance Score' },
                    { id: 'sourceUrl', title: 'Source URL' },
                    { id: 'positions', title: 'Positions' },
                    { id: 'url', title: 'Competitor URL' },
                    { id: 'title', title: 'Title' },
                    { id: 'metaDescription', title: 'Meta Description' },
                    { id: 'totalKeywords', title: 'Total Keywords' },
                    { id: 'processingTime', title: 'Processing Time (ms)' },
                    { id: 'opportunityType', title: 'Opportunity Type' },
                    { id: 'description', title: 'Description' },
                    { id: 'suggestedKeywords', title: 'Suggested Keywords' },
                    { id: 'priority', title: 'Priority' },
                    { id: 'confidenceScore', title: 'Confidence Score' }
                ]
            });
            yield csvWriter.writeRecords(csvData);
            // Read file and return buffer
            const buffer = fs_1.default.readFileSync(tempFile);
            // Clean up temp file
            fs_1.default.unlinkSync(tempFile);
            return buffer;
        });
    }
    exportToPDF(keywords, competitors, opportunities, metrics, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const doc = new pdfkit_1.default({ margin: 50 });
                    const buffers = [];
                    doc.on('data', buffers.push.bind(buffers));
                    doc.on('end', () => {
                        const pdfBuffer = Buffer.concat(buffers);
                        resolve(pdfBuffer);
                    });
                    // Title
                    doc.fontSize(20).text('Reporte de Análisis de Palabras Clave', { align: 'center' });
                    doc.moveDown();
                    // Date
                    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, { align: 'right' });
                    doc.moveDown();
                    // Metrics Summary
                    if (options.includeMetrics) {
                        doc.fontSize(16).text('Resumen de Métricas', { underline: true });
                        doc.moveDown(0.5);
                        doc.fontSize(12);
                        doc.text(`Total de palabras clave: ${metrics.totalKeywords}`);
                        doc.text(`URLs procesadas: ${metrics.urlsProcessed}`);
                        doc.text(`URLs fallidas: ${metrics.urlsFailed}`);
                        doc.text(`Tiempo de procesamiento: ${Math.round(metrics.processingTime / 1000)}s`);
                        doc.text(`Densidad promedio: ${metrics.averageDensity.toFixed(2)}%`);
                        doc.moveDown();
                        // Keywords by category
                        doc.text('Palabras clave por categoría:');
                        doc.text(`  • Primarias: ${metrics.keywordsByCategory.primary}`);
                        doc.text(`  • Secundarias: ${metrics.keywordsByCategory.secondary}`);
                        doc.text(`  • Long-tail: ${metrics.keywordsByCategory.longTail}`);
                        doc.text(`  • Marca: ${metrics.keywordsByCategory.brand}`);
                        doc.moveDown();
                    }
                    // Top Keywords
                    doc.fontSize(16).text('Top 20 Palabras Clave', { underline: true });
                    doc.moveDown(0.5);
                    const topKeywords = keywords
                        .sort((a, b) => b.relevanceScore - a.relevanceScore)
                        .slice(0, 20);
                    doc.fontSize(10);
                    topKeywords.forEach((keyword, index) => {
                        const y = doc.y;
                        if (y > 700) {
                            doc.addPage();
                        }
                        doc.text(`${index + 1}. ${keyword.keyword}`, 50, doc.y);
                        doc.text(`Freq: ${keyword.frequency}`, 250, y);
                        doc.text(`Dens: ${keyword.density.toFixed(1)}%`, 320, y);
                        doc.text(`Cat: ${keyword.category}`, 390, y);
                        doc.text(`Score: ${keyword.relevanceScore.toFixed(2)}`, 470, y);
                        doc.moveDown(0.3);
                    });
                    // Competitors
                    if (competitors.length > 0) {
                        doc.addPage();
                        doc.fontSize(16).text('Competidores Analizados', { underline: true });
                        doc.moveDown(0.5);
                        competitors.forEach((competitor, index) => {
                            var _a;
                            if (doc.y > 650) {
                                doc.addPage();
                            }
                            doc.fontSize(12).text(`${index + 1}. ${competitor.url}`, { link: competitor.url });
                            doc.fontSize(10);
                            doc.text(`Título: ${competitor.title || 'N/A'}`);
                            doc.text(`Meta descripción: ${((_a = competitor.metaDescription) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) || 'N/A'}...`);
                            doc.text(`Total keywords: ${competitor.totalKeywords}`);
                            doc.text(`Tiempo de procesamiento: ${competitor.processingTime}ms`);
                            doc.moveDown();
                        });
                    }
                    // Opportunities
                    if (options.includeOpportunities && opportunities.length > 0) {
                        doc.addPage();
                        doc.fontSize(16).text('Oportunidades SEO', { underline: true });
                        doc.moveDown(0.5);
                        opportunities
                            .sort((a, b) => b.priority - a.priority)
                            .forEach((opportunity, index) => {
                            if (doc.y > 650) {
                                doc.addPage();
                            }
                            doc.fontSize(12).text(`${index + 1}. ${opportunity.type.toUpperCase()}`, { underline: true });
                            doc.fontSize(10);
                            doc.text(`Descripción: ${opportunity.description}`);
                            doc.text(`Prioridad: ${opportunity.priority}/5`);
                            doc.text(`Confianza: ${(opportunity.confidenceScore * 100).toFixed(0)}%`);
                            if (opportunity.suggestedKeywords.length > 0) {
                                doc.text(`Keywords sugeridas: ${opportunity.suggestedKeywords.join(', ')}`);
                            }
                            doc.moveDown();
                        });
                    }
                    // Footer
                    const pages = doc.bufferedPageRange();
                    for (let i = 0; i < pages.count; i++) {
                        doc.switchToPage(i);
                        doc.fontSize(8).text(`Página ${i + 1} de ${pages.count} - Generado por AI Tools Platform`, 50, doc.page.height - 50, { align: 'center' });
                    }
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    exportKeywordsOnly(keywords, format) {
        return __awaiter(this, void 0, void 0, function* () {
            if (format === 'json') {
                const jsonData = {
                    exportDate: new Date().toISOString(),
                    totalKeywords: keywords.length,
                    keywords: keywords.map(k => ({
                        keyword: k.keyword,
                        frequency: k.frequency,
                        density: k.density,
                        category: k.category,
                        relevanceScore: k.relevanceScore,
                        sourceUrl: k.sourceUrl,
                        positions: k.positions
                    }))
                };
                return Buffer.from(JSON.stringify(jsonData, null, 2));
            }
            // CSV format
            const tempDir = path_1.default.join(process.cwd(), 'temp');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            const tempFile = path_1.default.join(tempDir, `keywords-${Date.now()}.csv`);
            const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
                path: tempFile,
                header: [
                    { id: 'keyword', title: 'Keyword' },
                    { id: 'frequency', title: 'Frequency' },
                    { id: 'density', title: 'Density (%)' },
                    { id: 'category', title: 'Category' },
                    { id: 'relevanceScore', title: 'Relevance Score' },
                    { id: 'sourceUrl', title: 'Source URL' },
                    { id: 'positions', title: 'Positions' }
                ]
            });
            const csvData = keywords.map(k => ({
                keyword: k.keyword,
                frequency: k.frequency,
                density: k.density,
                category: k.category,
                relevanceScore: k.relevanceScore,
                sourceUrl: k.sourceUrl,
                positions: k.positions.join(', ')
            }));
            yield csvWriter.writeRecords(csvData);
            const buffer = fs_1.default.readFileSync(tempFile);
            fs_1.default.unlinkSync(tempFile);
            return buffer;
        });
    }
    generateFileName(analysisId, format) {
        const date = new Date().toISOString().split('T')[0];
        return `keyword-analysis-${analysisId.substring(0, 8)}-${date}.${format}`;
    }
}
exports.ExportService = ExportService;
