'use client';

import React from 'react';
import { ShareButton } from './ShareButton';
import { useShare, ShareContent, SharePlatform } from '@/contexts/ShareContext';

interface ShareManagerProps {
  content: ShareContent;
  platforms?: SharePlatform[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
  maxPlatforms?: number;
}

export function ShareManager({
  content,
  platforms,
  layout = 'horizontal',
  variant = 'default',
  size = 'md',
  className = '',
  showLabels = true,
  maxPlatforms = 6
}: ShareManagerProps) {
  const { config, getAvailablePlatforms } = useShare();

  const availablePlatforms = platforms || config.defaultPlatforms || getAvailablePlatforms();
  const displayPlatforms = availablePlatforms.slice(0, maxPlatforms);

  const layoutClasses = {
    horizontal: 'flex flex-row gap-2 flex-wrap',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {displayPlatforms.map((platform) => (
        <ShareButton
          key={platform}
          content={content}
          platform={platform}
          variant={variant}
          size={size}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}