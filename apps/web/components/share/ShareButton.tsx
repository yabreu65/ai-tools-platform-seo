'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useShare, ShareContent, SharePlatform } from '@/contexts/ShareContext';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Send, Mail, Copy, QrCode } from 'lucide-react';

interface ShareButtonProps {
  content?: ShareContent;
  platform?: SharePlatform;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  showLabel?: boolean;
  onClick?: () => void;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
  copy: Copy,
  qr: QrCode
};

const platformLabels = {
  twitter: 'Twitter',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'Email',
  copy: 'Copiar',
  qr: 'QR Code'
};

const platformColors = {
  twitter: 'hover:bg-blue-50 hover:text-blue-600',
  facebook: 'hover:bg-blue-50 hover:text-blue-700',
  linkedin: 'hover:bg-blue-50 hover:text-blue-800',
  whatsapp: 'hover:bg-green-50 hover:text-green-600',
  telegram: 'hover:bg-blue-50 hover:text-blue-500',
  email: 'hover:bg-gray-50 hover:text-gray-700',
  copy: 'hover:bg-gray-50 hover:text-gray-700',
  qr: 'hover:bg-purple-50 hover:text-purple-600'
};

export function ShareButton({
  content,
  platform,
  variant = 'default',
  size = 'md',
  className = '',
  children,
  showIcon = true,
  showLabel = true,
  onClick
}: ShareButtonProps) {
  const { shareToplatform, openShareModal } = useShare();

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (platform && content) {
      try {
        await shareToplatform(content, platform);
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Open share modal if no specific platform or content
      openShareModal(content);
    }
  };

  const Icon = platform ? platformIcons[platform] : Share2;
  const label = platform ? platformLabels[platform] : 'Compartir';
  const colorClass = platform ? platformColors[platform] : 'hover:bg-gray-50';

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`p-2 ${colorClass} ${className}`}
        title={label}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`${colorClass} ${className}`}
    >
      {showIcon && <Icon className="h-4 w-4 mr-2" />}
      {children || (showLabel && label)}
    </Button>
  );
}