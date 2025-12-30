import { OptimizationTest } from '@/components/optimization/OptimizationTest';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Prueba de Optimizaciones - YA Tools',
  description: 'Página de prueba para verificar que todas las optimizaciones de rendimiento funcionan correctamente',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestOptimizationPage() {
  return <OptimizationTest />;
}