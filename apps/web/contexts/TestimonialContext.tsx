'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Testimonial, TestimonialFilters } from '@/types/content';

interface TestimonialContextType {
  // Testimonials
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  
  // Filters and search
  filters: TestimonialFilters;
  searchQuery: string;
  filteredTestimonials: Testimonial[];
  
  // Available filter options
  tools: string[];
  services: string[];
  ratings: number[];
  
  // Actions
  fetchTestimonials: () => Promise<void>;
  submitTestimonial: (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'status' | 'helpful'>) => Promise<void>;
  setFilters: (filters: Partial<TestimonialFilters>) => void;
  setSearchQuery: (query: string) => void;
  markHelpful: (testimonialId: string) => Promise<void>;
  
  // Analytics
  getFeaturedTestimonials: (limit?: number) => Testimonial[];
  getTestimonialsByRating: (rating: number, limit?: number) => Testimonial[];
  getTestimonialsByTool: (tool: string, limit?: number) => Testimonial[];
  getAverageRating: () => number;
  getRatingDistribution: () => { rating: number; count: number; percentage: number }[];
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export function useTestimonial() {
  const context = useContext(TestimonialContext);
  if (context === undefined) {
    throw new Error('useTestimonial must be used within a TestimonialProvider');
  }
  return context;
}

interface TestimonialProviderProps {
  children: ReactNode;
}

export function TestimonialProvider({ children }: TestimonialProviderProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TestimonialFilters>({
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      author: {
        name: 'María González',
        email: 'maria@digitalagency.com',
        company: 'Digital Marketing Pro',
        position: 'SEO Manager',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20SEO%20manager%20confident%20smile&image_size=square',
        verified: true
      },
      content: 'YA Tools ha revolucionado completamente nuestro flujo de trabajo SEO. El generador de títulos y meta descripciones nos ahorra horas cada semana, y los resultados son consistentemente mejores que los que creábamos manualmente. La integración con Google Search Console es perfecta.',
      rating: 5,
      tool: 'Generador de Títulos SEO',
      service: 'SEO On-Page',
      featured: true,
      createdAt: new Date('2024-01-18'),
      status: 'approved',
      helpful: 23,
      socialProof: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/maria-gonzalez-seo'
      }
    },
    {
      id: '2',
      author: {
        name: 'Carlos Ruiz',
        email: 'carlos@ecommercepro.com',
        company: 'E-commerce Solutions',
        position: 'Marketing Director',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20marketing%20director%20business%20suit&image_size=square',
        verified: true
      },
      content: 'Llevamos usando YA Tools desde hace 8 meses y los resultados hablan por sí solos. Nuestro tráfico orgánico ha aumentado un 180% y las conversiones un 95%. El analizador de palabras clave es especialmente potente para e-commerce. Totalmente recomendado.',
      rating: 5,
      tool: 'Analizador de Palabras Clave',
      service: 'SEO E-commerce',
      featured: true,
      createdAt: new Date('2024-01-15'),
      status: 'approved',
      helpful: 31,
      socialProof: {
        platform: 'Twitter',
        url: 'https://twitter.com/carlos_ecom'
      }
    },
    {
      id: '3',
      author: {
        name: 'Ana López',
        email: 'ana@freelanceseo.com',
        company: 'Freelance SEO Consultant',
        position: 'SEO Consultant',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20freelancer%20consultant%20modern%20office&image_size=square',
        verified: true
      },
      content: 'Como freelancer, necesito herramientas que me permitan trabajar de forma eficiente con múltiples clientes. YA Tools es perfecta para esto. El generador de sitemaps me ha ahorrado incontables horas, y mis clientes están encantados con los resultados.',
      rating: 4,
      tool: 'Generador de Sitemaps',
      service: 'SEO Técnico',
      featured: false,
      createdAt: new Date('2024-01-12'),
      status: 'approved',
      helpful: 18
    },
    {
      id: '4',
      author: {
        name: 'Pedro Martín',
        email: 'pedro@startuptech.com',
        company: 'TechStartup Inc.',
        position: 'Growth Manager',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20startup%20growth%20manager%20casual%20tech&image_size=square',
        verified: true
      },
      content: 'En nuestra startup, cada euro cuenta. YA Tools nos ofrece funcionalidades que normalmente costarían cientos de euros al mes en otras plataformas. La relación calidad-precio es imbatible. Hemos pasado de 0 a 25K usuarios orgánicos en 6 meses.',
      rating: 5,
      tool: 'Suite Completa',
      service: 'SEO Startup',
      featured: true,
      createdAt: new Date('2024-01-10'),
      status: 'approved',
      helpful: 42,
      socialProof: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/pedro-martin-growth'
      }
    },
    {
      id: '5',
      author: {
        name: 'Laura Fernández',
        email: 'laura@agenciadigital.com',
        company: 'Agencia Digital 360',
        position: 'SEO Team Lead',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20team%20lead%20SEO%20agency%20confident&image_size=square',
        verified: true
      },
      content: 'Gestionamos más de 50 clientes y YA Tools se ha convertido en nuestra herramienta principal. La facilidad de uso permite que todo nuestro equipo, desde juniors hasta seniors, puedan utilizarla eficientemente. Los reportes automáticos son un plus increíble.',
      rating: 4,
      tool: 'Analizador de Meta Descripciones',
      service: 'Agencia SEO',
      featured: false,
      createdAt: new Date('2024-01-08'),
      status: 'approved',
      helpful: 27
    },
    {
      id: '6',
      author: {
        name: 'Roberto Silva',
        email: 'roberto@localrestaurant.com',
        company: 'Restaurante Local',
        position: 'Propietario',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant%20owner%20friendly%20local%20business%20smile&image_size=square',
        verified: false
      },
      content: 'No soy experto en tecnología, pero YA Tools es tan fácil de usar que hasta yo puedo optimizar mi sitio web. Mis reservas online han aumentado un 200% desde que empecé a usarla. El soporte al cliente es excepcional.',
      rating: 5,
      tool: 'Optimizador Local SEO',
      service: 'SEO Local',
      featured: false,
      createdAt: new Date('2024-01-05'),
      status: 'approved',
      helpful: 15
    },
    {
      id: '7',
      author: {
        name: 'Isabel Moreno',
        email: 'isabel@bloggerlife.com',
        company: 'Blogger Profesional',
        position: 'Content Creator',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20blogger%20content%20creator%20creative&image_size=square',
        verified: true
      },
      content: 'Como blogger, el contenido es mi vida. YA Tools me ayuda a optimizar cada artículo para SEO sin perder la naturalidad del texto. Mis artículos ahora ranquean consistentemente en la primera página de Google. ¡Increíble!',
      rating: 4,
      tool: 'Optimizador de Contenido',
      service: 'Content SEO',
      featured: false,
      createdAt: new Date('2024-01-03'),
      status: 'approved',
      helpful: 22,
      socialProof: {
        platform: 'Instagram',
        url: 'https://instagram.com/isabel_blogger'
      }
    },
    {
      id: '8',
      author: {
        name: 'Miguel Torres',
        email: 'miguel@consultorseo.com',
        company: 'Consultor SEO Independiente',
        position: 'Senior SEO Consultant',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20senior%20consultant%20SEO%20expert%20glasses&image_size=square',
        verified: true
      },
      content: 'Con 15 años de experiencia en SEO, he probado prácticamente todas las herramientas del mercado. YA Tools destaca por su simplicidad sin sacrificar funcionalidad. Es la herramienta que recomiendo a todos mis clientes y colegas.',
      rating: 5,
      tool: 'Suite Completa',
      service: 'Consultoría SEO',
      featured: true,
      createdAt: new Date('2024-01-01'),
      status: 'approved',
      helpful: 38,
      socialProof: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/miguel-torres-seo'
      }
    }
  ];

  // Available filter options
  const tools = Array.from(new Set(mockTestimonials.map(t => t.tool)));
  const services = Array.from(new Set(mockTestimonials.map(t => t.service)));
  const ratings = [5, 4, 3, 2, 1];

  // Initialize mock data
  useEffect(() => {
    setTestimonials(mockTestimonials);
  }, []);

  // Filter testimonials based on filters and search query
  const filteredTestimonials = React.useMemo(() => {
    let filtered = [...testimonials];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.service.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.rating) {
      filtered = filtered.filter(t => t.rating === filters.rating);
    }

    if (filters.tool) {
      filtered = filtered.filter(t => t.tool === filters.tool);
    }

    if (filters.service) {
      filtered = filtered.filter(t => t.service === filters.service);
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(t => t.author.verified === filters.verified);
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(t => t.featured === filters.featured);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    return filtered;
  }, [testimonials, filters, searchQuery]);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Testimonials are already set in useEffect
      setError(null);
    } catch (err) {
      setError('Error al cargar los testimonios');
    } finally {
      setLoading(false);
    }
  };

  const submitTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'status' | 'helpful'>) => {
    try {
      const newTestimonial: Testimonial = {
        ...testimonial,
        id: Date.now().toString(),
        createdAt: new Date(),
        status: 'pending',
        helpful: 0
      };
      setTestimonials(prev => [newTestimonial, ...prev]);
    } catch (err) {
      setError('Error al enviar el testimonio');
    }
  };

  const setFilters = (newFilters: Partial<TestimonialFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const markHelpful = async (testimonialId: string) => {
    try {
      setTestimonials(prev => prev.map(t =>
        t.id === testimonialId ? { ...t, helpful: t.helpful + 1 } : t
      ));
    } catch (err) {
      setError('Error al marcar como útil');
    }
  };

  const getFeaturedTestimonials = (limit = 4): Testimonial[] => {
    return testimonials
      .filter(t => t.featured && t.status === 'approved')
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, limit);
  };

  const getTestimonialsByRating = (rating: number, limit = 10): Testimonial[] => {
    return testimonials
      .filter(t => t.rating === rating && t.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const getTestimonialsByTool = (tool: string, limit = 5): Testimonial[] => {
    return testimonials
      .filter(t => t.tool === tool && t.status === 'approved')
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, limit);
  };

  const getAverageRating = (): number => {
    const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
    if (approvedTestimonials.length === 0) return 0;
    
    const totalRating = approvedTestimonials.reduce((sum, t) => sum + t.rating, 0);
    return Math.round((totalRating / approvedTestimonials.length) * 10) / 10;
  };

  const getRatingDistribution = (): { rating: number; count: number; percentage: number }[] => {
    const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
    const total = approvedTestimonials.length;
    
    return [5, 4, 3, 2, 1].map(rating => {
      const count = approvedTestimonials.filter(t => t.rating === rating).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { rating, count, percentage };
    });
  };

  const value: TestimonialContextType = {
    testimonials,
    loading,
    error,
    filters,
    searchQuery,
    filteredTestimonials,
    tools,
    services,
    ratings,
    fetchTestimonials,
    submitTestimonial,
    setFilters,
    setSearchQuery,
    markHelpful,
    getFeaturedTestimonials,
    getTestimonialsByRating,
    getTestimonialsByTool,
    getAverageRating,
    getRatingDistribution
  };

  return (
    <TestimonialContext.Provider value={value}>
      {children}
    </TestimonialContext.Provider>
  );
}