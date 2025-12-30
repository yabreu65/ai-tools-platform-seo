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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
class ExportService {
    export(results, format) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (format.toLowerCase()) {
                case 'csv':
                    return this.exportToCSV(results);
                case 'pdf':
                    return this.exportToPDF(results);
                default:
                    throw new Error(`Formato de exportación no soportado: ${format}`);
            }
        });
    }
    exportToCSV(results) {
        const headers = [
            'URL Origen',
            'URL Destino',
            'Código de Estado',
            'Tipo de Error',
            'Tipo de Enlace'
        ];
        const rows = results.brokenLinks.map(link => [
            `"${link.sourceUrl}"`,
            `"${link.targetUrl}"`,
            link.statusCode.toString(),
            `"${link.errorType}"`,
            `"${link.linkType}"`
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        return csvContent;
    }
    exportToPDF(results) {
        // Generar HTML simple que se puede convertir a PDF
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Enlaces Rotos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #e74c3c; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .error-404 { color: #e74c3c; }
        .error-timeout { color: #f39c12; }
        .error-ssl { color: #9b59b6; }
        .internal { color: #3498db; }
        .external { color: #27ae60; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Enlaces Rotos</h1>
        <p>Análisis completo de enlaces rotos encontrados en el sitio web</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total de Páginas</h3>
            <div class="value">${results.summary.totalPages}</div>
        </div>
        <div class="metric">
            <h3>Total de Enlaces</h3>
            <div class="value">${results.summary.totalLinks}</div>
        </div>
        <div class="metric">
            <h3>Enlaces Rotos</h3>
            <div class="value">${results.summary.brokenLinks}</div>
        </div>
        <div class="metric">
            <h3>Puntuación de Salud</h3>
            <div class="value">${results.summary.healthScore}%</div>
        </div>
    </div>

    <h2>Enlaces Rotos Detectados</h2>
    <table>
        <thead>
            <tr>
                <th>URL Origen</th>
                <th>URL Destino</th>
                <th>Código</th>
                <th>Tipo de Error</th>
                <th>Tipo</th>
            </tr>
        </thead>
        <tbody>
            ${results.brokenLinks.map(link => `
                <tr>
                    <td>${link.sourceUrl}</td>
                    <td>${link.targetUrl}</td>
                    <td>${link.statusCode}</td>
                    <td class="error-${link.errorType.toLowerCase()}">${link.errorType}</td>
                    <td class="${link.linkType}">${link.linkType}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
        <h3>Recomendaciones</h3>
        <ul>
            <li>Revisar y corregir todos los enlaces con código 404</li>
            <li>Verificar la configuración SSL para enlaces con errores de certificado</li>
            <li>Considerar aumentar el timeout para enlaces que fallan por tiempo de espera</li>
            <li>Implementar redirects 301 para URLs que han cambiado</li>
        </ul>
    </div>
</body>
</html>`;
        return html;
    }
}
exports.ExportService = ExportService;
