'use client';

import React from 'react';
import { useShareHistory } from '@/contexts/ShareContext';

export function ShareHistory() {
  const { shareHistory } = useShareHistory();

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Historial de compartidos</h3>
      {shareHistory.length === 0 ? (
        <p className="text-gray-500">No hay elementos compartidos</p>
      ) : (
        <div className="space-y-2">
          {shareHistory.map((item) => (
            <div key={item.id} className="p-2 border rounded">
              <div className="font-medium">{item.content.title}</div>
              <div className="text-sm text-gray-500">
                {item.platform} - {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}