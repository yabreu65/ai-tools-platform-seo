'use client';

import { useState } from 'react';
import { Plan } from '@/shared/types/plan';
import { PlanSelector } from '@/components/plans/PlanSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SelectPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();

  const handlePlanSelected = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </Button>
            </Link>
            <div className="text-sm text-gray-500">
              Paso 2 de 2: Selecciona tu plan
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige el plan perfecto para ti
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Desbloquea todo el potencial de nuestras herramientas de análisis SEO. 
            Comienza gratis o potencia tu trabajo con funciones premium.
          </p>

          {/* Features Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <div className="p-2 bg-green-100 rounded-full mb-3">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sin Compromiso</h3>
              <p className="text-sm text-gray-600 text-center">
                Cancela en cualquier momento
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <div className="p-2 bg-blue-100 rounded-full mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Activación Inmediata</h3>
              <p className="text-sm text-gray-600 text-center">
                Acceso instantáneo a todas las funciones
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <div className="p-2 bg-purple-100 rounded-full mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Soporte Premium</h3>
              <p className="text-sm text-gray-600 text-center">
                Ayuda prioritaria cuando la necesites
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="pb-16 px-4 sm:px-6 lg:px-8">
        <PlanSelector onPlanSelected={handlePlanSelected} />
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar de plan después?
              </h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu dashboard.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué incluye la prueba gratuita?
              </h3>
              <p className="text-gray-600 text-sm">
                30 días completos con acceso a todas las funciones premium sin restricciones.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Hay contratos a largo plazo?
              </h3>
              <p className="text-gray-600 text-sm">
                No, todos nuestros planes son mensuales y puedes cancelar cuando quieras.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Ofrecen descuentos para equipos?
              </h3>
              <p className="text-gray-600 text-sm">
                Contáctanos para planes empresariales con descuentos especiales para equipos grandes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            ¿Necesitas ayuda para elegir? {' '}
            <Link href="/contacto" className="text-blue-600 hover:text-blue-700 font-medium">
              Contáctanos
            </Link>
            {' '} y te ayudaremos a encontrar el plan perfecto.
          </p>
        </div>
      </div>
    </div>
  );
}