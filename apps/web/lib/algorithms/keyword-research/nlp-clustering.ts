/**
 * Algoritmo avanzado de clustering NLP para agrupación semántica de keywords
 * Utiliza múltiples técnicas de NLP para crear clusters coherentes y útiles
 */

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: number;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  serpFeatures: string[];
}

interface ClusteringOptions {
  minClusterSize: number;
  maxClusters: number;
  similarityThreshold: number;
  intentWeight: number;
  semanticWeight: number;
  structuralWeight: number;
}

interface KeywordCluster {
  id: string;
  name: string;
  keywords: KeywordData[];
  primaryKeyword: KeywordData;
  intent: string;
  avgVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  totalVolume: number;
  size: number;
  coherenceScore: number;
  themes: string[];
  opportunities: string[];
  recommendations: string[];
}

interface ClusteringResult {
  clusters: KeywordCluster[];
  unclustered: KeywordData[];
  statistics: {
    totalKeywords: number;
    clusteredKeywords: number;
    clusterCount: number;
    avgClusterSize: number;
    coherenceScore: number;
  };
  intentDistribution: Record<string, number>;
  recommendations: string[];
}

class NLPKeywordClustering {
  private readonly DEFAULT_OPTIONS: ClusteringOptions = {
    minClusterSize: 3,
    maxClusters: 50,
    similarityThreshold: 0.6,
    intentWeight: 0.3,
    semanticWeight: 0.4,
    structuralWeight: 0.3
  };

