'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Check } from 'lucide-react';
import { ShareDialog } from './ShareDialog';

interface ShareButtonProps {
  toolName: string;
  title: string;
  data: any;
  description?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  toolName,
  title,
  data,
  description,
  variant = 'primary',
  size = 'md',
  className = '',
  children
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleShare = () => {
    setShowDialog(true);
  };

  const handleShareComplete = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
      case 'outline':
        return 'bg-transparent text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-600';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <>
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          inline-flex items-center gap-2 rounded-lg border transition-all duration-200
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${className}
        `}
      >
        <motion.div
          animate={isShared ? { scale: [1, 1.2, 1], rotate: [0, 360, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {isShared ? (
            <Check className="w-4 h-4" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </motion.div>
        
        {children || (
          <span>
            {isShared ? 'Compartido' : 'Compartir'}
          </span>
        )}
      </motion.button>

      <ShareDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        toolName={toolName}
        title={title}
        data={data}
        description={description}
      />
    </>
  );
};

export default ShareButton;