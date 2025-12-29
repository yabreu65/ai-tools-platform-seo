'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  FileText,
  Users,
  Mail,
  Star,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  Download,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Upload,
  Save,
  X
} from 'lucide-react';
import { useBlog } from '@/contexts/BlogContext';
import { useCaseStudy } from '@/contexts/CaseStudyContext';
import { useTestimonial } from '@/contexts/TestimonialContext';
import { useNewsletter } from '@/contexts/NewsletterContext';

type ContentType = 'blog' | 'cases' | 'testimonials' | 'newsletter';
type ContentStatus = 'all' | 'published' | 'draft' | 'pending';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('blog');
  const [statusFilter, setStatusFilter] = useState<ContentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { posts, categories, filteredPosts, setFilters, setSearchQuery: setBlogSearchQuery } = useBlog();
  const { caseStudies, getCaseStudiesByIndustry } = useCaseStudy();
  const { testimonials, getTestimonialsByTool } = useTestimonial();
  const { campaigns, getSubscriberStats } = useNewsletter();

  // Mock data for admin functionality
  const [stats, setStats] = useState({
    totalPosts: posts.length,
    totalCases: caseStudies.length,
    totalTestimonials: testimonials.length,
    totalSubscribers: getSubscriberStats().total,
    monthlyViews: 45230,
    engagementRate: 8.5
  });

  const tabs = [
    { id: 'blog', label: 'Blog', icon: FileText, count: stats.totalPosts },
    { id: 'cases', label: 'Casos de Uso', icon: BarChart3, count: stats.totalCases },
    { id: 'testimonials', label: 'Testimonios', icon: Star, count: stats.totalTestimonials },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, count: stats.totalSubscribers }
  ];

  const getFilteredContent = () => {
    let content: any[] = [];
    
    switch (activeTab) {
      case 'blog':
        content = posts.map(post => ({
          ...post,
          type: 'blog',
          status: Math.random() > 0.3 ? 'published' : 'draft',
          views: Math.floor(Math.random() * 5000) + 100,
          comments: Math.floor(Math.random() * 50)
        }));
        break;
      case 'cases':
        content = caseStudies.map(study => ({
          ...study,
          type: 'cases',
          status: 'published',
          views: Math.floor(Math.random() * 2000) + 50,
          downloads: Math.floor(Math.random() * 100) + 10
        }));
        break;
      case 'testimonials':
        content = testimonials.map(testimonial => ({
          ...testimonial,
          type: 'testimonials',
          status: Math.random() > 0.2 ? 'published' : 'pending',
          helpfulVotes: Math.floor(Math.random() * 20)
        }));
        break;
      case 'newsletter':
        content = campaigns.slice(0, 10).map((campaign: any) => ({
          ...campaign,
          type: 'newsletter',
          status: 'published',
          subscribers: Math.floor(Math.random() * 1000) + 500
        }));
        break;
    }

    // Apply filters
    if (statusFilter !== 'all') {
      content = content.filter(item => item.status === statusFilter);
    }

    if (searchQuery) {
      content = content.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return content;
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems);
    setSelectedItems([]);
  };

  const handleDeleteItem = (id: string) => {
    console.log(`Delete item: ${id}`);
  };

  const handleEditItem = (id: string) => {
    console.log(`Edit item: ${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Clock;
      case 'pending': return AlertCircle;
      default: return Clock;
    }
  };

  const filteredContent = getFilteredContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona todo tu contenido desde un solo lugar
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Contenido
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contenido Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPosts + stats.totalCases + stats.totalTestimonials}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vistas Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.monthlyViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suscriptores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSubscribers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.engagementRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ContentType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar contenido..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ContentStatus)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} seleccionados
                  </span>
                  <button
                    onClick={() => handleBulkAction('publish')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredContent.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métricas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContent.map((item, index) => {
                  const StatusIcon = getStatusIcon(item.status);
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title || item.subject}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {item.excerpt || item.preview || item.content?.substring(0, 100)}
                            </p>
                            {item.author && (
                              <p className="text-xs text-gray-400 mt-1">
                                Por {item.author.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {item.status === 'published' ? 'Publicado' : 
                           item.status === 'draft' ? 'Borrador' : 'Pendiente'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.DateTimeFormat('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }).format(item.publishedAt || item.sentAt || item.createdAt)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {item.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {item.views}
                            </div>
                          )}
                          {item.comments && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {item.comments}
                            </div>
                          )}
                          {item.downloads && (
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {item.downloads}
                            </div>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {item.rating}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontró contenido
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros o crear nuevo contenido.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Crear Nuevo Contenido
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { type: 'blog', label: 'Artículo de Blog', icon: FileText, description: 'Crear un nuevo artículo educativo' },
                { type: 'cases', label: 'Caso de Uso', icon: BarChart3, description: 'Documentar un caso de éxito' },
                { type: 'testimonials', label: 'Testimonial', icon: Star, description: 'Añadir una nueva reseña' },
                { type: 'newsletter', label: 'Campaña Newsletter', icon: Mail, description: 'Crear una nueva campaña' }
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    console.log(`Create ${option.type}`);
                    setShowCreateModal(false);
                  }}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <option.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
                        {option.label}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}