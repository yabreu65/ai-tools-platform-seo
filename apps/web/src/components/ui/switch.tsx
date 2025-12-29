'use client';

import { useState } from 'react';

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked = false, onCheckedChange, disabled = false, className = '' }: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(checked);
  
  const isChecked = onCheckedChange ? checked : internalChecked;
  
  const handleToggle = () => {
    if (disabled) return;
    
    if (onCheckedChange) {
      onCheckedChange(!isChecked);
    } else {
      setInternalChecked(!internalChecked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${isChecked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isChecked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}