import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonHover, buttonPress } from "@/lib/animations"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:bg-primary/50",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:bg-destructive/50",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:border-input/50 disabled:bg-background/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:bg-secondary/50",
        ghost: "hover:bg-accent hover:text-accent-foreground disabled:hover:bg-transparent",
        link: "text-primary underline-offset-4 hover:underline disabled:no-underline disabled:text-primary/50",
        
        // Enhanced AI Tools Platform variants with better disabled states
        "tech-blue": 
          "bg-gradient-to-r from-tech-blue-500 to-tech-blue-600 hover:from-tech-blue-600 hover:to-tech-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:from-tech-blue-300 disabled:to-tech-blue-400 disabled:transform-none disabled:shadow-none",
        "ai-purple": 
          "bg-gradient-to-r from-ai-purple-500 to-ai-purple-600 hover:from-ai-purple-600 hover:to-ai-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:from-ai-purple-300 disabled:to-ai-purple-400 disabled:transform-none disabled:shadow-none",
        "seo-teal": 
          "bg-gradient-to-r from-seo-teal-500 to-seo-teal-600 hover:from-seo-teal-600 hover:to-seo-teal-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:from-seo-teal-300 disabled:to-seo-teal-400 disabled:transform-none disabled:shadow-none",
        "success": 
          "bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:from-success-300 disabled:to-success-400 disabled:transform-none disabled:shadow-none",
        "warning": 
          "bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:from-warning-300 disabled:to-warning-400 disabled:transform-none disabled:shadow-none",
        "error": 
          "bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:from-error-300 disabled:to-error-400 disabled:transform-none disabled:shadow-none",
        
        // Enhanced outline variants
        "tech-blue-outline": 
          "border-2 border-tech-blue-300 dark:border-tech-blue-600 bg-tech-blue-50 dark:bg-tech-blue-950 text-tech-blue-700 dark:text-tech-blue-300 hover:bg-tech-blue-100 dark:hover:bg-tech-blue-900 hover:border-tech-blue-400 dark:hover:border-tech-blue-500 disabled:border-tech-blue-200 disabled:bg-tech-blue-25 disabled:text-tech-blue-400",
        "ai-purple-outline": 
          "border-2 border-ai-purple-300 dark:border-ai-purple-600 bg-ai-purple-50 dark:bg-ai-purple-950 text-ai-purple-700 dark:text-ai-purple-300 hover:bg-ai-purple-100 dark:hover:bg-ai-purple-900 hover:border-ai-purple-400 dark:hover:border-ai-purple-500 disabled:border-ai-purple-200 disabled:bg-ai-purple-25 disabled:text-ai-purple-400",
        "seo-teal-outline": 
          "border-2 border-seo-teal-300 dark:border-seo-teal-600 bg-seo-teal-50 dark:bg-seo-teal-950 text-seo-teal-700 dark:text-seo-teal-300 hover:bg-seo-teal-100 dark:hover:bg-seo-teal-900 hover:border-seo-teal-400 dark:hover:border-seo-teal-500 disabled:border-seo-teal-200 disabled:bg-seo-teal-25 disabled:text-seo-teal-400",
        
        // Enhanced gradient combinations
        "primary-gradient": 
          "bg-gradient-to-r from-tech-blue-500 to-ai-purple-600 hover:from-tech-blue-600 hover:to-ai-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:from-tech-blue-300 disabled:to-ai-purple-400 disabled:transform-none disabled:shadow-md",
        "seo-gradient": 
          "bg-gradient-to-r from-seo-teal-500 to-tech-blue-600 hover:from-seo-teal-600 hover:to-tech-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:from-seo-teal-300 disabled:to-tech-blue-400 disabled:transform-none disabled:shadow-md",
        "success-gradient": 
          "bg-gradient-to-r from-success-500 to-seo-teal-600 hover:from-success-600 hover:to-seo-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:from-success-300 disabled:to-seo-teal-400 disabled:transform-none disabled:shadow-md",
        
        // New soft variants for subtle actions
        "soft-tech": 
          "bg-tech-blue-100 dark:bg-tech-blue-900/30 text-tech-blue-700 dark:text-tech-blue-300 hover:bg-tech-blue-200 dark:hover:bg-tech-blue-800/50 border border-tech-blue-200 dark:border-tech-blue-700",
        "soft-purple": 
          "bg-ai-purple-100 dark:bg-ai-purple-900/30 text-ai-purple-700 dark:text-ai-purple-300 hover:bg-ai-purple-200 dark:hover:bg-ai-purple-800/50 border border-ai-purple-200 dark:border-ai-purple-700",
        "soft-teal": 
          "bg-seo-teal-100 dark:bg-seo-teal-900/30 text-seo-teal-700 dark:text-seo-teal-300 hover:bg-seo-teal-200 dark:hover:bg-seo-teal-800/50 border border-seo-teal-200 dark:border-seo-teal-700",
      },
      size: {
        xs: "h-7 rounded px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-lg font-semibold",
        "2xl": "h-14 rounded-xl px-12 text-xl font-semibold",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  animated?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, animated = false, children, disabled, ...props }, ref) => {
    // When using asChild, we can't add loading states or animations
    // as Slot expects only one child element
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    const Comp = "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {loading ? (loadingText || children) : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
