'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useConnectionStatus } from '@/contexts/NotificationContext';

export default function ConnectionIndicator() {
  const isOnline = useConnectionStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2"
        >
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              Sin conexión a internet - Trabajando en modo offline
            </span>
            <AlertCircle className="h-4 w-4" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}