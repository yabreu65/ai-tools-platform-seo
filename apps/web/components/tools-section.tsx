'use client'

import { tools } from '@/config/tools-config'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

const categories = ['Todos', 'Optimización', 'Contenido', 'Análisis', 'Investigación', 'Rendimiento', 'Técnico']

export default function ToolsSection() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [hoveredTool, setHoveredTool] = useState<number | null>(null)

  const filteredTools = selectedCategory === 'Todos'
    ? tools
    : tools.filter(tool => tool.category === selectedCategory)

    const trackClick = async (tool: (typeof tools)[number]) => {
      const payload = {
        title: tool.title,
        href: tool.href,
        clickedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language
      };
    
      try {
        await fetch('/api/analytics/tool-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('Error enviando clic a n8n:', error);
      }
    }
    

  return (
    <section id="tools" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-tech-blue-50/20 to-ai-purple-50/20 dark:from-background dark:via-tech-blue-950/10 dark:to-ai-purple-950/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-tech-blue-200/20 to-ai-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-ai-purple-200/20 to-seo-teal-200/20 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-tech-blue-100/50 to-ai-purple-100/50 dark:from-tech-blue-900/30 dark:to-ai-purple-900/30 border border-tech-blue-200/50 dark:border-tech-blue-700/50 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-tech-blue-600 dark:text-tech-blue-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 bg-clip-text text-transparent">
              Potenciado por IA Avanzada
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-neutral-slate-900 via-tech-blue-900 to-ai-purple-900 dark:from-neutral-slate-100 dark:via-tech-blue-100 dark:to-ai-purple-100 bg-clip-text text-transparent">
              Herramientas SEO
            </span>
            <br />
            <span className="bg-gradient-to-r from-tech-blue-600 via-ai-purple-600 to-seo-teal-600 bg-clip-text text-transparent">
              Profesionales
            </span>
          </h1>
          <p className="text-xl text-neutral-slate-600 dark:text-neutral-slate-300 max-w-3xl mx-auto leading-relaxed">
            Impulsa tu posicionamiento en buscadores con nuestro arsenal completo de
            <span className="font-semibold text-tech-blue-600 dark:text-tech-blue-400"> herramientas automáticas</span> basadas en
            inteligencia artificial de última generación
          </p>

          <div className="flex justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-tech-blue-600 dark:text-tech-blue-400">18</div>
              <div className="text-sm text-neutral-slate-500 dark:text-neutral-slate-400">Herramientas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ai-purple-600 dark:text-ai-purple-400">100%</div>
              <div className="text-sm text-neutral-slate-500 dark:text-neutral-slate-400">Operativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-seo-teal-600 dark:text-seo-teal-400">24/7</div>
              <div className="text-sm text-neutral-slate-500 dark:text-neutral-slate-400">Disponible</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                  ? 'bg-gradient-to-r from-tech-blue-500 to-ai-purple-500 text-white shadow-lg shadow-tech-blue-500/25'
                  : 'bg-white/80 dark:bg-neutral-slate-800/80 text-neutral-slate-600 dark:text-neutral-slate-300 hover:bg-white dark:hover:bg-neutral-slate-800 hover:text-neutral-slate-900 dark:hover:text-neutral-slate-100 border border-neutral-slate-200 dark:border-neutral-slate-700'
                }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <motion.div layout className="grid gap-14 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                <motion.div
                  key={tool.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onHoverStart={() => setHoveredTool(index)}
                  onHoverEnd={() => setHoveredTool(null)}
                  className="group relative"
                >
                  <div className="relative h-full bg-white/80 dark:bg-neutral-slate-900/80 backdrop-blur-sm rounded-2xl border border-neutral-slate-200/50 dark:border-neutral-slate-700/50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.lightColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/40 dark:from-neutral-slate-800/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 text-xs font-semibold text-neutral-slate-600 dark:text-neutral-slate-300 bg-neutral-slate-100 dark:bg-neutral-slate-800 rounded-full">
                            {tool.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-slate-900 dark:text-neutral-slate-100 mb-3 group-hover:text-tech-blue-900 dark:group-hover:text-tech-blue-100 transition-colors duration-300">
                        {tool.title}
                      </h3>
                      <p className="text-neutral-slate-600 dark:text-neutral-slate-300 text-sm leading-relaxed mb-6">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-warning-amber-500" />
                          <span className="text-xs text-neutral-slate-500 dark:text-neutral-slate-400 font-medium">
                            IA Activa
                          </span>
                        </div>
                        <motion.a
                          href={tool.href}
                          onClick={() => trackClick(tool)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-tech-blue-600 dark:text-tech-blue-400 hover:text-white bg-tech-blue-50 dark:bg-tech-blue-900/20 hover:bg-gradient-to-r hover:from-tech-blue-500 hover:to-ai-purple-500 rounded-lg transition-all duration-300 group/link"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Probar
                          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                        </motion.a>
                      </div>
                    </div>
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-tech-blue-500 to-ai-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: hoveredTool === index ? '100%' : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
        </motion.div>
      </div>
    </section>
  )
}
