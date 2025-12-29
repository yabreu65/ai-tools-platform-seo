'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShareManager } from './ShareManager';
import { useShareModal } from '@/contexts/ShareContext';

export function ShareModal() {
  const { isShareModalOpen, closeShareModal, currentShareContent } = useShareModal();

  if (!currentShareContent) return null;

  return (
    <Dialog open={isShareModalOpen} onOpenChange={closeShareModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ShareManager
            content={currentShareContent}
            layout="grid"
            variant="outline"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}