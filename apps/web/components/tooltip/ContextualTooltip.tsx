'use client';

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ContextualTooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

function ContextualTooltip({ 
  content, 
  children, 
  side = 'top', 
  align = 'center' 
}: ContextualTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || <HelpCircle className="w-4 h-4 text-muted-foreground" />}
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Alias para compatibilidad
const QuickTooltip = ContextualTooltip;

export { ContextualTooltip, QuickTooltip };
export default ContextualTooltip;