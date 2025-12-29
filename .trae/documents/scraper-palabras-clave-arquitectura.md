# Scraper de Palabras Clave SEO - Arquitectura Técnica

## 1. Architecture design

```mermaid
graph TD
  A[User Browser] --> B[Next.js Frontend Application]
  B --> C[Express.js Backend API]
  C --> D[Puppeteer/Playwright Scraping Engine]
  C --> E[OpenAI API for Text Analysis]
  C --> F[MongoDB Database]
  C --> G[Redis Cache]
  
  subgraph "Frontend Layer"
    B
  end
  
  subgraph "Backend Layer"
    C
    D
    G
  end
  
  subgraph "AI Processing"
    E
  end
  
  subgraph "Data Layer"
    F
  end
```

## 2. Technology Description

- Frontend: Next.js@14 + TypeScript + Tailwind CSS + Lucide React + Chart.js
- Backend: Express.js@4 + TypeScript + Puppeteer + OpenAI SDK
- Database: MongoDB (via Supabase)
- Cache: Redis para optimización de scraping
- AI Processing: OpenAI GPT-4 para análisis semántico

## 3. Route definitions

| Route | Purpose |
|-------|---------|
| /keyword-scraper | Página principal del scraper con formulario de entrada |
| /keyword-scraper/results/[id] | Página de resultados de análisis específico |
| /keyword-scraper/compare | Página de comparación entre múltiples competidores |
| /keyword-scraper/history | Historial de análisis del usuario |
| /keyword-scraper/export/[id] | Descarga de resultados en CSV/PDF |

## 4. API definitions

### 4.1 Core API

**Iniciar análisis de scraping**
```
POST /api/keyword-scraper/analyze
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| urls | string[] | true | Array de URLs a analizar (máx 10) |
| depth | number | false | Profundidad de scraping (1-5, default: 1) |
| language | string | false | Idioma de análisis (es, en, default: auto) |
| includeMetaTags | boolean | false | Incluir meta tags en análisis |
| includeHeadings | boolean | false | Incluir headings H1-H6 |
| includeContent | boolean | false | Incluir contenido de párrafos |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| analysisId | string | ID único del análisis |
| status | string | Estado del procesamiento |
| estimatedTime | number | Tiempo estimado en segundos |

**Obtener resultados de análisis**
```
GET /api/keyword-scraper/results/{analysisId}
```

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| keywords | KeywordData[] | Array de palabras clave extraídas |
| metrics | AnalysisMetrics | Métricas generales del análisis |
| opportunities | Opportunity[] | Oportunidades SEO identificadas |
| competitors | CompetitorData[] | Datos de competidores analizados |

**Exportar resultados**
```
GET /api/keyword-scraper/export/{analysisId}?format={csv|pdf}
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| format | string | true | Formato de exportación (csv, pdf) |
| includeMetrics | boolean | false | Incluir métricas en exportación |

## 5. Server architecture diagram

```mermaid
graph TD
  A[Client Request] --> B[Express Router]
  B --> C[Authentication Middleware]
  C --> D[Plan Limits Validator]
  D --> E[Scraping Controller]
  E --> F[Puppeteer Service]
  E --> G[AI Analysis Service]
  F --> H[Content Extractor]
  G --> I[OpenAI API]
  H --> J[Keyword Processor]
  I --> J
  J --> K[Results Aggregator]
  K --> L[MongoDB Repository]
  K --> M[Cache Service]
  
  subgraph "Controller Layer"
    E
  end
  
  subgraph "Service Layer"
    F
    G
    H
    J
    K
  end
  
  subgraph "Data Layer"
    L
    M
  end
```

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
  USER ||--o{ KEYWORD_ANALYSIS : creates
  KEYWORD_ANALYSIS ||--|{ EXTRACTED_KEYWORD : contains
  KEYWORD_ANALYSIS ||--|{ COMPETITOR_DATA : analyzes
  KEYWORD_ANALYSIS ||--|{ OPPORTUNITY : identifies
  
  USER {
    string id PK
    string email
    string plan
    object planLimits
  }
  
  KEYWORD_ANALYSIS {
    string id PK
    string userId FK
    string[] urls
    object config
    string status
    object metrics
    datetime createdAt
    datetime completedAt
  }
  
  EXTRACTED_KEYWORD {
    string id PK
    string analysisId FK
    string keyword
    number frequency
    number density
    string category
    string[] positions
    number relevanceScore
  }
  
  COMPETITOR_DATA {
    string id PK
    string analysisId FK
    string url
    string title
    string metaDescription
    object extractedContent
    number totalKeywords
  }
  
  OPPORTUNITY {
    string id PK
    string analysisId FK
    string type
    string description
    string[] suggestedKeywords
    number priority
  }
```

### 6.2 Data Definition Language

**Keyword Analysis Table**
```sql
-- create table
CREATE TABLE keyword_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    urls TEXT[] NOT NULL,
    config JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX idx_keyword_analyses_user_id ON keyword_analyses(user_id);
CREATE INDEX idx_keyword_analyses_status ON keyword_analyses(status);
CREATE INDEX idx_keyword_analyses_created_at ON keyword_analyses(created_at DESC);

-- Extracted Keywords Table
CREATE TABLE extracted_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES keyword_analyses(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    frequency INTEGER DEFAULT 0,
    density DECIMAL(5,2) DEFAULT 0.0,
    category VARCHAR(50) DEFAULT 'primary' CHECK (category IN ('primary', 'secondary', 'long-tail', 'brand')),
    positions TEXT[] DEFAULT '{}',
    relevance_score DECIMAL(3,2) DEFAULT 0.0,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX idx_extracted_keywords_analysis_id ON extracted_keywords(analysis_id);
CREATE INDEX idx_extracted_keywords_category ON extracted_keywords(category);
CREATE INDEX idx_extracted_keywords_relevance_score ON extracted_keywords(relevance_score DESC);

-- Competitor Data Table
CREATE TABLE competitor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES keyword_analyses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    extracted_content JSONB DEFAULT '{}',
    total_keywords INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX idx_competitor_data_analysis_id ON competitor_data(analysis_id);
CREATE INDEX idx_competitor_data_url ON competitor_data(url);

-- Opportunities Table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES keyword_analyses(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('gap', 'optimization', 'expansion', 'trending')),
    description TEXT NOT NULL,
    suggested_keywords TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX idx_opportunities_analysis_id ON opportunities(analysis_id);
CREATE INDEX idx_opportunities_priority ON opportunities(priority DESC);
CREATE INDEX idx_opportunities_type ON opportunities(type);

-- init data
INSERT INTO keyword_analyses (user_id, urls, config, status, metrics)
VALUES 
  ('user-demo-123', ARRAY['https://example.com'], '{"depth": 1, "language": "es"}', 'completed', '{"totalKeywords": 45, "processingTime": 12000}'),
  ('user-demo-123', ARRAY['https://competitor1.com', 'https://competitor2.com'], '{"depth": 2, "language": "en"}', 'completed', '{"totalKeywords": 89, "processingTime": 25000}');
```