  // Stopwords comunes en español e inglés
  private readonly STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
    'el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le',
    'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como'
  ]);

  // Términos de intención comercial
  private readonly COMMERCIAL_TERMS = new Set([
    'buy', 'purchase', 'price', 'cost', 'cheap', 'discount', 'sale', 'deal',
    'comprar', 'precio', 'barato', 'descuento', 'oferta', 'venta'
  ]);

  // Términos informativos
  private readonly INFORMATIONAL_TERMS = new Set([
    'how', 'what', 'why', 'when', 'where', 'guide', 'tutorial', 'tips', 'learn',
    'como', 'que', 'por', 'cuando', 'donde', 'guia', 'tutorial', 'consejos', 'aprender'
  ]);

  /**
   * Agrupa keywords usando clustering semántico avanzado
   */
  async clusterKeywords(
    keywords: KeywordData[],
    options: Partial<ClusteringOptions> = {}
  ): Promise<ClusteringResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Preprocesar keywords
    const processedKeywords = this.preprocessKeywords(keywords);

    // Calcular matriz de similitud
    const similarityMatrix = this.calculateSimilarityMatrix(processedKeywords, opts);

    // Aplicar clustering jerárquico
    const clusters = this.performHierarchicalClustering(
      processedKeywords,
      similarityMatrix,
      opts
    );

    // Refinar clusters
    const refinedClusters = this.refineClusters(clusters, opts);

    // Generar nombres y metadatos para clusters
    const namedClusters = this.generateClusterMetadata(refinedClusters);

    // Identificar keywords no agrupadas
    const clusteredKeywordIds = new Set(
      namedClusters.flatMap(cluster => cluster.keywords.map(k => k.keyword))
    );
    const unclustered = keywords.filter(k => !clusteredKeywordIds.has(k.keyword));

    // Calcular estadísticas
    const statistics = this.calculateStatistics(keywords, namedClusters);

    // Calcular distribución de intención
    const intentDistribution = this.calculateIntentDistribution(namedClusters);

    // Generar recomendaciones
    const recommendations = this.generateClusteringRecommendations(namedClusters, statistics);

    return {
      clusters: namedClusters,
      unclustered,
      statistics,
      intentDistribution,
      recommendations
    };
  }

  /**
   * Preprocesa keywords para análisis
   */
  private preprocessKeywords(keywords: KeywordData[]): Array<KeywordData & { tokens: string[]; stems: string[] }> {
    return keywords.map(keyword => ({
      ...keyword,
      tokens: this.tokenize(keyword.keyword),
      stems: this.stemTokens(this.tokenize(keyword.keyword))
    }));
  }

  /**
   * Tokeniza una keyword
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !this.STOPWORDS.has(token));
  }

  /**
   * Aplica stemming básico a los tokens
   */
  private stemTokens(tokens: string[]): string[] {
    return tokens.map(token => this.simpleStem(token));
  }

  /**
   * Stemming simple (puede mejorarse con librerías especializadas)
   */
  private simpleStem(word: string): string {
    // Reglas básicas de stemming en inglés
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('er')) return word.slice(0, -2);
    if (word.endsWith('est')) return word.slice(0, -3);
    if (word.endsWith('ly')) return word.slice(0, -2);
    if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);

    // Reglas básicas de stemming en español
    if (word.endsWith('ando')) return word.slice(0, -4);
    if (word.endsWith('iendo')) return word.slice(0, -5);
    if (word.endsWith('mente')) return word.slice(0, -5);
    if (word.endsWith('ción')) return word.slice(0, -4);
    if (word.endsWith('sión')) return word.slice(0, -4);

    return word;
  }

  /**
   * Calcula matriz de similitud entre keywords
   */
  private calculateSimilarityMatrix(
    keywords: Array<KeywordData & { tokens: string[]; stems: string[] }>,
    options: ClusteringOptions
  ): number[][] {
    const matrix: number[][] = [];

    for (let i = 0; i < keywords.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < keywords.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          matrix[i][j] = this.calculateKeywordSimilarity(keywords[i], keywords[j], options);
        }
      }
    }

    return matrix;
  }

  /**
   * Calcula similitud entre dos keywords
   */
  private calculateKeywordSimilarity(
    keyword1: KeywordData & { tokens: string[]; stems: string[] },
    keyword2: KeywordData & { tokens: string[]; stems: string[] },
    options: ClusteringOptions
  ): number {
    // Similitud semántica (basada en tokens y stems)
    const semanticSim = this.calculateSemanticSimilarity(keyword1, keyword2);

    // Similitud estructural (longitud, patrones)
    const structuralSim = this.calculateStructuralSimilarity(keyword1, keyword2);

    // Similitud de intención
    const intentSim = this.calculateIntentSimilarity(keyword1, keyword2);

    // Combinar similitudes con pesos
    return (
      semanticSim * options.semanticWeight +
      structuralSim * options.structuralWeight +
      intentSim * options.intentWeight
    );
  }

  /**
   * Calcula similitud semántica usando Jaccard y overlap
   */
  private calculateSemanticSimilarity(
    keyword1: KeywordData & { tokens: string[]; stems: string[] },
    keyword2: KeywordData & { tokens: string[]; stems: string[] }
  ): number {
    // Similitud Jaccard en tokens originales
    const tokenJaccard = this.jaccardSimilarity(
      new Set(keyword1.tokens),
      new Set(keyword2.tokens)
    );

    // Similitud Jaccard en stems
    const stemJaccard = this.jaccardSimilarity(
      new Set(keyword1.stems),
      new Set(keyword2.stems)
    );

    // Similitud de overlap (para keywords de diferente longitud)
    const tokenOverlap = this.overlapSimilarity(
      new Set(keyword1.tokens),
      new Set(keyword2.tokens)
    );

    // Combinar métricas
    return Math.max(tokenJaccard * 0.4 + stemJaccard * 0.4 + tokenOverlap * 0.2, 0);
  }

  /**
   * Calcula similitud estructural
   */
  private calculateStructuralSimilarity(
    keyword1: KeywordData & { tokens: string[]; stems: string[] },
    keyword2: KeywordData & { tokens: string[]; stems: string[] }
  ): number {
    // Similitud en longitud de tokens
    const lengthDiff = Math.abs(keyword1.tokens.length - keyword2.tokens.length);
    const lengthSim = Math.max(0, 1 - lengthDiff / Math.max(keyword1.tokens.length, keyword2.tokens.length));

    // Similitud en estructura de caracteres (para detectar variaciones)
    const charSim = this.calculateCharacterSimilarity(keyword1.keyword, keyword2.keyword);

    return lengthSim * 0.6 + charSim * 0.4;
  }

  /**
   * Calcula similitud de intención
   */
  private calculateIntentSimilarity(keyword1: KeywordData, keyword2: KeywordData): number {
    // Intención exacta
    if (keyword1.intent === keyword2.intent) return 1.0;

    // Intenciones relacionadas
    const intentRelations: Record<string, string[]> = {
      'commercial': ['transactional'],
      'transactional': ['commercial'],
      'informational': ['navigational'],
      'navigational': ['informational']
    };

    if (intentRelations[keyword1.intent]?.includes(keyword2.intent)) {
      return 0.7;
    }

    return 0.0;
  }

  /**
   * Calcula similitud Jaccard entre dos conjuntos
   */
  private jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calcula similitud de overlap
   */
  private overlapSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const minSize = Math.min(set1.size, set2.size);
    return minSize === 0 ? 0 : intersection.size / minSize;
  }

  /**
   * Calcula similitud de caracteres (para detectar variaciones tipográficas)
   */
  private calculateCharacterSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula distancia de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Realiza clustering jerárquico
   */
  private performHierarchicalClustering(
    keywords: Array<KeywordData & { tokens: string[]; stems: string[] }>,
    similarityMatrix: number[][],
    options: ClusteringOptions
  ): KeywordData[][] {
    // Inicializar cada keyword como su propio cluster
    let clusters: number[][] = keywords.map((_, i) => [i]);

    // Clustering aglomerativo
    while (clusters.length > 1 && clusters.length > keywords.length - options.maxClusters) {
      let maxSimilarity = -1;
      let mergeIndices: [number, number] = [0, 1];

      // Encontrar el par de clusters más similar
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const similarity = this.calculateClusterSimilarity(
            clusters[i],
            clusters[j],
            similarityMatrix
          );

          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mergeIndices = [i, j];
          }
        }
      }

      // Si la similitud es muy baja, detener clustering
      if (maxSimilarity < options.similarityThreshold) {
        break;
      }

      // Fusionar clusters
      const [i, j] = mergeIndices;
      const newCluster = [...clusters[i], ...clusters[j]];
      clusters = clusters.filter((_, index) => index !== i && index !== j);
      clusters.push(newCluster);
    }

    // Convertir índices a keywords
    return clusters
      .filter(cluster => cluster.length >= options.minClusterSize)
      .map(cluster => cluster.map(index => keywords[index]));
  }

  /**
   * Calcula similitud entre clusters (linkage promedio)
   */
  private calculateClusterSimilarity(
    cluster1: number[],
    cluster2: number[],
    similarityMatrix: number[][]
  ): number {
    let totalSimilarity = 0;
    let count = 0;

    for (const i of cluster1) {
      for (const j of cluster2) {
        totalSimilarity += similarityMatrix[i][j];
        count++;
      }
    }

    return count > 0 ? totalSimilarity / count : 0;
  }

  /**
   * Refina clusters eliminando outliers y mejorando coherencia
   */
  private refineClusters(
    clusters: KeywordData[][],
    options: ClusteringOptions
  ): KeywordData[][] {
    return clusters.map(cluster => {
      if (cluster.length <= options.minClusterSize) return cluster;

      // Calcular coherencia interna de cada keyword
      const keywordCoherence = cluster.map(keyword => {
        const similarities = cluster
          .filter(other => other !== keyword)
          .map(other => this.calculateKeywordSimilarity(
            keyword as any,
            other as any,
            options
          ));

        return {
          keyword,
          coherence: similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length
        };
      });

      // Ordenar por coherencia y mantener las más coherentes
      keywordCoherence.sort((a, b) => b.coherence - a.coherence);

      // Eliminar keywords con coherencia muy baja
      const threshold = keywordCoherence[0].coherence * 0.6;
      return keywordCoherence
        .filter(item => item.coherence >= threshold)
        .map(item => item.keyword);
    }).filter(cluster => cluster.length >= options.minClusterSize);
  }

  /**
   * Genera metadatos para clusters
   */
  private generateClusterMetadata(clusters: KeywordData[][]): KeywordCluster[] {
    return clusters.map((keywords, index) => {
      // Keyword principal (mayor volumen)
      const primaryKeyword = keywords.reduce((prev, current) =>
        current.searchVolume > prev.searchVolume ? current : prev
      );

      // Métricas promedio
      const avgVolume = Math.round(keywords.reduce((sum, k) => sum + k.searchVolume, 0) / keywords.length);
      const avgDifficulty = Math.round(keywords.reduce((sum, k) => sum + k.difficulty, 0) / keywords.length);
      const avgCpc = Math.round((keywords.reduce((sum, k) => sum + k.cpc, 0) / keywords.length) * 100) / 100;
      const totalVolume = keywords.reduce((sum, k) => sum + k.searchVolume, 0);

      // Intención dominante
      const intentCounts = keywords.reduce((acc, k) => {
        acc[k.intent] = (acc[k.intent] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const dominantIntent = Object.entries(intentCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      // Temas comunes
      const themes = this.extractCommonThemes(keywords);

      // Score de coherencia
      const coherenceScore = this.calculateClusterCoherence(keywords);

      // Oportunidades
      const opportunities = this.identifyClusterOpportunities(keywords, avgDifficulty, totalVolume);

      // Recomendaciones
      const recommendations = this.generateClusterRecommendations(keywords, dominantIntent, avgDifficulty);

      return {
        id: `cluster-${index + 1}`,
        name: this.generateClusterName(keywords, themes),
        keywords,
        primaryKeyword,
        intent: dominantIntent,
        avgVolume,
        avgDifficulty,
        avgCpc,
        totalVolume,
        size: keywords.length,
        coherenceScore,
        themes,
        opportunities,
        recommendations
      };
    });
  }

  /**
   * Extrae temas comunes del cluster
   */
  private extractCommonThemes(keywords: KeywordData[]): string[] {
    const tokenFrequency: Record<string, number> = {};

    keywords.forEach(keyword => {
      const tokens = this.tokenize(keyword.keyword);
      tokens.forEach(token => {
        tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
      });
    });

    // Obtener tokens más frecuentes (que aparecen en al menos 30% de las keywords)
    const threshold = Math.max(2, Math.ceil(keywords.length * 0.3));
    return Object.entries(tokenFrequency)
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([token, _]) => token);
  }

  /**
   * Calcula coherencia del cluster
   */
  private calculateClusterCoherence(keywords: KeywordData[]): number {
    if (keywords.length < 2) return 1.0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        totalSimilarity += this.calculateKeywordSimilarity(
          keywords[i] as any,
          keywords[j] as any,
          this.DEFAULT_OPTIONS
        );
        comparisons++;
      }
    }

    return Math.round((totalSimilarity / comparisons) * 100) / 100;
  }

  /**
   * Identifica oportunidades del cluster
   */
  private identifyClusterOpportunities(
    keywords: KeywordData[],
    avgDifficulty: number,
    totalVolume: number
  ): string[] {
    const opportunities: string[] = [];

    if (avgDifficulty < 30) {
      opportunities.push('Low competition cluster - quick wins possible');
    }

    if (totalVolume > 50000) {
      opportunities.push('High volume potential - significant traffic opportunity');
    }

    const lowDiffKeywords = keywords.filter(k => k.difficulty < 25);
    if (lowDiffKeywords.length > keywords.length * 0.5) {
      opportunities.push('Multiple easy-to-rank keywords available');
    }

    const highVolumeKeywords = keywords.filter(k => k.searchVolume > 10000);
    if (highVolumeKeywords.length > 0) {
      opportunities.push(`${highVolumeKeywords.length} high-volume keywords to target`);
    }

    return opportunities;
  }

  /**
   * Genera recomendaciones para el cluster
   */
  private generateClusterRecommendations(
    keywords: KeywordData[],
    intent: string,
    avgDifficulty: number
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones por intención
    if (intent === 'informational') {
      recommendations.push('Create comprehensive, educational content');
      recommendations.push('Focus on answering user questions thoroughly');
    } else if (intent === 'commercial') {
      recommendations.push('Create comparison and review content');
      recommendations.push('Include clear calls-to-action');
    } else if (intent === 'transactional') {
      recommendations.push('Optimize for conversion-focused landing pages');
      recommendations.push('Include pricing and purchase information');
    }

    // Recomendaciones por dificultad
    if (avgDifficulty < 30) {
      recommendations.push('Target all keywords in this cluster simultaneously');
    } else if (avgDifficulty > 60) {
      recommendations.push('Start with long-tail variations first');
      recommendations.push('Build authority gradually before targeting main terms');
    }

    // Recomendación de contenido
    recommendations.push('Create topic cluster content strategy');

    return recommendations;
  }

  /**
   * Genera nombre para el cluster
   */
  private generateClusterName(keywords: KeywordData[], themes: string[]): string {
    if (themes.length > 0) {
      return themes.slice(0, 2).join(' + ').toUpperCase();
    }

    // Usar keyword principal como fallback
    const primaryKeyword = keywords.reduce((prev, current) =>
      current.searchVolume > prev.searchVolume ? current : prev
    );

    return primaryKeyword.keyword.split(' ').slice(0, 2).join(' ').toUpperCase();
  }

  /**
   * Calcula estadísticas generales
   */
  private calculateStatistics(keywords: KeywordData[], clusters: KeywordCluster[]): any {
    const clusteredKeywords = clusters.reduce((sum, cluster) => sum + cluster.size, 0);
    const avgClusterSize = clusters.length > 0 ? Math.round(clusteredKeywords / clusters.length) : 0;
    const avgCoherence = clusters.length > 0 
      ? Math.round((clusters.reduce((sum, c) => sum + c.coherenceScore, 0) / clusters.length) * 100) / 100
      : 0;

    return {
      totalKeywords: keywords.length,
      clusteredKeywords,
      clusterCount: clusters.length,
      avgClusterSize,
      coherenceScore: avgCoherence
    };
  }

  /**
   * Calcula distribución de intención
   */
  private calculateIntentDistribution(clusters: KeywordCluster[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    clusters.forEach(cluster => {
      distribution[cluster.intent] = (distribution[cluster.intent] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Genera recomendaciones generales de clustering
   */
  private generateClusteringRecommendations(
    clusters: KeywordCluster[],
    statistics: any
  ): string[] {
    const recommendations: string[] = [];

    if (statistics.coherenceScore > 0.7) {
      recommendations.push('Excellent clustering quality - clusters are highly coherent');
    } else if (statistics.coherenceScore < 0.5) {
      recommendations.push('Consider adjusting similarity threshold for better clustering');
    }

    if (statistics.avgClusterSize < 3) {
      recommendations.push('Many small clusters - consider lowering similarity threshold');
    } else if (statistics.avgClusterSize > 10) {
      recommendations.push('Large clusters detected - consider increasing similarity threshold');
    }

    const highOpportunityClusters = clusters.filter(c => c.avgDifficulty < 30 && c.totalVolume > 10000);
    if (highOpportunityClusters.length > 0) {
      recommendations.push(`${highOpportunityClusters.length} high-opportunity clusters identified - prioritize these`);
    }

    recommendations.push('Create content hubs around each major cluster');
    recommendations.push('Use cluster themes for internal linking strategy');

    return recommendations;
  }
}

export default NLPKeywordClustering;
export type { KeywordData, KeywordCluster, ClusteringOptions, ClusteringResult };