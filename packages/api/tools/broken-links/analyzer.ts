import { v4 as uuidv4 } from 'uuid';
import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import { URL } from 'url';

export interface AnalyzerConfig {
  url: string;
  depth: number;
  excludePaths: string[];
  includeExternal: boolean;
  timeout: number;
  onProgress?: (progress: ProgressData) => void;
  onPageAnalyzed?: (pageData: PageData) => void;
  onBrokenLink?: (brokenLink: BrokenLinkData) => void;
}

export interface ProgressData {
  percentage: number;
  pagesAnalyzed: number;
  linksFound: number;
  brokenLinks: number;
}

export interface PageData {
  url: string;
  statusCode: number;
  linksCount: number;
}

export interface BrokenLinkData {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  errorType: string;
  linkType: 'internal' | 'external';
}

export interface AnalysisResults {
  summary: {
    totalPages: number;
    totalLinks: number;
    brokenLinks: number;
    healthScore: number;
    analysisTime: number;
  };
  brokenLinks: BrokenLinkData[];
}

export class BrokenLinkAnalyzer {
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private foundLinks: Set<string> = new Set();
  private brokenLinks: BrokenLinkData[] = [];
  private cancelled: boolean = false;

  async analyze(config: AnalyzerConfig): Promise<AnalysisResults> {
    const startTime = Date.now();
    this.reset();

    try {
      // Inicializar Puppeteer
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      // Validar URL inicial
      const baseUrl = new URL(config.url);
      
      // Iniciar crawling
      await this.crawlUrl(config.url, baseUrl, config, 0);

      // Verificar enlaces encontrados
      await this.verifyLinks(config);

      const endTime = Date.now();
      const analysisTime = endTime - startTime;

      // Calcular métricas finales
      const summary = {
        totalPages: this.visitedUrls.size,
        totalLinks: this.foundLinks.size,
        brokenLinks: this.brokenLinks.length,
        healthScore: this.calculateHealthScore(),
        analysisTime
      };

      return {
        summary,
        brokenLinks: this.brokenLinks
      };

    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private reset(): void {
    this.visitedUrls.clear();
    this.foundLinks.clear();
    this.brokenLinks = [];
    this.cancelled = false;
  }

  private async crawlUrl(
    url: string, 
    baseUrl: URL, 
    config: AnalyzerConfig, 
    currentDepth: number
  ): Promise<void> {
    if (this.cancelled || currentDepth >= config.depth) {
      return;
    }

    // Verificar si ya visitamos esta URL
    if (this.visitedUrls.has(url)) {
      return;
    }

    // Verificar exclusiones
    if (this.isExcluded(url, config.excludePaths)) {
      return;
    }

    this.visitedUrls.add(url);

    try {
      const page = await this.browser!.newPage();
      
      // Configurar timeout y user agent
      await page.setDefaultTimeout(config.timeout);
      await page.setUserAgent('Mozilla/5.0 (compatible; BrokenLinkChecker/1.0)');

      // Navegar a la página
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: config.timeout 
      });

      const statusCode = response?.status() || 0;
      
      // Extraer enlaces de la página
      const links = await this.extractLinks(page, url, baseUrl, config.includeExternal);
      
      // Reportar progreso
      if (config.onPageAnalyzed) {
        config.onPageAnalyzed({
          url,
          statusCode,
          linksCount: links.length
        });
      }

      // Agregar enlaces encontrados
      links.forEach(link => this.foundLinks.add(link));

      await page.close();

      // Reportar progreso general
      if (config.onProgress) {
        config.onProgress({
          percentage: Math.min(100, (this.visitedUrls.size / (config.depth * 10)) * 100),
          pagesAnalyzed: this.visitedUrls.size,
          linksFound: this.foundLinks.size,
          brokenLinks: this.brokenLinks.length
        });
      }

      // Continuar crawling en profundidad para enlaces internos
      if (currentDepth < config.depth - 1) {
        const internalLinks = links.filter(link => this.isInternalLink(link, baseUrl));
        
        for (const link of internalLinks.slice(0, 10)) { // Limitar para evitar explosión
          if (!this.cancelled) {
            await this.crawlUrl(link, baseUrl, config, currentDepth + 1);
          }
        }
      }

    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      
      // Reportar como enlace roto si es un error de navegación
      this.brokenLinks.push({
        sourceUrl: 'crawler',
        targetUrl: url,
        statusCode: 0,
        errorType: 'navigation_error',
        linkType: this.isInternalLink(url, baseUrl) ? 'internal' : 'external'
      });
    }
  }

  private async extractLinks(
    page: Page, 
    sourceUrl: string, 
    baseUrl: URL, 
    includeExternal: boolean
  ): Promise<string[]> {
    try {
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(anchor => (anchor as HTMLAnchorElement).href).filter(href => href);
      });

