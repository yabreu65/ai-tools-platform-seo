'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
    setIsHovering(false);
  };

  const displayRating = isHovering ? hoverRating : rating;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div 
        className="flex items-center space-x-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isPartiallyFilled = star === Math.ceil(displayRating) && displayRating % 1 !== 0;
          
          return (
            <motion.button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              whileHover={readonly ? {} : { scale: 1.1 }}
              whileTap={readonly ? {} : { scale: 0.95 }}
              className={`
                relative transition-colors duration-200 
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                ${!readonly ? 'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded' : ''}
              `}
            >
              <Star
                className={`
                  ${sizeClasses[size]} transition-colors duration-200
                  ${isFilled 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                  }
                  ${!readonly && hoverRating >= star ? 'text-yellow-400 fill-yellow-400' : ''}
                `}
              />
              
              {/* Partial fill for decimal ratings */}
              {isPartiallyFilled && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(displayRating % 1) * 100}%` }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`}
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
      
      {!readonly && isHovering && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-gray-600 dark:text-gray-400 ml-2"
        >
          {hoverRating} estrella{hoverRating !== 1 ? 's' : ''}
        </motion.span>
      )}
    </div>
  );
};

interface RatingDistributionProps {
  distribution: { [key: number]: number };
  totalRatings: number;
  className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  totalRatings,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
        
        return (
          <div key={stars} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 w-12">
              <span className="text-sm text-gray-600 dark:text-gray-400">{stars}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            </div>
            
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-yellow-400 h-2 rounded-full"
              />
            </div>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  distribution: { [key: number]: number };
  className?: string;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  averageRating,
  totalRatings,
  distribution,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} readonly size="lg" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Basado en {totalRatings} valoracion{totalRatings !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>
      
      <RatingDistribution 
        distribution={distribution}
        totalRatings={totalRatings}
      />
    </div>
  );
};

export default StarRating;