"use client";

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils";

const RadioGroup = RadioGroupPrimitive.Root;

const radioGroupItemVariants = cva(
  "h-4 w-4 rounded-full border bg-background shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 
          "border-input hover:border-tech-blue-400 focus:ring-tech-blue-200 dark:focus:ring-tech-blue-800 data-[state=checked]:bg-tech-blue-600 data-[state=checked]:border-tech-blue-600",
        success: 
          "border-input hover:border-success-400 focus:ring-success-200 dark:focus:ring-success-800 data-[state=checked]:bg-success-600 data-[state=checked]:border-success-600",
        warning: 
          "border-input hover:border-warning-400 focus:ring-warning-200 dark:focus:ring-warning-800 data-[state=checked]:bg-warning-600 data-[state=checked]:border-warning-600",
        error: 
          "border-input hover:border-error-400 focus:ring-error-200 dark:focus:ring-error-800 data-[state=checked]:bg-error-600 data-[state=checked]:border-error-600",
        "tech-blue": 
          "border-input hover:border-tech-blue-400 focus:ring-tech-blue-200 dark:focus:ring-tech-blue-800 data-[state=checked]:bg-tech-blue-600 data-[state=checked]:border-tech-blue-600",
        "ai-purple": 
          "border-input hover:border-ai-purple-400 focus:ring-ai-purple-200 dark:focus:ring-ai-purple-800 data-[state=checked]:bg-ai-purple-600 data-[state=checked]:border-ai-purple-600",
        "seo-teal": 
          "border-input hover:border-seo-teal-400 focus:ring-seo-teal-200 dark:focus:ring-seo-teal-800 data-[state=checked]:bg-seo-teal-600 data-[state=checked]:border-seo-teal-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, variant, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants({ variant, className }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full">
        <div className="w-2 h-2 rounded-full bg-white dark:bg-background" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