      // Filtrar y normalizar enlaces
      const filteredLinks = links
        .map(link => {
          try {
            return new URL(link, sourceUrl).href;
          } catch {
            return null;
          }
        })
        .filter((link): link is string => {
          if (!link) return false;
          
          const linkUrl = new URL(link);
          
          // Excluir ciertos protocolos
          if (!['http:', 'https:'].includes(linkUrl.protocol)) {
            return false;
          }

          // Filtrar enlaces externos si no están incluidos
          if (!includeExternal && !this.isInternalLink(link, baseUrl)) {
            return false;
          }

          return true;
        });

      return [...new Set(filteredLinks)]; // Eliminar duplicados

    } catch (error) {
      console.error(`Error extracting links from ${sourceUrl}:`, error);
      return [];
    }
  }

  private async verifyLinks(config: AnalyzerConfig): Promise<void> {
    const linksArray = Array.from(this.foundLinks);
    const batchSize = 10; // Procesar en lotes para no sobrecargar

    for (let i = 0; i < linksArray.length; i += batchSize) {
      if (this.cancelled) break;

      const batch = linksArray.slice(i, i + batchSize);
      const promises = batch.map(link => this.verifyLink(link, config));
      
      await Promise.allSettled(promises);

      // Reportar progreso
      if (config.onProgress) {
        config.onProgress({
          percentage: Math.min(100, ((i + batchSize) / linksArray.length) * 100),
          pagesAnalyzed: this.visitedUrls.size,
          linksFound: this.foundLinks.size,
          brokenLinks: this.brokenLinks.length
        });
      }
    }
  }

  private async verifyLink(url: string, config: AnalyzerConfig): Promise<void> {
    try {
      const response = await axios.head(url, {
        timeout: config.timeout,
        // maxRedirects is not supported in Axios HEAD config type in our TS version; follow redirects by GET if needed
        validateStatus: () => true, // No lanzar error por status codes
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrokenLinkChecker/1.0)'
        }
      });

      const statusCode = response.status;
      
      if (statusCode >= 400) {
        const errorType = this.getErrorType(statusCode);
        const baseUrl = new URL(config.url);
        
        const brokenLink: BrokenLinkData = {
          sourceUrl: this.findSourceUrl(url) || 'unknown',
          targetUrl: url,
          statusCode,
          errorType,
          linkType: this.isInternalLink(url, baseUrl) ? 'internal' : 'external'
        };

        this.brokenLinks.push(brokenLink);

        if (config.onBrokenLink) {
          config.onBrokenLink(brokenLink);
        }
      }

    } catch (error: any) {
      const errorType = this.getErrorTypeFromException(error);
      const baseUrl = new URL(config.url);
      
      const brokenLink: BrokenLinkData = {
        sourceUrl: this.findSourceUrl(url) || 'unknown',
        targetUrl: url,
        statusCode: 0,
        errorType,
        linkType: this.isInternalLink(url, baseUrl) ? 'internal' : 'external'
      };

      this.brokenLinks.push(brokenLink);

      if (config.onBrokenLink) {
        config.onBrokenLink(brokenLink);
      }
    }
  }

  private getErrorType(statusCode: number): string {
    if (statusCode === 404) return '404';
    if (statusCode >= 500) return '500';
    if (statusCode === 403) return 'forbidden';
    if (statusCode === 401) return 'unauthorized';
    return 'http_error';
  }

  private getErrorTypeFromException(error: any): string {
    if (error.code === 'ENOTFOUND') return 'dns_error';
    if (error.code === 'ECONNREFUSED') return 'connection_refused';
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) return 'timeout';
    if (error.message?.includes('SSL') || error.message?.includes('certificate')) return 'ssl_error';
    if (error.message?.includes('redirect')) return 'redirect_loop';
    return 'network_error';
  }

  private isInternalLink(url: string, baseUrl: URL): boolean {
    try {
      const linkUrl = new URL(url);
      return linkUrl.hostname === baseUrl.hostname;
    } catch {
      return false;
    }
  }

  private isExcluded(url: string, excludePaths: string[]): boolean {
    try {
      const urlObj = new URL(url);
      return excludePaths.some(path => urlObj.pathname.startsWith(path));
    } catch {
      return false;
    }
  }

  private findSourceUrl(targetUrl: string): string | null {
    // En una implementación más compleja, mantendríamos un mapa de enlaces por página
    // Por simplicidad, retornamos la primera URL visitada
    return Array.from(this.visitedUrls)[0] || null;
  }

  private calculateHealthScore(): number {
    if (this.foundLinks.size === 0) return 100;
    
    const brokenPercentage = (this.brokenLinks.length / this.foundLinks.size) * 100;
    return Math.max(0, Math.round(100 - brokenPercentage));
  }

  cancel(): void {
    this.cancelled = true;
  }
}