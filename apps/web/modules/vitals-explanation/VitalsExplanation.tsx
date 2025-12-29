import HomeFloatingButton from "../../components/inicio-comun/HomeFloatingButton";


export default function VitalsExplanation({
    result,
  }: {
    result: { lcp: number; cls: number; inp: number; score: number };
  }) {
    return (
      <div className="mt-6 border-t pt-4 text-sm text-gray-700 dark:text-gray-300 space-y-4">
         <HomeFloatingButton/>
        <h4 className="text-lg font-semibold text-violet-700 dark:text-violet-300">
          Diagnóstico técnico extendido 🧠
        </h4>
  
        {result.lcp > 2.5 && (
          <div>
            <strong>LCP muy alto ({result.lcp.toFixed(2)}s):</strong> El contenido principal
            está tardando demasiado en cargarse. Revisa imágenes pesadas, fuentes externas y
            scripts bloqueantes. Intenta usar <code>loading="lazy"</code>,{' '}
            <code>font-display: swap</code> y precarga de recursos críticos.
          </div>
        )}
  
        {result.cls > 0.1 ? (
          <div>
            <strong>CLS alto ({result.cls}):</strong> Hay movimientos visuales que afectan la
            estabilidad del sitio. Usa tamaños fijos en imágenes y evita insertar elementos por
            JavaScript sin espacio reservado.
          </div>
        ) : (
          <div>
            ✅ <strong>CLS excelente:</strong> No se detectaron movimientos inesperados. ¡Bien hecho!
          </div>
        )}
  
        {result.inp > 200 && (
          <div>
            <strong>INP crítico ({result.inp.toFixed(0)}ms):</strong> El sitio responde muy lento
            a las interacciones del usuario. Revisa funciones JS pesadas, divide lógicas grandes
            con <code>requestIdleCallback</code>, y evita cargas masivas en el <code>onClick</code>.
          </div>
        )}
  
        {result.score < 80 && (
          <div>
            <strong>Score general bajo ({result.score}/100):</strong> Este sitio necesita optimización
            urgente para mejorar su posicionamiento en Google y experiencia del usuario.
          </div>
        )}
  
        <div className="hidden">
          💡 <strong>Consejo:</strong> Usa herramientas como{' '}
          <a
            href="https://pagespeed.web.dev/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            PageSpeed Insights
          </a>{' '}
          o{' '}
          <a
            href="https://web.dev/measure/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Web.dev
          </a>{' '}
          para un desglose visual y detallado de cada métrica.
        </div>
      </div>
    );
  }
  