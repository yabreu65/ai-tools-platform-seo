'use client';

import React from 'react';
import { ShareButton } from './ShareButton';
import { useQuickShare, ShareContent } from '@/contexts/ShareContext';

interface QuickShareProps {
  content: ShareContent;
  className?: string;
}

export function QuickShare({ content, className = '' }: QuickShareProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <ShareButton content={content} platform="copy" variant="icon" />
      <ShareButton content={content} platform="twitter" variant="icon" />
      <ShareButton content={content} platform="facebook" variant="icon" />
      <ShareButton content={content} platform="linkedin" variant="icon" />
    </div>
  );
}