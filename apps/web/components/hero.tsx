import { Button } from "@/components/ui/button"
import { Sparkles, Zap, TrendingUp } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-br from-background via-tech-blue-50/30 to-ai-purple-50/30 dark:from-background dark:via-tech-blue-950/20 dark:to-ai-purple-950/20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-tech-blue-200/20 to-ai-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-seo-teal-200/20 to-tech-blue-200/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-tech-blue-100 to-ai-purple-100 dark:from-tech-blue-900/30 dark:to-ai-purple-900/30 border border-tech-blue-200/50 dark:border-tech-blue-700/50 mb-6">
          <Sparkles className="w-4 h-4 text-tech-blue-600 dark:text-tech-blue-400" />
          <span className="text-sm font-medium text-tech-blue-700 dark:text-tech-blue-300">
            Potenciado por IA Avanzada
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-tech-blue-600 via-ai-purple-600 to-seo-teal-600 bg-clip-text text-transparent">
            Potencia tu SEO
          </span>
          <br />
          <span className="text-neutral-slate-900 dark:text-neutral-slate-100">
            con Inteligencia Artificial
          </span>
        </h1>

        {/* Description */}
        <p className="text-neutral-slate-600 dark:text-neutral-slate-300 max-w-2xl mx-auto text-lg md:text-xl mb-8 leading-relaxed">
          Automatiza tareas esenciales de posicionamiento con nuestras herramientas inteligentes. 
          Optimiza imágenes, títulos, contenido y más en segundos.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-gradient-to-r from-tech-blue-600 to-ai-purple-600 hover:from-tech-blue-700 hover:to-ai-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <a href="#tools" className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Explorar herramientas
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-4 border-2 border-seo-teal-300 text-seo-teal-700 hover:bg-seo-teal-50 dark:border-seo-teal-600 dark:text-seo-teal-400 dark:hover:bg-seo-teal-900/20 transition-all duration-300"
            asChild
          >
            <a href="#contact" className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ver resultados
            </a>
          </Button>
        </div>

        {/* Stats or features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-tech-blue-600 dark:text-tech-blue-400 mb-2">15+</div>
            <div className="text-neutral-slate-600 dark:text-neutral-slate-400">Herramientas SEO</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-ai-purple-600 dark:text-ai-purple-400 mb-2">IA</div>
            <div className="text-neutral-slate-600 dark:text-neutral-slate-400">Tecnología Avanzada</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-seo-teal-600 dark:text-seo-teal-400 mb-2">24/7</div>
            <div className="text-neutral-slate-600 dark:text-neutral-slate-400">Disponibilidad</div>
          </div>
        </div>
      </div>
    </section>
  )
}
