'use client';

import { useState } from 'react';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({ 
  value = [0], 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  disabled = false, 
  className = '' 
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(value);
  
  const currentValue = onValueChange ? value : internalValue;
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = [Number(event.target.value)];
    
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[0]}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
          slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 
          slider-thumb:rounded-full slider-thumb:bg-blue-600 slider-thumb:cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentValue[0] - min) / (max - min)) * 100}%, #e5e7eb ${((currentValue[0] - min) / (max - min)) * 100}%, #e5e7eb 100%)`
        }}
      />
    </div>
  );
}