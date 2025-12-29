interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000; // Máximo número de elementos en cache

  set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const ttl = ttlMinutes * 60 * 1000; // Convertir minutos a millisegundos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar si el item ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Verificar si el item ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar elementos expirados
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    // Si aún está lleno, eliminar los elementos más antiguos
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, Math.floor(this.maxSize * 0.2)); // Eliminar 20%
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: (this.cache.size / this.maxSize * 100).toFixed(2) + '%'
    };
  }
}

// Instancia global del cache
export const cache = new MemoryCache();

// Función helper para generar claves de cache
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

// Middleware para cache automático
export function withCache<T>(
  cacheKey: string,
  ttlMinutes: number = 30
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]): Promise<T> {
      const key = `${cacheKey}:${JSON.stringify(args)}`;
      
      // Intentar obtener del cache
      const cached = cache.get<T>(key);
      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return cached;
      }

      // Ejecutar método original
      console.log(`Cache miss for key: ${key}`);
      const result = await method.apply(this, args);
      
      // Guardar en cache
      cache.set(key, result, ttlMinutes);
      
      return result;
    };
  };
}