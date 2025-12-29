'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogPost, BlogCategory, BlogComment, BlogFilters, Author } from '@/types/content';

interface BlogContextType {
  // Posts
  posts: BlogPost[];
  categories: BlogCategory[];
  authors: Author[];
  loading: boolean;
  error: string | null;
  
  // Current post
  currentPost: BlogPost | null;
  comments: BlogComment[];
  
  // Filters and search
  filters: BlogFilters;
  searchQuery: string;
  filteredPosts: BlogPost[];
  
  // Actions
  fetchPosts: () => Promise<void>;
  fetchPost: (slug: string) => Promise<BlogPost | null>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<BlogComment, 'id' | 'createdAt' | 'status' | 'likes'>) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  setFilters: (filters: Partial<BlogFilters>) => void;
  setSearchQuery: (query: string) => void;
  searchPosts: (query: string) => void;
  
  // Analytics
  trackView: (postId: string) => Promise<void>;
  getRelatedPosts: (postId: string, limit?: number) => BlogPost[];
  getPopularPosts: (limit?: number) => BlogPost[];
  getTrendingPosts: (limit?: number) => BlogPost[];
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}

interface BlogProviderProps {
  children: ReactNode;
}

export function BlogProvider({ children }: BlogProviderProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [filters, setFiltersState] = useState<BlogFilters>({
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const searchPosts = (query: string) => {
    setSearchQuery(query);
  };

  // Mock data for development
  const mockCategories: BlogCategory[] = [
    { id: '1', name: 'Guías SEO', slug: 'guias-seo', description: 'Guías completas sobre SEO', color: '#3B82F6', icon: '📚' },
    { id: '2', name: 'Tutoriales', slug: 'tutoriales', description: 'Tutoriales paso a paso', color: '#10B981', icon: '🎯' },
    { id: '3', name: 'Noticias SEO', slug: 'noticias-seo', description: 'Últimas noticias del mundo SEO', color: '#F59E0B', icon: '📰' },
    { id: '4', name: 'Herramientas', slug: 'herramientas', description: 'Reviews y comparativas de herramientas', color: '#8B5CF6', icon: '🛠️' },
    { id: '5', name: 'Casos de Estudio', slug: 'casos-estudio', description: 'Análisis de casos reales', color: '#EF4444', icon: '📊' }
  ];

  const mockAuthors: Author[] = [
    {
      id: '1',
      name: 'María García',
      email: 'maria@yatools.com',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20SEO%20expert%20avatar%20friendly%20smile&image_size=square',
      bio: 'Especialista en SEO con más de 8 años de experiencia ayudando a empresas a mejorar su visibilidad online.',
      socialLinks: {
        twitter: 'https://twitter.com/maria_seo',
        linkedin: 'https://linkedin.com/in/maria-garcia-seo'
      }
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos@yatools.com',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20digital%20marketing%20expert%20avatar%20confident&image_size=square',
      bio: 'Consultor de marketing digital especializado en estrategias de contenido y SEO técnico.',
      socialLinks: {
        twitter: 'https://twitter.com/carlos_digital',
        linkedin: 'https://linkedin.com/in/carlos-rodriguez-marketing'
      }
    }
  ];

  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Guía Completa de SEO para Principiantes 2024',
      slug: 'guia-completa-seo-principiantes-2024',
      excerpt: 'Aprende los fundamentos del SEO desde cero con esta guía completa actualizada para 2024. Incluye estrategias prácticas y herramientas esenciales.',
      content: `# Guía Completa de SEO para Principiantes 2024

El SEO (Search Engine Optimization) es fundamental para cualquier estrategia digital exitosa. En esta guía completa, aprenderás todo lo necesario para comenzar tu camino en el mundo del posicionamiento web.

## ¿Qué es el SEO?

El SEO es el conjunto de técnicas y estrategias que nos permiten mejorar la visibilidad de nuestro sitio web en los resultados de búsqueda orgánicos de Google y otros buscadores.

## Fundamentos del SEO

### 1. SEO On-Page
- Optimización de títulos y meta descripciones
- Estructura de URLs amigables
- Uso correcto de etiquetas H1, H2, H3
- Optimización de imágenes
- Velocidad de carga

### 2. SEO Off-Page
- Link building de calidad
- Menciones de marca
- Señales sociales
- Autoridad de dominio

### 3. SEO Técnico
- Indexabilidad
- Sitemap XML
- Robots.txt
- Core Web Vitals
- Mobile-first indexing

## Herramientas Esenciales

1. **Google Search Console** - Monitoreo gratuito de Google
2. **Google Analytics** - Análisis de tráfico web
3. **YA Tools** - Suite completa de herramientas SEO
4. **Screaming Frog** - Auditoría técnica
5. **Ahrefs/SEMrush** - Análisis de competencia

## Estrategia de Contenido

El contenido sigue siendo el rey en SEO. Aquí tienes los pilares fundamentales:

- **Investigación de palabras clave**
- **Intención de búsqueda**
- **Contenido de calidad y original**
- **Optimización semántica**
- **Actualización regular**

## Métricas Importantes

- Tráfico orgánico
- Posiciones promedio
- CTR (Click Through Rate)
- Tiempo de permanencia
- Tasa de rebote
- Conversiones

## Errores Comunes a Evitar

1. Keyword stuffing
2. Contenido duplicado
3. Enlaces de baja calidad
4. Ignorar la experiencia de usuario
5. No optimizar para móviles

## Conclusión

El SEO es una disciplina que requiere paciencia, constancia y actualización continua. Con esta guía tienes las bases para comenzar tu estrategia SEO exitosa.

¿Tienes preguntas sobre SEO? ¡Déjanos un comentario!

## Conclusión

El SEO es una disciplina que requiere paciencia, constancia y actualización continua. Con esta guía tienes las bases para comenzar tu estrategia SEO exitosa.

¿Tienes preguntas sobre SEO? ¡Déjanos un comentario!`,
      author: mockAuthors[0],
      category: mockCategories[0],
      tags: ['seo','principiantes','guía'],
      publishedAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
      readingTime: 8,
      views: 123,
      likes: 15,
      status: 'published',
      seo: {
        metaTitle: 'Guía SEO 2024',
        metaDescription: 'Fundamentos de SEO para principiantes en 2024'
      }
    }
  ];
  
  // Initialize with mock data
  useEffect(() => {
    setCategories(mockCategories);
    setAuthors(mockAuthors);
    setPosts(mockPosts);
  }, []);

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from API
      // For now, just use mock data
      setPosts(mockPosts);
      setCategories(mockCategories);
      setAuthors(mockAuthors);
    } catch (err) {
      setError('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single post
  const fetchPost = async (slug: string): Promise<BlogPost | null> => {
    setLoading(true);
    try {
      const post = mockPosts.find(p => p.slug === slug);
      setCurrentPost(post || null);
      return post || null;
    } catch (err) {
      setError('Error loading post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    setLoading(true);
    try {
      // In production, fetch from API
      setComments([]);
    } catch (err) {
      setError('Error loading comments');
    } finally {
      setLoading(false);
    }
  };

  // Add a comment
  const addComment = async (
    postId: string,
    comment: Omit<BlogComment, 'id' | 'createdAt' | 'status' | 'likes'>
  ) => {
    try {
      const newComment: BlogComment = {
        ...comment,
        id: Date.now().toString(),
        createdAt: new Date(),
        status: 'pending',
        likes: 0
      };
      setComments(prev => [...prev, newComment]);
    } catch (err) {
      setError('Error adding comment');
    }
  };

  // Like a post
  const likePost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Like a comment
  const likeComment = async (commentId: string) => {
    try {
      setComments(prev => prev.map(comment =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
      ));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  // Set filters
  const setFilters = (newFilters: Partial<BlogFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const trackView = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, views: post.views + 1 } : post
      ));
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const getRelatedPosts = (postId: string, limit = 3): BlogPost[] => {
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return [];

    return posts
      .filter(post => 
        post.id !== postId && 
        (post.category.id === currentPost.category.id || 
         post.tags.some(tag => currentPost.tags.includes(tag)))
      )
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  const getPopularPosts = (limit = 5): BlogPost[] => {
    return [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  const getTrendingPosts = (limit = 5): BlogPost[] => {
    return [...posts]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  };

  // Compute filtered posts based on search query and filters
  const filteredPosts = React.useMemo(() => {
    let result = [...posts];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.category) {
      result = result.filter(post => post.category.id === filters.category);
    }

    if (filters.tag) {
      result = result.filter(post => post.tags.includes(filters.tag));
    }

    if (filters.author) {
      result = result.filter(post => post.author.id === filters.author);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        result.sort((a, b) => b.likes - a.likes);
        break;
    }

    return result;
  }, [posts, searchQuery, filters]);

  const value: BlogContextType = {
    posts,
    categories,
    authors,
    loading,
    error,
    currentPost,
    comments,
    filters,
    searchQuery,
    filteredPosts,
    fetchPosts,
    fetchPost,
    fetchComments,
    addComment,
    likePost,
    likeComment,
    setFilters,
    setSearchQuery,
    searchPosts,
     trackView,
    getRelatedPosts,
    getPopularPosts,
    getTrendingPosts
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
}